import asyncHandler from "express-async-handler";
import DiseaseReport from "../models/diseaseReport.model.js";
import Crop from "../models/crop.model.js";
import Media from "../models/media.model.js";
import { uploadToCloudinary } from "../services/cloudinary.service.js";
import { analyzeCropDisease } from "../services/diseaseDetection.service.js";
import axios from "axios";
import FormData from "form-data";
import { spawn } from "child_process";
import path from "path";
import fs from "fs";
import crypto from "crypto";

const fsPromises = fs.promises;

// ---------------------- ML Server Config ----------------------------
const ML_SERVER_URL = process.env.ML_SERVER_URL || "http://localhost:8000";
const ML_SERVER_HEALTH_PATH = process.env.ML_SERVER_HEALTH_PATH || "/health";
const ML_SERVER_DIR =
  process.env.ML_SERVER_DIR || path.resolve(process.cwd(), "ml_server");
const ML_REQUEST_TIMEOUT =
  Number(process.env.ML_PREDICTION_TIMEOUT_MS) || 30000;
const ML_RETRY_DELAY_MS =
  Number(process.env.ML_PREDICTION_RETRY_DELAY_MS) || 1500;
const ML_RETRY_COUNT = Number(process.env.ML_PREDICTION_RETRY_COUNT) || 3;
const DISEASE_TMP_DIR =
  process.env.DISEASE_TMP_DIR ||
  path.resolve(process.cwd(), "tmp", "disease-reports");

// ---------------------- ML Server Helper ----------------------------
async function pingMLServer() {
  const targets = [
    `${ML_SERVER_URL}${ML_SERVER_HEALTH_PATH}`,
    `${ML_SERVER_URL}/`,
  ];

  for (const target of targets) {
    try {
      await axios.get(target, { timeout: 1500 });
      return true;
    } catch (error) {}
  }

  return false;
}

export async function ensureMLServer() {
  const isRunning = await pingMLServer();
  if (isRunning) return;

  try {
    const mlProcess = spawn("python", ["main.py"], {
      cwd: ML_SERVER_DIR,
      detached: true,
      stdio: "ignore",
      shell: process.platform === "win32",
    });

    mlProcess.unref();
    console.log("ML server started successfully.");
  } catch (error) {
    console.error("Failed to start ML server:", error.message);
  }
}

// ---------------------- Prediction Helpers --------------------------
const createPredictionFormData = ({ filePath, originalName, mimeType, cropName }) => {
  const formData = new FormData();
  formData.append("file", fs.createReadStream(filePath), {
    filename: originalName || "upload.jpg",
    contentType: mimeType || "image/jpeg",
  });

  if (cropName) formData.append("crop", cropName);

  return formData;
};

const requestPrediction = async ({ filePath, originalName, mimeType, cropName }) => {
  let attempt = 0;
  let lastError = null;

  while (attempt < ML_RETRY_COUNT) {
    attempt++;

    try {
      const formData = createPredictionFormData({
        filePath,
        originalName,
        mimeType,
        cropName,
      });

      return await axios.post(`${ML_SERVER_URL}/predict`, formData, {
        headers: formData.getHeaders(),
        timeout: ML_REQUEST_TIMEOUT,
      });
    } catch (error) {
      lastError = error;
      if (attempt < ML_RETRY_COUNT) {
        await new Promise((resolve) => setTimeout(resolve, ML_RETRY_DELAY_MS));
      }
    }
  }

  throw lastError;
};

// -------------------------------------------------------------------
// ✔ CREATE REPORT (Gemini-based)
// -------------------------------------------------------------------
export const createReport = asyncHandler(async (req, res) => {
  const { cropId, reportLanguage } = req.body;

  const crop = await Crop.findById(cropId);
  if (!crop) return res.status(404).json({ message: "Crop not found" });

  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: "Please upload at least one image." });
  }

  // Upload all images to Cloudinary
  const mediaIds = [];

  for (const file of req.files) {
    const upload = await uploadToCloudinary(file, "disease-reports");
    const mediaDoc = await Media.create({ url: upload.secure_url });
    mediaIds.push(mediaDoc._id);
  }

  // Analyze with Gemini
  const analysis = await analyzeCropDisease(
    req.files,
    {
      cropName: crop.name,
      cropVariety: crop.variety,
    },
    reportLanguage || "en"
  );

  const report = await DiseaseReport.create({
    farmer: req.user.id,
    crop: crop._id,
    images: mediaIds,
    reportLanguage,
    analysis,
    reportStatus: "pending_action",
  });

  res.status(201).json({
    message: "Disease report created successfully",
    report,
  });
});

