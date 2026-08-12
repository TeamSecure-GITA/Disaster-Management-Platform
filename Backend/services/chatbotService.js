const getChatbotResponse = async (message) => {
  if (!message || !message.trim()) {
    throw new Error("Message is required");
  }

  return {
    message:
      "Emergency chatbot service is ready. AI integration can be connected here.",
  };
};

module.exports = {
  getChatbotResponse,
};