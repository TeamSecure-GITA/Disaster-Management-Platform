const droneService = require("../services/droneService");

const createDrone = async (req, res, next) => {
  try {
    const drone = await droneService.createDrone(req.body);

    res.status(201).json({
      success: true,
      message: "Drone created successfully",
      data: drone,
    });
  } catch (error) {
    next(error);
  }
};

const createMission = async (req, res, next) => {
  try {
    const mission = await droneService.createMission({
      ...req.body,
      assignedBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Drone mission created successfully",
      data: mission,
    });
  } catch (error) {
    next(error);
  }
};

const getDrones = async (req, res, next) => {
  try {
    const drones = await droneService.getDrones(req.query);

    res.status(200).json({
      success: true,
      data: drones,
    });
  } catch (error) {
    next(error);
  }
};

const getMissions = async (req, res, next) => {
  try {
    const missions = await droneService.getMissions(req.query);

    res.status(200).json({
      success: true,
      data: missions,
    });
  } catch (error) {
    next(error);
  }
};

const getDroneById = async (req, res, next) => {
  try {
    const drone = await droneService.getDroneById(req.params.id);
    if (!drone) return res.status(404).json({ success: false, message: "Drone not found" });
    res.json({ success: true, data: drone });
  } catch (error) { next(error); }
};

const updateDrone = async (req, res, next) => {
  try {
    const drone = await droneService.updateDrone(req.params.id, req.body);
    if (!drone) return res.status(404).json({ success: false, message: "Drone not found" });
    res.json({ success: true, data: drone });
  } catch (error) { next(error); }
};

const updateDroneStatus = async (req, res, next) => {
  try {
    const drone = await droneService.updateDroneStatus(req.params.id, req.body.status);
    if (!drone) return res.status(404).json({ success: false, message: "Drone not found" });
    res.json({ success: true, data: drone });
  } catch (error) { next(error); }
};

const updateDroneTelemetry = async (req, res, next) => {
  try {
    const drone = await droneService.updateDroneTelemetry(req.params.id, req.body);
    if (!drone) return res.status(404).json({ success: false, message: "Drone not found" });
    res.json({ success: true, data: drone });
  } catch (error) { next(error); }
};

const deleteDrone = async (req, res, next) => {
  try {
    const drone = await droneService.deleteDrone(req.params.id);
    if (!drone) return res.status(404).json({ success: false, message: "Drone not found" });
    res.status(204).send();
  } catch (error) { next(error); }
};

const getMissionById = async (req, res, next) => {
  try {
    const mission = await droneService.getMissionById(req.params.id);
    if (!mission) return res.status(404).json({ success: false, message: "Mission not found" });
    res.json({ success: true, data: mission });
  } catch (error) { next(error); }
};

const updateMissionStatus = async (req, res, next) => {
  try {
    const mission = await droneService.updateMissionStatus(req.params.id, req.body.status, req.body.findings);
    if (!mission) return res.status(404).json({ success: false, message: "Mission not found" });
    res.json({ success: true, data: mission });
  } catch (error) { next(error); }
};

module.exports = {
  createDrone,
  createMission,
  getDrones,
  getMissions,
  getDroneById,
  updateDrone,
  updateDroneStatus,
  updateDroneTelemetry,
  deleteDrone,
  getMissionById,
  updateMissionStatus,
};