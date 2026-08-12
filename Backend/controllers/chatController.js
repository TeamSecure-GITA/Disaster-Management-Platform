const chatbotService = require("../services/chatbotService");

const sendMessage = async (req, res, next) => {
  try {
    const { message } = req.body;

    const response = await chatbotService.getChatbotResponse(message);

    res.status(200).json({
      success: true,
      data: response,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  sendMessage,
};