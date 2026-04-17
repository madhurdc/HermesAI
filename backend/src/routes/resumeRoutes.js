import express from "express";
import multer from "multer";
import { requireAuth } from "../middleware/authMiddleware.js";
import {
  analyzeResumeController,
  getResumeReportPDF,
  getResumeHistory,
} from "../controller/resumeController.js";

const router = express.Router();

// Multer config — store in memory (buffers), max 10MB
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are accepted"), false);
    }
  },
});

router.post("/analyze", requireAuth, upload.single("resume"), analyzeResumeController);
router.get("/report/:reviewId/pdf", requireAuth, getResumeReportPDF);
router.get("/history", requireAuth, getResumeHistory);

export default router;