const axios = require("axios");
const environment = require("../config/environment");

const getAiBaseUrl = () => environment.aiChatbotUrl;

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
      fallback: false,
    };
  } catch (error) {
    return {
      message:
        "Emergency chatbot service is ready. AI integration can be connected here.",
      fallback: true,
      degraded: true,
    };
  }
};

module.exports = {
  getChatbotResponse,
  getAiBaseUrl,
};