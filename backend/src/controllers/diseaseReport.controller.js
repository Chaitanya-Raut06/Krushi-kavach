import asyncHandler from "express-async-handler";
import DiseaseReport from "../models/diseaseReport.model.js";
import Crop from "../models/crop.model.js";
import Media from "../models/media.model.js";
import { uploadToCloudinary } from "../services/cloudinary.service.js";
import { analyzeCropDisease } from "../services/diseaseDetection.service.js";
import axios from "axios";
import FormData from "form-data";
import crypto from "crypto";

// --------------------------------------------------------------
// 🌐 ML SERVER CONFIG (Use Render Deployment)
// --------------------------------------------------------------
const ML_SERVER_URL = process.env.ML_SERVER_URL || "https://krushi-ml-service.onrender.com";

// --------------------------------------------------------------
// ✔ PREDICTION REQUEST TO ML FASTAPI SERVER
// --------------------------------------------------------------
const requestPrediction = async ({ buffer, originalName, mimeType, cropName }) => {
  const formData = new FormData();

  formData.append("file", buffer, {
    filename: originalName || "upload.jpg",
    contentType: mimeType || "image/jpeg",
  });

  if (cropName) formData.append("crop", cropName);

  return axios.post(`${ML_SERVER_URL}/predict`, formData, {
    headers: formData.getHeaders(),
    timeout: 30000,
  });
};

// --------------------------------------------------------------
// ✔ CREATE REPORT USING GEMINI
// --------------------------------------------------------------
export const createReport = asyncHandler(async (req, res) => {
  const { cropId, reportLanguage } = req.body;

  const crop = await Crop.findById(cropId);
  if (!crop) return res.status(404).json({ message: "Crop not found" });

  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: "Please upload images." });
  }

  // Upload images
  const mediaIds = [];
  for (const file of req.files) {
    const upload = await uploadToCloudinary(file, "disease-reports");
    const mediaDoc = await Media.create({ url: upload.secure_url });
    mediaIds.push(mediaDoc._id);
  }

  // Gemini analysis
  const analysis = await analyzeCropDisease(
    req.files,
    { cropName: crop.name, cropVariety: crop.variety },
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

  res.status(201).json({ message: "Report created", report });
});

// --------------------------------------------------------------
// ✔ GET REPORTS OF FARMER
// --------------------------------------------------------------
export const getFarmerReports = asyncHandler(async (req, res) => {
  const reports = await DiseaseReport.find({ farmer: req.user.id })
    .populate("crop images assignedAgronomist");

  res.json(reports);
});

// --------------------------------------------------------------
// ✔ MARK REPORT AS TREATED
// --------------------------------------------------------------
export const markReportTreated = asyncHandler(async (req, res) => {
  const report = await DiseaseReport.findById(req.params.id);

  if (!report || report.farmer.toString() !== req.user.id) {
    return res.status(404).json({ message: "Report not found" });
  }

  report.reportStatus = "treated";
  await report.save();

  res.json({ message: "Report marked as treated", report });
});

// --------------------------------------------------------------
// ✔ DELETE REPORT
// --------------------------------------------------------------
export const deleteReport = asyncHandler(async (req, res) => {
  const report = await DiseaseReport.findById(req.params.id);

  if (!report || report.farmer.toString() !== req.user.id) {
    return res.status(404).json({ message: "Report not found" });
  }

  await DiseaseReport.findByIdAndDelete(req.params.id);

  res.json({ message: "Report deleted successfully" });
});

// --------------------------------------------------------------
// 🌾 ✔ DISEASE DETECTION USING ML (Render-Friendly)
// --------------------------------------------------------------
export const detectDiseaseML = asyncHandler(async (req, res) => {
  const { cropName } = req.body;

  if (!req.file) return res.status(400).json({ message: "Please upload an image." });
  if (!cropName) return res.status(400).json({ message: "Provide crop name." });

  try {
    // ---- ML Prediction (Direct to Render ML Server) ----
    const mlResponse = await requestPrediction({
      buffer: req.file.buffer,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      cropName,
    });

    const mlData = mlResponse.data;

    const prediction =
      mlData.predicted_class ||
      mlData.class ||
      mlData.disease ||
      "Unknown";

    // Normalize confidence
    let conf = parseFloat(mlData.confidence || 0);
    if (conf <= 1) conf = conf * 100;
    const confidence = Number(conf.toFixed(2));

    // ---- Upload Image to Cloudinary ----
    const cloudinaryResult = await uploadToCloudinary(req.file, "disease-reports");

    const report = await DiseaseReport.create({
      farmer: req.user.id,
      cropName,
      prediction,
      confidence,
      imageURL: cloudinaryResult.secure_url,
      reportStatus: "pending_action",
    });

    res.json({
      message: "Disease detected",
      report: {
        _id: report._id,
        prediction,
        confidence,
        cropName,
        imageURL: report.imageURL,
        createdAt: report.createdAt,
      },
    });
  } catch (error) {
    console.log("ML Error:", error);
    return res.status(500).json({
      message: "ML prediction failed",
      error: error.message,
    });
  }
});
