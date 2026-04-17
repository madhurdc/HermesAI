import express from "express";
import { requireAuth } from "../middleware/authMiddleware.js";
import {
  startInterview,
  submitAnswer,
  completeInterview,
  getReportPDF,
  interviewTTS,
  getHistory,
} from "../controller/interviewController.js";

const router = express.Router();

router.post("/start", requireAuth, startInterview);
router.post("/answer", requireAuth, submitAnswer);
router.post("/complete", requireAuth, completeInterview);
router.get("/report/:sessionId/pdf", requireAuth, getReportPDF);
router.post("/tts", requireAuth, interviewTTS);
router.get("/history", requireAuth, getHistory);

export default router;