// -------------------------------------------------------------------
// ✔ GET REPORTS BY FARMER
// -------------------------------------------------------------------
export const getFarmerReports = asyncHandler(async (req, res) => {
  const reports = await DiseaseReport.find({ farmer: req.user.id })
    .populate("crop images assignedAgronomist");

  res.json(reports);
});

// -------------------------------------------------------------------
// ✔ MARK REPORT AS TREATED
// -------------------------------------------------------------------
export const markReportTreated = asyncHandler(async (req, res) => {
  const report = await DiseaseReport.findById(req.params.id);

  if (!report || report.farmer.toString() !== req.user.id) {
    return res.status(404).json({ message: "Report not found" });
  }

  report.reportStatus = "treated";
  await report.save();

  res.json({ message: "Report marked as treated", report });
});

// -------------------------------------------------------------------
// ✔ DELETE REPORT
// -------------------------------------------------------------------
export const deleteReport = asyncHandler(async (req, res) => {
  const report = await DiseaseReport.findById(req.params.id);

  if (!report || report.farmer.toString() !== req.user.id) {
    return res.status(404).json({ message: "Report not found" });
  }

  await DiseaseReport.findByIdAndDelete(req.params.id);

  res.json({ message: "Report deleted successfully" });
});

// -------------------------------------------------------------------
// ✔ DETECT DISEASE USING ML FASTAPI SERVER
// -------------------------------------------------------------------
export const detectDiseaseML = asyncHandler(async (req, res) => {
  const { cropName } = req.body;

  if (!req.file) return res.status(400).json({ message: "Please upload an image." });
  if (!cropName) return res.status(400).json({ message: "Please provide crop name." });

  await ensureMLServer();

  const uniqueSuffix =
    (crypto.randomUUID && crypto.randomUUID()) ||
    crypto.randomBytes(6).toString("hex");

  const tempFileName = `${Date.now()}-${uniqueSuffix}-${req.file.originalname || "disease.jpg"}`;
  const tempFilePath = path.join(DISEASE_TMP_DIR, tempFileName);

  try {
    await fsPromises.mkdir(DISEASE_TMP_DIR, { recursive: true });
    await fsPromises.writeFile(tempFilePath, req.file.buffer);

    const mlResponse = await requestPrediction({
      filePath: tempFilePath,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      cropName,
    });

    const mlData = mlResponse.data || {};

    // Extract prediction name
    const prediction =
      mlData.predicted_class ||
      mlData.class ||
      mlData.className ||
      mlData.prediction ||
      mlData.disease ||
      "Unknown";

    // Normalize confidence
    let confidenceValue = parseFloat(mlData.confidence) || 0;
    if (confidenceValue <= 1) confidenceValue *= 100;
    const confidence = Math.round(confidenceValue * 100) / 100;

    // Upload image to Cloudinary
    const cloudinaryResult = await uploadToCloudinary(req.file, "disease-reports");

    const report = await DiseaseReport.create({
      farmer: req.user.id,
      cropName,
      prediction,
      confidence,
      imageURL: cloudinaryResult.secure_url,
      reportStatus: "pending_action",
    });

    res.status(201).json({
      message: "Disease detected successfully",
      report: {
        _id: report._id,
        prediction,
        confidence,
        cropName,
        createdAt: report.createdAt,
        imageURL: report.imageURL,
      },
    });
  } catch (error) {
    console.error("ML Detection Error:", error);

    if (error.response) {
      return res.status(error.response.status || 500).json({
        message: "Failed to get prediction from ML server",
        error: error.response.data,
      });
    }

    return res.status(500).json({
      message: "Failed to process disease detection",
      error: error.message,
    });
  } finally {
    fsPromises.unlink(tempFilePath).catch(() => {});
  }
});
