const axios = require("axios");
const environment = require("../config/environment");

const getAiBaseUrl = () => environment.aiChatbotUrl;

const SYSTEM_PROMPT = `You are the Official AI Disaster Management & Emergency Response Assistant.
Provide immediate, clear, life-saving, bulleted instructions for natural and man-made disasters (cyclones, floods, earthquakes, fires, landslides).
Include national emergency hotlines (112, 108, 1070) where helpful. Keep responses concise and action-oriented.`;

const getChatbotResponse = async (message) => {
  if (!message || !message.trim()) {
    throw new Error("Message is required");
  }

  const geminiKey = process.env.GEMINI_API_KEY || process.env.VITE_FIREBASE_API_KEY || "";

  // 1. Try Gemini API directly if key is available
  if (geminiKey) {
    try {
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`;
      const geminiRes = await axios.post(
        geminiUrl,
        {
          contents: [
            {
              role: "user",
              parts: [{ text: `${SYSTEM_PROMPT}\n\nUser Question: ${message}` }],
            },
          ],
        },
        { timeout: 8000 }
      );

      const candidateText =
        geminiRes.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (candidateText && candidateText.trim()) {
        return {
          message: candidateText.trim(),
          provider: "gemini",
          fallback: false,
        };
      }
    } catch {}
  }

  // 2. Try AI service microservice
  try {
    const url = `${getAiBaseUrl().replace(/\/$/, "")}/chat`;
    const response = await axios.post(
      url,
      {
        message,
        context: "disaster_management",
      },
      {
        timeout: 10000,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return {
      message: response?.data?.response || response?.data?.message || "AI response received",
      fallback: false,
    };
  } catch (error) {
    return {
      message:
        "🚨 For immediate life emergencies, please dial 112 (National Emergency) or 108 (Medical Ambulance). For disaster relief updates, monitor official SDMA / NDMA alerts.",
      fallback: true,
      degraded: true,
    };
  }
};

module.exports = {
  getChatbotResponse,
  getAiBaseUrl,
};