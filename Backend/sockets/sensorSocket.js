const { getIO } = require("./socket");

const emitSensorReading = (sensorReading) => {
  const io = getIO();

  io.to("operations").emit("sensorReading", sensorReading);
};

const emitSensorStatus = (sensor) => {
  const io = getIO();

  io.to("operations").emit("sensorStatus", sensor);
};

const emitSensorAlert = (data) => {
  const io = getIO();

  io.to("operations").emit("sensorAlert", data);
};

module.exports = {
  emitSensorReading,
  emitSensorStatus,
  emitSensorAlert,
};