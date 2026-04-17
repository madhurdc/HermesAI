import supabase from "../config/supabaseClient.js";
import {
  careerChat as geminiCareerChat,
  generateCareerRecommendations,
  extractUserFeatures,
  generateCareerQuestions
} from "../services/geminiService.js";

/**
 * GET /api/career/questions
 * Generate 10 multiple-choice questions for career assessment.
 */
export const getQuestions = async (req, res) => {
  try {
    const hardcodedQuestions = [
      {
        question: "What is your primary age group?",
        options: ["Under 18", "18-24", "25-34", "35-44", "Other (Specify)"]
      },
      {
        question: "What is your highest level of education completed?",
        options: ["High School", "Bachelor's Degree", "Master's Degree", "PhD", "Other (Specify)"]
      },
      {
        question: "Which type of tasks do you enjoy the most?",
        options: ["Analyzing data/solving logic puzzles", "Designing or creating visual art", "Communicating and leading teams", "Building or fixing physical/digital things", "Other (Specify)"]
      },
      {
        question: "What environment do you prefer to work in?",
        options: ["Corporate office", "Remote/Work from anywhere", "Outdoors or traveling", "Laboratory or technical workspace", "Other (Specify)"]
      },
      {
        question: "How do you prefer to handle problems?",
        options: ["Look for analytical or mathematical solutions", "Brainstorm creative approaches", "Collaborate with others to find a consensus", "Follow established protocols", "Other (Specify)"]
      },
      {
        question: "Which of these soft skills best represents you?",
        options: ["Public speaking & presentation", "Critical thinking & analysis", "Empathy & active listening", "Adaptability & quick learning", "Other (Specify)"]
      },
      {
        question: "What field most closely aligns with your current hard skills?",
        options: ["Software & Technology", "Finance & Mathematics", "Healthcare & Sciences", "Arts & Literature", "Other (Specify)"]
      },
      {
        question: "What motivates you the most in a professional setting?",
        options: ["Financial success and scaling", "Helping others and social impact", "Innovation and pioneering", "Stability and routine", "Other (Specify)"]
      },
      {
        question: "Which of the following topics do you naturally gravitate toward reading about?",
        options: ["New technological advancements", "Stock markets, business, or economics", "Psychology or human behavior", "Arts, culture, and history", "Other (Specify)"]
      },
      {
        question: "In a team project, which role do you typically assume?",
        options: ["The Leader (coordinating efforts)", "The Analyst (handling data/research)", "The Creator (designing the output)", "The Executor (getting the specific tasks done)", "Other (Specify)"]
      }
    ];
    return res.status(200).json({ questions: hardcodedQuestions });
  } catch (err) {
    console.error("Career getQuestions error:", err);
    return res.status(500).json({ error: "Failed to fetch career questions: " + err.message });
  }
};

/**
 * POST /api/career/chat
 * Send a message in a career guidance conversation.
 */
export const chat = async (req, res) => {
  try {
    const { session_id, message, conversation_history } = req.body;
    const userId = req.user.id;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // Build conversation history for Gemini
    const history = conversation_history || [];
    history.push({ role: "user", content: message });

    // Get AI response from Gemini
    const aiResponse = await geminiCareerChat(history);

    // If session exists, update it; otherwise create new
    let sessionId = session_id;

    if (!sessionId) {
      const { data, error } = await supabase
        .from("career_sessions")
        .insert({
          user_id: userId,
          messages: [...history, { role: "ai", content: aiResponse }],
        })
        .select("id")
        .single();

      if (error) {
        console.error("Supabase insert error:", error);
      } else {
        sessionId = data.id;
      }
    } else {
      // Update existing session
      const { error } = await supabase
        .from("career_sessions")
        .update({
          messages: [...history, { role: "ai", content: aiResponse }],
        })
        .eq("id", sessionId)
        .eq("user_id", userId);

      if (error) {
        console.error("Supabase update error:", error);
      }
    }

    return res.status(200).json({
      session_id: sessionId,
      response: aiResponse,
    });
  } catch (err) {
    console.error("Career chat error:", err);
    return res.status(500).json({ error: "Failed to get career advice: " + err.message });
  }
};

/**
 * POST /api/career/recommend
 * Generate structured career recommendations from conversation.
 */
export const recommend = async (req, res) => {
  try {
    const { session_id, conversation_history } = req.body;
    const userId = req.user.id;

    if (!conversation_history || conversation_history.length === 0) {
      return res.status(400).json({ error: "Conversation history is required" });
    }

    // 1. Extract features using Gemini
    const userFeatures = await extractUserFeatures(conversation_history);
    console.log("Extracted Features for ML:", userFeatures);

    // 2. Fetch from Python ML Service
    let mlPredictions = [];
    try {
      const mlResponse = await fetch("http://127.0.0.1:5001/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userFeatures),
      });
      
      if (mlResponse.ok) {
        const mlData = await mlResponse.json();
        mlPredictions = mlData.recommendations || [];
        console.log("ML Predictions:", mlPredictions);
      } else {
        console.warn("ML Service returned error code:", mlResponse.status);
      }
    } catch (fetchErr) {
      console.warn("Failed to reach ML service. Falling back to Gemini only.", fetchErr.message);
    }

    // 3. Generate structured recommendations from Gemini incorporating ML predictions
    const recommendations = await generateCareerRecommendations(conversation_history, mlPredictions);

    // Update session with recommendations if session exists
    if (session_id) {
      const { error } = await supabase
        .from("career_sessions")
        .update({ recommendations })
        .eq("id", session_id)
        .eq("user_id", userId);

      if (error) {
        console.error("Supabase update error:", error);
      }
    }

    return res.status(200).json(recommendations);
  } catch (err) {
    console.error("Career recommend error:", err);
    return res.status(500).json({ error: "Failed to generate recommendations: " + err.message });
  }
};

/**
 * GET /api/career/history
 * Get past career guidance sessions.
 */
export const getCareerHistory = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data, error } = await supabase
      .from("career_sessions")
      .select("id, created_at, messages, recommendations")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      return res.status(500).json({ error: "Failed to fetch history" });
    }

    return res.status(200).json({ sessions: data });
  } catch (err) {
    console.error("Career history error:", err);
    return res.status(500).json({ error: "Failed to fetch history" });
  }
};
