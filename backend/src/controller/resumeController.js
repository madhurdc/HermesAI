import supabase from "../config/supabaseClient.js";
import { analyzeResume } from "../services/geminiService.js";
import { generateResumeReportPDF } from "../utils/pdfGenerator.js";
import pdfParse from "pdf-parse";

/**
 * POST /api/resume/analyze
 * Upload a PDF resume and get Gemini analysis.
 * Expects multipart/form-data with field "resume" (PDF file).
 */
export const analyzeResumeController = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    if (req.file.mimetype !== "application/pdf") {
      return res.status(400).json({ error: "Only PDF files are accepted" });
    }

    // Extract text from PDF
    const pdfData = await pdfParse(req.file.buffer);
    const resumeText = pdfData.text;

    if (!resumeText || resumeText.trim().length < 50) {
      return res.status(400).json({ error: "Could not extract enough text from the PDF. Please upload a text-based PDF (not scanned)." });
    }

    // Analyze with Gemini
    const report = await analyzeResume(resumeText);

    // Save to Supabase
    const { data: review, error } = await supabase
      .from("resume_reviews")
      .insert({
        user_id: userId,
        filename: req.file.originalname,
        ats_score: report.ats_score,
        report,
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      // Still return the report even if DB save fails
    }

    return res.status(200).json({
      review_id: review?.id || null,
      ...report,
    });
  } catch (err) {
    console.error("Resume analysis error:", err);
    return res.status(500).json({ error: "Failed to analyze resume: " + err.message });
  }
};

/**
 * GET /api/resume/report/:reviewId/pdf
 * Download the resume analysis as a PDF.
 */
export const getResumeReportPDF = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user.id;

    const { data: review, error } = await supabase
      .from("resume_reviews")
      .select("*")
      .eq("id", reviewId)
      .eq("user_id", userId)
      .single();

    if (error || !review) {
      return res.status(404).json({ error: "Review not found" });
    }

    const pdfBuffer = await generateResumeReportPDF(review.report, review.filename);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="hermes-resume-report-${reviewId}.pdf"`);
    return res.send(pdfBuffer);
  } catch (err) {
    console.error("Resume PDF error:", err);
    return res.status(500).json({ error: "Failed to generate PDF" });
  }
};

/**
 * GET /api/resume/history
 * Get all past resume reviews for the current user.
 */
export const getResumeHistory = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data, error } = await supabase
      .from("resume_reviews")
      .select("id, filename, ats_score, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      return res.status(500).json({ error: "Failed to fetch history" });
    }

    return res.status(200).json({ reviews: data });
  } catch (err) {
    console.error("Resume history error:", err);
    return res.status(500).json({ error: "Failed to fetch history" });
  }
};
