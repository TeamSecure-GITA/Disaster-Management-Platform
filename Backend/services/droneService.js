const Drone = require("../models/Drone");
const DroneMission = require("../models/DroneMission");

const createDrone = async (droneData) => {
  return await Drone.create(droneData);
};

const createMission = async (missionData) => {
  return await DroneMission.create(missionData);
};

const getDrones = async () => {
  return await Drone.find();
};

const getMissions = async () => {
  return await DroneMission.find().sort({ createdAt: -1 });
};

module.exports = {
  createDrone,
  createMission,
  getDrones,
  getMissions,
};