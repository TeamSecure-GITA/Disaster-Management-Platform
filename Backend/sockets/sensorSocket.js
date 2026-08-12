const { getIO } = require("./socket");

const emitSensorReading = (sensorReading) => {
  const io = getIO();

  io.emit("sensorReading", sensorReading);
};

const emitSensorStatus = (sensor) => {
  const io = getIO();

  io.emit("sensorStatus", sensor);
};

const emitSensorAlert = (data) => {
  const io = getIO();

  io.emit("sensorAlert", data);
};

module.exports = {
  emitSensorReading,
  emitSensorStatus,
  emitSensorAlert,
};