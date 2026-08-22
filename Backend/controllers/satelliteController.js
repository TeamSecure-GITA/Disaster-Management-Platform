const satelliteService = require("../services/satelliteService");

const saveSatelliteData = async (req, res, next) => {
  try {
    const data = await satelliteService.saveSatelliteData(req.body);

    res.status(201).json({
      success: true,
      message: "Satellite data saved successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

const getSatelliteData = async (req, res, next) => {
  try {
    const data = await satelliteService.getSatelliteData(req.query);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

const getSatelliteDataById = async (req, res, next) => {
  try {
    const data = await satelliteService.getSatelliteDataById(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: "Satellite data not found" });
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

const updateProcessingStatus = async (req, res, next) => {
  try {
    const data = await satelliteService.updateProcessingStatus(
      req.params.id,
      req.body.processingStatus,
      req.body.analysisResults
    );
    if (!data) return res.status(404).json({ success: false, message: "Satellite data not found" });
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

module.exports = {
  saveSatelliteData,
  getSatelliteData,
  getSatelliteDataById,
  updateProcessingStatus,
};