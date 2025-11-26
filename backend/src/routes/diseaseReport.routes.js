import express from "express";
import { createReport, getFarmerReports, markReportTreated } from "../controllers/diseaseReport.controller.js";
import { protect, authorizeRoles } from "../middleware/auth.middleware.js";
import { uploadMultiple } from "../middleware/upload.middleware.js";

const router = express.Router();

router.use(protect);
router.use(authorizeRoles("farmer"));

router.post("/", uploadMultiple("images"), createReport);
router.get("/", getFarmerReports);
router.put("/:id/mark-treated", markReportTreated);

export default router;
