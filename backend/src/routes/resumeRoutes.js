import express from "express";
const router = express.Router();

router.post("/upload", requireAuth, uploadResume);
router.get("/retrieve", requireAuth, getResume);