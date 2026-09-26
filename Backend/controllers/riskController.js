const riskEngineService = require("../services/riskEngineService");

const assessRisk = async (req, res, next) => {
  try {
    const { latitude, longitude, radiusKm, hazardType } = req.body;
    const result = await riskEngineService.assessRisk({
      latitude,
      longitude,
      radiusKm,
      hazardType,
    });
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getRiskZones = async (req, res, next) => {
  try {
    const zones = await riskEngineService.getAllZones();
    res.status(200).json({
      success: true,
      data: zones,
    });
  } catch (error) {
    next(error);
  }
};

const getRiskSummary = async (req, res, next) => {
  try {
    const summary = await riskEngineService.getSummary();
    res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error) {
    next(error);
  }
};

const getZoneAssessment = async (req, res, next) => {
  try {
    const { zoneId } = req.params;
    const assessment = await riskEngineService.getZoneAssessment(zoneId);
    res.status(200).json({
      success: true,
      data: assessment,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  assessRisk,
  getRiskZones,
  getRiskSummary,
  getZoneAssessment,
};
