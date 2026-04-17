import express from "express";
import { requireAuth } from "../middleware/authMiddleware.js";
import { chat, recommend, getCareerHistory } from "../controller/careerController.js";

const router = express.Router();

router.post("/chat", requireAuth, chat);
router.post("/recommend", requireAuth, recommend);
router.get("/history", requireAuth, getCareerHistory);

export default router;
