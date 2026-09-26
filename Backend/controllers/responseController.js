const responseSystemService = require("../services/responseSystemService");

const orchestrateResponse = async (req, res, next) => {
  try {
    const result = await responseSystemService.orchestrateResponse(req.body);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const getSystemStatus = async (req, res, next) => {
  try {
    const status = await responseSystemService.getSystemStatus();
    res.status(200).json({
      success: true,
      data: status,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  orchestrateResponse,
  getSystemStatus,
};
