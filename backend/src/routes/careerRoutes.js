import express from "express";
import { requireAuth } from "../middleware/authMiddleware.js";
import { chat, recommend, getCareerHistory, getQuestions } from "../controller/careerController.js";

const router = express.Router();

router.get("/questions", requireAuth, getQuestions);
router.post("/chat", requireAuth, chat);
router.post("/recommend", requireAuth, recommend);
router.get("/history", requireAuth, getCareerHistory);

export default router;
