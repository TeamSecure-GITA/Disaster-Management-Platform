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
    const mission = await droneService.createMission(req.body);

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
    const drones = await droneService.getDrones();

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
    const missions = await droneService.getMissions();

    res.status(200).json({
      success: true,
      data: missions,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createDrone,
  createMission,
  getDrones,
  getMissions,
};