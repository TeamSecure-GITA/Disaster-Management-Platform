const axios = require("axios");

const getAiBaseUrl = () => process.env.AI_CHATBOT_URL || "http://localhost:8000";

const getChatbotResponse = async (message) => {
  if (!message || !message.trim()) {
    throw new Error("Message is required");
  }

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
      raw: response?.data || null,
    };
  } catch (error) {
    const fallback = {
      message:
        "Emergency chatbot service is ready. AI integration can be connected here.",
      fallback: true,
      error: error?.response?.data || error.message,
    };

    return fallback;
  }
};

module.exports = {
  getChatbotResponse,
  getAiBaseUrl,
};