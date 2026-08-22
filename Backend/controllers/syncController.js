const syncService = require("../services/syncService");

const syncBatch = async (req, res, next) => {
  try {
    const data = await syncService.processBatch(
      req.user._id,
      req.body.deviceId,
      req.body.operations
    );

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { syncBatch };