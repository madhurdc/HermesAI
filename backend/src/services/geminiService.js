import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

/**
 * Generate 10 interview questions based on domain and difficulty.
 */
export async function generateInterviewQuestions(domain, difficulty) {
  const prompt = `You are an expert interviewer. Generate exactly 10 interview questions for a ${difficulty}-level candidate in the ${domain} domain.

Rules:
- Mix technical and behavioral questions appropriate for the ${difficulty} level.
- Questions should progressively increase in complexity.
- Return ONLY a valid JSON array of 10 strings, no markdown, no explanation.

Example output format:
["Question 1?", "Question 2?", ...]`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();

  // Extract JSON array from the response
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    throw new Error("Failed to parse questions from Gemini response");
  }

  const questions = JSON.parse(jsonMatch[0]);
  if (!Array.isArray(questions) || questions.length !== 10) {
    throw new Error("Gemini did not return exactly 10 questions");
  }

  return questions;
}

/**
 * Analyze all interview answers and produce a detailed performance report.
 * qaPairs: [{ question: string, answer: string }, ...]
 */
export async function analyzeInterviewAnswers(domain, difficulty, qaPairs) {
  const qaPairsText = qaPairs
    .map((qa, i) => `Q${i + 1}: ${qa.question}\nA${i + 1}: ${qa.answer}`)
    .join("\n\n");

  const prompt = `You are an expert interview evaluator. Analyze the following ${domain} interview (${difficulty} level) and provide a detailed performance report.

Interview Transcript:
${qaPairsText}

Return ONLY a valid JSON object with this exact structure (no markdown, no explanation):
{
  "overall_score": <number 0-100>,
  "mastery_level": "<string: Low/Medium/High/Expert>",
  "summary": "<2-3 sentence overall assessment>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "improvements": ["<improvement 1>", "<improvement 2>", "<improvement 3>"],
  "question_scores": [
    {
      "question_number": 1,
      "score": <number 0-10>,
      "feedback": "<specific feedback for this answer>",
      "suggestion": "<how to improve this answer>"
    }
  ],
  "tips": ["<actionable tip 1>", "<actionable tip 2>", "<actionable tip 3>"]
}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Failed to parse report from Gemini response");
  }

  return JSON.parse(jsonMatch[0]);
}

/**
 * Analyze a resume text and produce ATS score + detailed feedback.
 */
export async function analyzeResume(resumeText) {
  const prompt = `You are an expert ATS (Applicant Tracking System) resume analyzer and career coach. Analyze the following resume thoroughly.

Resume Content:
${resumeText}

Return ONLY a valid JSON object with this exact structure (no markdown, no explanation):
{
  "ats_score": <number 0-100>,
  "score_breakdown": {
    "formatting": <number 0-100>,
    "keywords": <number 0-100>,
    "experience": <number 0-100>,
    "education": <number 0-100>,
    "skills": <number 0-100>
  },
  "missing_keywords": ["<keyword 1>", "<keyword 2>", ...],
  "strengths": ["<strength 1>", "<strength 2>", ...],
  "weaknesses": ["<weakness 1>", "<weakness 2>", ...],
  "suggestions": ["<suggestion 1>", "<suggestion 2>", ...],
  "summary": "<2-3 sentence overall assessment of the resume>"
}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Failed to parse resume analysis from Gemini response");
  }

  return JSON.parse(jsonMatch[0]);
}

/**
 * Chat with Gemini for career guidance. Maintains conversation context.
 * conversationHistory: [{ role: 'user'|'ai', content: string }, ...]
 */
export async function careerChat(conversationHistory) {
  const historyText = conversationHistory
    .map((msg) => `${msg.role === "user" ? "User" : "Advisor"}: ${msg.content}`)
    .join("\n");

  const prompt = `You are Hermes, an expert career advisor AI. You help users discover their ideal career path based on their interests, skills, and background.

Conversation so far:
${historyText}

Respond naturally as the career advisor. Be insightful, encouraging, and ask follow-up questions to better understand the user. Keep responses concise (2-4 sentences). Do NOT return JSON — just respond conversationally.`;

  const result = await model.generateContent(prompt);
  return result.response.text().trim();
}

/**
 * Generate structured career recommendations from the conversation.
 */
export async function generateCareerRecommendations(conversationHistory) {
  const historyText = conversationHistory
    .map((msg) => `${msg.role === "user" ? "User" : "Advisor"}: ${msg.content}`)
    .join("\n");

  const prompt = `You are an expert career advisor. Based on the following conversation, generate personalized career recommendations.

Conversation:
${historyText}

Return ONLY a valid JSON object with this exact structure (no markdown, no explanation):
{
  "recommendations": [
    {
      "name": "<Career Title>",
      "match": <number 0-100>,
      "description": "<Why this career fits based on the conversation>",
      "skills_needed": ["<skill1>", "<skill2>", "<skill3>"],
      "next_steps": ["<step1>", "<step2>"]
    }
  ],
  "summary": "<Overall career direction advice based on the conversation>"
}

Return 3-5 career recommendations sorted by match percentage (highest first).`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Failed to parse recommendations from Gemini response");
  }

  return JSON.parse(jsonMatch[0]);
}
