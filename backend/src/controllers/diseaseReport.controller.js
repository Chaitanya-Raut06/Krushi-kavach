import asyncHandler from "express-async-handler";
import DiseaseReport from "../models/diseaseReport.model.js";
import Crop from "../models/crop.model.js";
import Media from "../models/media.model.js";
import { uploadToCloudinary } from "../services/cloudinary.service.js";
import { analyzeCropDisease } from "../services/diseaseDetection.service.js";

// --- Upload Disease Images and Create Report ---
export const createReport = asyncHandler(async (req, res) => {
    const { cropId, reportLanguage } = req.body;
    const crop = await Crop.findById(cropId);
    if (!crop) return res.status(404).json({ message: 'Crop not found' });

    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: "Please upload at least one image." });
    }
  // Analyze disease using Gemini API
  const analysis = await analyzeCropDisease(req.files, {
    cropName: crop.name,
    cropVariety: crop.variety,
  }, reportLanguage || "en");

  const report = await DiseaseReport.create({
    farmer: req.user.id,
    crop: crop._id,
    images: mediaIds,
    reportLanguage,
    analysis,
  });

  res.status(201).json({ message: "Disease report created", report });
});

// --- Get Farmer Reports ---
export const getFarmerReports = asyncHandler(async (req, res) => {
  const reports = await DiseaseReport.find({ farmer: req.user.id })
    .populate("crop images assignedAgronomist");
  res.json(reports);
});

// --- Mark Report as Treated ---
export const markReportTreated = asyncHandler(async (req, res) => {
  const report = await DiseaseReport.findById(req.params.id);
  if (!report || report.farmer.toString() !== req.user.id)
    return res.status(404).json({ message: "Report not found" });

  report.reportStatus = "treated";
  await report.save();
  res.json({ message: "Report marked as treated", report });
});
