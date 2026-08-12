const { getIO } = require("./socket");

const emitDroneLocation = (droneId, location) => {
  const io = getIO();

  io.emit("droneLocation", {
    droneId,
    location,
  });
};

const emitDroneStatus = (droneId, status) => {
  const io = getIO();

  io.emit("droneStatus", {
    droneId,
    status,
  });
};

const emitMissionUpdate = (mission) => {
  const io = getIO();

  io.emit("missionUpdate", mission);
};

module.exports = {
  emitDroneLocation,
  emitDroneStatus,
  emitMissionUpdate,
};