import supabase from "../config/supabaseClient.js";
import {
  careerChat as geminiCareerChat,
  generateCareerRecommendations,
} from "../services/geminiService.js";

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

    const recommendations = await generateCareerRecommendations(conversation_history);

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
