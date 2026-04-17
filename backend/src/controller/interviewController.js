import supabase from "../config/supabaseClient.js";
import {
  generateInterviewQuestions,
  analyzeInterviewAnswers,
} from "../services/geminiService.js";
import { textToSpeech } from "../services/elevenLabsService.js";
import { generateInterviewReportPDF } from "../utils/pdfGenerator.js";

/**
 * POST /api/interview/start
 * Start a new interview session. Gemini generates 10 questions.
 */
export const startInterview = async (req, res) => {
  try {
    const { domain, difficulty, mode } = req.body;
    const userId = req.user.id;

    if (!domain || !difficulty) {
      return res.status(400).json({ error: "Domain and difficulty are required" });
    }

    // Generate questions from Gemini
    const questions = await generateInterviewQuestions(domain, difficulty);

    // Save session to Supabase
    const { data: session, error } = await supabase
      .from("interview_sessions")
      .insert({
        user_id: userId,
        domain,
        difficulty,
        mode: mode || "text",
        questions,
        status: "in_progress",
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      return res.status(500).json({ error: "Failed to create session" });
    }

    return res.status(201).json({
      session_id: session.id,
      questions,
    });
  } catch (err) {
    console.error("Start interview error:", err);
    return res.status(500).json({ error: "Failed to start interview: " + err.message });
  }
};

/**
 * POST /api/interview/answer
 * Submit an answer for a specific question in a session.
 */
export const submitAnswer = async (req, res) => {
  try {
    const { session_id, question_index, question, answer } = req.body;
    const userId = req.user.id;

    if (!session_id || question_index === undefined || !question || !answer) {
      return res.status(400).json({ error: "session_id, question_index, question, and answer are required" });
    }

    // Verify session ownership
    const { data: session, error: sessionError } = await supabase
      .from("interview_sessions")
      .select("id")
      .eq("id", session_id)
      .eq("user_id", userId)
      .single();

    if (sessionError || !session) {
      return res.status(404).json({ error: "Session not found" });
    }

    // Store the answer
    const { data, error } = await supabase
      .from("interview_answers")
      .insert({
        session_id,
        question_index,
        question,
        answer,
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      return res.status(500).json({ error: "Failed to save answer" });
    }

    return res.status(200).json({ success: true, answer_id: data.id });
  } catch (err) {
    console.error("Submit answer error:", err);
    return res.status(500).json({ error: "Failed to submit answer" });
  }
};

/**
 * POST /api/interview/complete
 * Complete the interview, send all Q&A pairs to Gemini for analysis.
 */
export const completeInterview = async (req, res) => {
  try {
    const { session_id } = req.body;
    const userId = req.user.id;

    // Fetch session
    const { data: session, error: sessionError } = await supabase
      .from("interview_sessions")
      .select("*")
      .eq("id", session_id)
      .eq("user_id", userId)
      .single();

    if (sessionError || !session) {
      return res.status(404).json({ error: "Session not found" });
    }

    // Fetch all answers for this session
    const { data: answers, error: answersError } = await supabase
      .from("interview_answers")
      .select("*")
      .eq("session_id", session_id)
      .order("question_index", { ascending: true });

    if (answersError) {
      return res.status(500).json({ error: "Failed to fetch answers" });
    }

    // Build Q&A pairs
    const qaPairs = answers.map((a) => ({
      question: a.question,
      answer: a.answer,
    }));

    // Analyze with Gemini
    const report = await analyzeInterviewAnswers(session.domain, session.difficulty, qaPairs);

    // Update session with results
    const { error: updateError } = await supabase
      .from("interview_sessions")
      .update({
        status: "completed",
        overall_score: report.overall_score,
        report,
      })
      .eq("id", session_id);

    if (updateError) {
      console.error("Update session error:", updateError);
    }

    return res.status(200).json({ report });
  } catch (err) {
    console.error("Complete interview error:", err);
    return res.status(500).json({ error: "Failed to complete interview: " + err.message });
  }
};

/**
 * GET /api/interview/report/:sessionId/pdf
 * Download a PDF of the interview performance report.
 */
export const getReportPDF = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.id;

    const { data: session, error } = await supabase
      .from("interview_sessions")
      .select("*")
      .eq("id", sessionId)
      .eq("user_id", userId)
      .single();

    if (error || !session) {
      return res.status(404).json({ error: "Session not found" });
    }

    if (!session.report) {
      return res.status(400).json({ error: "Report not yet generated" });
    }

    const { data: answers } = await supabase
      .from("interview_answers")
      .select("*")
      .eq("session_id", sessionId)
      .order("question_index", { ascending: true });

    const qaPairs = answers ? answers.map(a => ({ question: a.question, answer: a.answer })) : [];

    const pdfBuffer = await generateInterviewReportPDF(
      session.report,
      session.domain,
      session.difficulty,
      qaPairs
    );

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="hermes-interview-report-${sessionId}.pdf"`);
    return res.send(pdfBuffer);
  } catch (err) {
    console.error("Get report PDF error:", err);
    return res.status(500).json({ error: "Failed to generate PDF" });
  }
};

/**
 * POST /api/interview/tts
 * Convert question text to speech using ElevenLabs.
 */
export const interviewTTS = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }

    const audioBuffer = await textToSpeech(text);

    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Content-Length", audioBuffer.length);
    return res.send(audioBuffer);
  } catch (err) {
    console.error("TTS error:", err);
    return res.status(500).json({ error: "Failed to generate speech: " + err.message });
  }
};

/**
 * GET /api/interview/history
 * Get all past interview sessions for the current user.
 */
export const getHistory = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data, error } = await supabase
      .from("interview_sessions")
      .select("id, domain, difficulty, mode, status, overall_score, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      return res.status(500).json({ error: "Failed to fetch history" });
    }

    return res.status(200).json({ sessions: data });
  } catch (err) {
    console.error("Get history error:", err);
    return res.status(500).json({ error: "Failed to fetch history" });
  }
};
