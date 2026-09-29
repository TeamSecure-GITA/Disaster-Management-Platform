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
      ...data,
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
  } catch (error) {
    next(error);
  }
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
  } catch (error) {
    next(error);
  }
};

/**
 * Returns Processed Satellite Outputs as GeoJSON FeatureCollection Map Layers
 */
const getSatelliteMapLayers = async (req, res, next) => {
  try {
    const geoJson = await satelliteService.getSatelliteMapLayers(req.query.category || "all");
    res.status(200).json({
      success: true,
      data: geoJson,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Returns InSAR Line-of-Sight Displacement Points & Kinematic Velocities
 */
const getInsarDisplacement = async (req, res, next) => {
  try {
    const data = await satelliteService.getInsarDisplacementData(req.query);
    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * High-level Satellite Telemetry Summary
 */
const getSatelliteSummary = async (req, res, next) => {
  try {
    const data = await satelliteService.getSatelliteSummary();
    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Manually Trigger Immediate Satellite Remote Sensing Ingest & Processing Cycle
 */
const triggerSatelliteSync = async (req, res, next) => {
  try {
    const result = await satelliteService.updateSatelliteData();
    res.status(200).json({
      success: true,
      message: "Satellite remote sensing processing cycle completed",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Return Catalog of Real Remote Sensing Satellite Sources
 */
const getSatelliteSources = async (req, res, next) => {
  try {
    const data = satelliteService.getSatelliteSources();
    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Return Georeferenced Raster Overlay Image for Leaflet ImageOverlay
 */
const getRasterOverlay = async (req, res, next) => {
  try {
    const data = await satelliteService.getRasterOverlay(req.params.siteId);
    if (!data) {
      return res.status(404).json({ success: false, message: "Raster overlay not found for site" });
    }
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
  getSatelliteDataById,
  updateProcessingStatus,
  getSatelliteMapLayers,
  getInsarDisplacement,
  getSatelliteSummary,
  triggerSatelliteSync,
  getSatelliteSources,
  getRasterOverlay,
};