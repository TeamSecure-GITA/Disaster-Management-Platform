const { getIO } = require("./socket");

const emitMeshSOS = (data) => {
  try {
    const io = getIO();
    io.to("operations").emit("meshSOS", data);
    io.to("alerts").emit("meshSOS", data);
  } catch (error) {
    return false;
  }
  return true;
};

const emitMeshTiltAlert = (data) => {
  try {
    const io = getIO();
    io.to("operations").emit("meshTiltAlert", data);
    io.to("alerts").emit("meshTiltAlert", data);
  } catch (error) {
    return false;
  }
  return true;
};

const emitBeaconStatus = (data) => {
  try {
    getIO().to("operations").emit("beaconStatus", data);
  } catch (error) {
    return false;
  }
  return true;
};

const emitMeshHeartbeat = (data) => {
  try {
    getIO().to("operations").emit("meshNetworkHealth", data);
  } catch (error) {
    return false;
  }
  return true;
};

module.exports = {
  emitMeshSOS,
  emitMeshTiltAlert,
  emitBeaconStatus,
  emitMeshHeartbeat,
};
