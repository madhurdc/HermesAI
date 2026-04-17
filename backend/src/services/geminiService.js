import ModelClient from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";
import dotenv from "dotenv";

dotenv.config();

const client = new ModelClient(
  "https://models.github.ai/inference",
  new AzureKeyCredential(process.env.GITHUB_TOKEN)
);
const MODEL_NAME = "gpt-4o-mini";



// Utility function to call GitHub Models
async function generate(prompt, isJson = false) {
  try {
    const payloadBody = {
      messages: [
        { role: "system", content: "You are a helpful assistant that provides short, direct responses. If requested, strictly output only valid JSON without markdown wrapping." },
        { role: "user", content: prompt }
      ],
      model: MODEL_NAME,
    };

    if (isJson) {
      payloadBody.response_format = { type: "json_object" };
    }

    const response = await client.path("/chat/completions").post({
      body: payloadBody
    });

    if (response.status !== "200") {
      throw new Error(`GitHub Models API call failed with status: ${response.status}`);
    }

    return response.body.choices[0].message.content.trim();
  } catch (error) {
    console.error("AI Generation Error:", error);
    throw error;
  }
}

/**
 * Generate 10 interview questions based on domain and difficulty.
 */
export async function generateInterviewQuestions(domain, difficulty) {
  const prompt = `You are an expert interviewer. Generate exactly 10 interview questions for a ${difficulty}-level candidate in the ${domain} domain.

Rules:
- Mix technical and behavioral questions appropriate for the ${difficulty} level.
- Questions should progressively increase in complexity.
- IMPORTANT: Make EVERY question conversational, as if spoken aloud by a real human interviewer. Use NEUTRAL filler phrases ("Okay, moving on", "Alright, let's pivot to", "Now, tell me about"). DO NOT include any encouraging, discouraging, or judgmental remarks about their previous answer. Maintain a professional, neutral tone.
- IMPORTANT: Make the first question start with a natural personalized greeting ("Hello there! I'm your interviewer today. Let's start with...").
- Return ONLY a valid JSON array of exactly 10 string questions, no markdown, no explanation.

Example output format:
["Hello there! I'm your interviewer today... First question...", "Alright, let's move on to...", "Great. Now typically in a real environment we face... how would you..."]`;

  const text = await generate(prompt, true);

  // Extract JSON array from the response
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    throw new Error("Failed to parse questions from AI response");
  }

  const questions = JSON.parse(jsonMatch[0]);
  if (!Array.isArray(questions) || questions.length !== 10) {
    throw new Error("AI did not return exactly 10 questions");
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

CRITICAL: You MUST evaluate EVERY SINGLE ONE of the 10 questions provided above. Do not skip any. Limit your specific feedback to a concise one-liner for each answer to keep the total payload extremely tight (under 2 printed pages).

Return ONLY a valid JSON object with this exact structure (no markdown, no explanation):
{
  "overall_score": <number 0-100>,
  "mastery_level": "<string: Low/Medium/High/Expert>",
  "summary": "<A very succinct 2-sentence basic summary of overall performance>",
  "strengths": ["<strength 1>", "<strength 2>"],
  "improvements": ["<improvement 1>", "<improvement 2>"],
  "question_scores": [
    {
      "question_number": 1,
      "score": <number 0-10>,
      "feedback": "<Concise 1-liner feedback>",
      "suggestion": "<Concise 1-liner improvement suggestion>"
    }
  ],
  "tips": ["<actionable tip 1>", "<actionable tip 2>"]
}`;

  const text = await generate(prompt, true);

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Failed to parse report from AI response");
  }

  let parsedResult;
  try {
    parsedResult = JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error("CRITICAL JSON PARSE ERROR:");
    console.error("Offending string:", jsonMatch[0]);
    throw error;
  }
  return parsedResult;
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

  const text = await generate(prompt, true);

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Failed to parse resume analysis from AI response");
  }

  return JSON.parse(jsonMatch[0]);
}

/**
 * Chat with AI for career guidance. Maintains conversation context.
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

  const text = await generate(prompt);
  return text;
}

/**
 * Generate 10 Multiple Choice Questions to extract career profile details.
 */
export async function generateCareerQuestions() {
  const prompt = `You are an expert career guidance system. Generate exactly 10 multiple-choice questions designed to extract a user's age bracket, education level, current skills, and professional interests.

Rules:
- Exactly 10 questions.
- Each question MUST have exactly 5 options.
- The 5th option MUST always be "Other (Specify)".
- Topics must cover: Age, Education, Soft Skills, Hard Skills, Work Environment Preferences, and Interests.
- Return ONLY a valid JSON array of objects, no markdown, no explanation.

Example format:
[
  {
    "question": "What is your highest level of education?",
    "options": ["High School", "Bachelor's Degree", "Master's Degree", "PhD", "Other (Specify)"]
  }
]`;

  const text = await generate(prompt, true);

  // Extract JSON array from the response
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    throw new Error("Failed to parse career questions from AI response");
  }

  return JSON.parse(jsonMatch[0]);
}

/**
 * Extract structured user features from the conversation needed for the ML model.
 */
export async function extractUserFeatures(conversationHistory) {
  const historyText = conversationHistory
    .map((msg) => `${msg.role === "user" ? "User" : "Advisor"}: ${msg.content}`)
    .join("\n");

  const prompt = `You are a data extraction assistant. Based on the career guidance conversation below, extract the user's demographic and professional information to feed into a Career Recommendation Machine Learning model.

Conversation:
${historyText}

Return ONLY a valid JSON object with the following exact structure (no markdown, no explanation). Make educated guesses where context implies it, but use reasonable defaults if completely unknown:
{
  "age": <number, default to 22 if unknown>,
  "education": "<string, generic level like 'Bachelor', 'Master', 'High School', default 'Bachelor'>",
  "skills": "<string, comma separated list of all mentioned skills, e.g. 'Python, React, Design'>",
  "interests": "<string, comma separated list of all mentioned interests>"
}`;

  const text = await generate(prompt, true);

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Failed to parse extracted features from AI response");
  }

  return JSON.parse(jsonMatch[0]);
}

/**
 * Generate structured career recommendations using both the conversation context AND the ML Model predictions.
 */
export async function generateCareerRecommendations(conversationHistory, mlPredictions = []) {
  const historyText = conversationHistory
    .map((msg) => `${msg.role === "user" ? "User" : "Advisor"}: ${msg.content}`)
    .join("\n");

  // Format ML predictions for the prompt
  const mlContext = mlPredictions.length > 0 
    ? `\nThe Machine Learning model has predicted the following top careers for this user (with match percentages):\n` + mlPredictions.map(p => `- ${p.career} (${(p.score * 100).toFixed(1)}%)`).join("\n")
    : "";

  const prompt = `You are an expert career advisor. Based on the following conversation${mlPredictions.length > 0 ? " AND the ML model prediction results" : ""}, generate personalized career recommendations.

Conversation:
${historyText}
${mlContext}

Return ONLY a valid JSON object with this exact structure (no markdown, no explanation):
{
  "recommendations": [
    {
      "name": "<Career Title>",
      "match": <number 0-100>,
      "description": "<Why this career fits based on the conversation and/or ML model>",
      "skills_needed": ["<skill1>", "<skill2>", "<skill3>"],
      "next_steps": ["<step1>", "<step2>"]
    }
  ],
  "summary": "<Overall career direction advice based on the conversation>"
}

${mlPredictions.length > 0 ? "IMPORTANT: Ensure you include and write detailed descriptions for the careers recommended by the ML model. You may adjust the match percentage slightly to reflect the conversation better, but prioritize the ML predictions!" : "Return 3-5 career recommendations sorted by match percentage (highest first)."}
`;

  const text = await generate(prompt, true);

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Failed to parse recommendations from AI response");
  }

  return JSON.parse(jsonMatch[0]);
}
