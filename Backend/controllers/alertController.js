const alertService = require("../services/alertService");

const createAlert = async (req, res, next) => {
  try {
    const alert = await alertService.createAlert(req.body);

    res.status(201).json({
      success: true,
      message: "Alert created successfully",
      data: alert,
    });
  } catch (error) {
    next(error);
  }
};

const getAlerts = async (req, res, next) => {
  try {
    const alerts = await alertService.getAllAlerts();

    res.status(200).json({
      success: true,
      data: alerts,
    });
  } catch (error) {
    next(error);
  }
};

const getAlert = async (req, res, next) => {
  try {
    const alert = await alertService.getAlertById(req.params.id);

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: "Alert not found",
      });
    }

    res.status(200).json({
      success: true,
      data: alert,
    });
  } catch (error) {
    next(error);
  }
};

const deleteAlert = async (req, res, next) => {
  try {
    const alert = await alertService.deleteAlert(req.params.id);

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: "Alert not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Alert deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

const updateAlert = async (req, res, next) => {
  try {
    const alert = await alertService.updateAlert(req.params.id, req.body);

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: "Alert not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Alert updated successfully",
      data: alert,
    });
  } catch (error) {
    next(error);
  }
};

const govtAlertService = require("../services/govtAlertService");

const getLiveGovtAlerts = async (req, res, next) => {
  try {
    const { source } = req.query;
    const alerts = await govtAlertService.getLiveGovtAlerts(source || "all");
    res.status(200).json({
      success: true,
      count: alerts.length,
      source: source || "all",
      data: alerts,
    });
  } catch (error) {
    next(error);
  }
};

const syncGovtAlerts = async (req, res, next) => {
  try {
    const result = await govtAlertService.fetchAndSyncGovtAlerts();
    res.status(200).json({
      success: true,
      message: "Official programmatic feeds (GDACS, NDMA SACHET, USGS) synchronized successfully",
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

const getGovtPortals = async (req, res, next) => {
  try {
    const portals = govtAlertService.getOfficialGovtPortals();
    res.status(200).json({
      success: true,
      data: portals,
    });
  } catch (error) {
    next(error);
  }
};

const getFeedHealth = async (req, res, next) => {
  try {
    const health = govtAlertService.getFeedHealthStatus();
    res.status(200).json({
      success: true,
      data: health,
    });
  } catch (error) {
    next(error);
  }
};

const crowdSignalService = require("../services/crowdSignalService");

const getCrowdSignals = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 20;
    const signals = await crowdSignalService.getActiveCrowdSignals(limit);
    res.status(200).json({
      success: true,
      count: signals.length,
      data: signals,
    });
  } catch (error) {
    next(error);
  }
};

const verifyCrowdSignalAction = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { action, notes } = req.body;
    const signal = await crowdSignalService.verifyCrowdSignal(
      id,
      req.user?._id || null,
      action || "escalate",
      notes || ""
    );
    res.status(200).json({
      success: true,
      message: `Crowd signal successfully updated (${signal.status})`,
      data: signal,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createAlert,
  getAlerts,
  getAlert,
  updateAlert,
  deleteAlert,
  getLiveGovtAlerts,
  syncGovtAlerts,
  getGovtPortals,
  getFeedHealth,
  getCrowdSignals,
  verifyCrowdSignalAction,
};