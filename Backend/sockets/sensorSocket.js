const { getIO } = require("./socket");

const emitSensorReading = (sensorReading) => {
  try { getIO().to("operations").emit("sensorReading", sensorReading); } catch (error) { return false; }
  return true;
};

const emitSensorStatus = (sensor) => {
  try { getIO().to("operations").emit("sensorStatus", sensor); } catch (error) { return false; }
  return true;
};

const emitSensorAlert = (data) => {
  try { getIO().to("operations").emit("sensorAlert", data); } catch (error) { return false; }
  return true;
};

module.exports = {
  emitSensorReading,
  emitSensorStatus,
  emitSensorAlert,
};