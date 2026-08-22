const { getIO } = require("./socket");

const emitDroneLocation = (droneId, location) => {
  const io = getIO();

  io.to("operations").emit("droneLocation", {
    droneId,
    location,
  });
};

const emitDroneStatus = (droneId, status) => {
  const io = getIO();

  io.to("operations").emit("droneStatus", {
    droneId,
    status,
  });
};

const emitMissionUpdate = (mission) => {
  const io = getIO();

  io.to("operations").emit("missionUpdate", mission);
};

module.exports = {
  emitDroneLocation,
  emitDroneStatus,
  emitMissionUpdate,
};