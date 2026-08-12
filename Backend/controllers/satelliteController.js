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

module.exports = {
  saveSatelliteData,
  getSatelliteData,
};