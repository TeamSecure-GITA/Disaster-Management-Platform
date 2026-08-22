const Drone = require("../models/Drone");
const DroneMission = require("../models/DroneMission");
const { emitDroneLocation, emitDroneStatus, emitMissionUpdate } = require("../sockets/droneSocket");

const emitSafely = (emit, ...args) => {
  try {
    emit(...args);
  } catch (error) {
    return false;
  }
  return true;
};

const createDrone = async (droneData) => {
  return await Drone.create(droneData);
};

const createMission = async (missionData) => {
  const drone = await Drone.findById(missionData.drone);
  if (!drone) {
    const error = new Error("Drone not found");
    error.statusCode = 404;
    throw error;
  }

  return await DroneMission.create(missionData);
};

const getDrones = async ({ status, page = 1, limit = 50 } = {}) => {
  const filters = status ? { status } : {};
  const safePage = Math.max(Number(page) || 1, 1);
  const safeLimit = Math.min(Math.max(Number(limit) || 50, 1), 100);
  return Drone.find(filters)
    .sort({ createdAt: -1 })
    .skip((safePage - 1) * safeLimit)
    .limit(safeLimit);
};

const getDroneById = async (id) => Drone.findById(id);

const updateDrone = async (id, data) => {
  const allowedFields = ["name", "manufacturer", "model", "cameraAvailable", "thermalCamera"];
  const updates = Object.fromEntries(Object.entries(data).filter(([key]) => allowedFields.includes(key)));
  return Drone.findByIdAndUpdate(id, { $set: updates }, { new: true, runValidators: true });
};

const updateDroneStatus = async (id, status) => {
  const drone = await Drone.findByIdAndUpdate(id, { status }, { new: true, runValidators: true });
  if (drone) emitSafely(emitDroneStatus, id, drone.status);
  return drone;
};

const updateDroneTelemetry = async (id, telemetry) => {
  const updates = {
    location: telemetry.location,
    batteryLevel: telemetry.batteryLevel,
    altitude: telemetry.altitude,
    lastTelemetryAt: new Date(),
  };
  if (telemetry.status) updates.status = telemetry.status;
  const drone = await Drone.findByIdAndUpdate(id, { $set: updates }, { new: true, runValidators: true });
  if (drone) {
    emitSafely(emitDroneLocation, id, drone.location);
    if (telemetry.status) emitSafely(emitDroneStatus, id, drone.status);
  }
  return drone;
};

const deleteDrone = async (id) => Drone.findByIdAndDelete(id);

const getMissions = async ({ status, drone, page = 1, limit = 50 } = {}) => {
  const filters = {};
  if (status) filters.status = status;
  if (drone) filters.drone = drone;
  const safePage = Math.max(Number(page) || 1, 1);
  const safeLimit = Math.min(Math.max(Number(limit) || 50, 1), 100);
  return DroneMission.find(filters)
    .populate("drone")
    .sort({ createdAt: -1 })
    .skip((safePage - 1) * safeLimit)
    .limit(safeLimit);
};

const getMissionById = async (id) => DroneMission.findById(id).populate("drone");

const updateMissionStatus = async (id, status, findings) => {
  const updates = { status };
  if (findings) updates.findings = findings;
  if (status === "in_progress") updates.startTime = new Date();
  if (["completed", "aborted"].includes(status)) updates.endTime = new Date();
  const mission = await DroneMission.findByIdAndUpdate(id, { $set: updates }, { new: true, runValidators: true });
  if (mission) {
    const droneStatus = status === "in_progress" ? "in_mission" : status === "completed" || status === "aborted" ? "available" : null;
    if (droneStatus) await updateDroneStatus(mission.drone, droneStatus);
    emitSafely(emitMissionUpdate, mission);
  }
  return mission;
};

module.exports = {
  createDrone,
  createMission,
  getDrones,
  getDroneById,
  updateDrone,
  updateDroneStatus,
  updateDroneTelemetry,
  deleteDrone,
  getMissions,
  getMissionById,
  updateMissionStatus,
};