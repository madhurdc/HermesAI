import { supabase } from "../config/supabase";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

/**
 * Get the current session token for API requests.
 */
async function getAuthHeaders() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error("Not authenticated");
  }
  return {
    Authorization: `Bearer ${session.access_token}`,
  };
}

/**
 * Generic API request helper.
 */
async function apiRequest(endpoint, options = {}) {
  const headers = await getAuthHeaders();

  const config = {
    ...options,
    headers: {
      ...headers,
      ...(options.headers || {}),
    },
  };

  // Don't set Content-Type for FormData (browser sets it with boundary)
  if (!(options.body instanceof FormData)) {
    config.headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${API_URL}${endpoint}`, config);

  // Handle binary responses (PDF, audio)
  const contentType = response.headers.get("content-type");
  if (contentType && (contentType.includes("application/pdf") || contentType.includes("audio/"))) {
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }
    return response.blob();
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || `Request failed with status ${response.status}`);
  }

  return data;
}

// ========================
// Interview Prep API
// ========================

export async function startInterview(domain, difficulty, mode = "text") {
  return apiRequest("/interview/start", {
    method: "POST",
    body: JSON.stringify({ domain, difficulty, mode }),
  });
}

export async function submitAnswer(sessionId, questionIndex, question, answer) {
  return apiRequest("/interview/answer", {
    method: "POST",
    body: JSON.stringify({
      session_id: sessionId,
      question_index: questionIndex,
      question,
      answer,
    }),
  });
}

export async function completeInterview(sessionId) {
  return apiRequest("/interview/complete", {
    method: "POST",
    body: JSON.stringify({ session_id: sessionId }),
  });
}

export async function getInterviewReportPDF(sessionId) {
  return apiRequest(`/interview/report/${sessionId}/pdf`);
}

export async function interviewTTS(text) {
  return apiRequest("/interview/tts", {
    method: "POST",
    body: JSON.stringify({ text }),
  });
}

export async function getInterviewHistory() {
  return apiRequest("/interview/history");
}

// ========================
// Resume Review API
// ========================

export async function analyzeResume(file) {
  const formData = new FormData();
  formData.append("resume", file);

  return apiRequest("/resume/analyze", {
    method: "POST",
    body: formData,
  });
}

export async function getResumeReportPDF(reviewId) {
  return apiRequest(`/resume/report/${reviewId}/pdf`);
}

export async function getResumeHistory() {
  return apiRequest("/resume/history");
}

// ========================
// Career Guidance API
// ========================

export async function careerChat(sessionId, message, conversationHistory) {
  return apiRequest("/career/chat", {
    method: "POST",
    body: JSON.stringify({
      session_id: sessionId,
      message,
      conversation_history: conversationHistory,
    }),
  });
}

export async function getCareerQuestions() {
  return apiRequest("/career/questions");
}

export async function getCareerRecommendations(sessionId, conversationHistory) {
  return apiRequest("/career/recommend", {
    method: "POST",
    body: JSON.stringify({
      session_id: sessionId,
      conversation_history: conversationHistory,
    }),
  });
}

export async function getCareerHistory() {
  return apiRequest("/career/history");
}
