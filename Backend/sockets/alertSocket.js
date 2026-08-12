const { getIO } = require("./socket");

const emitNewAlert = (alert) => {
  const io = getIO();

  io.emit("newAlert", alert);
};

const emitAlertUpdated = (alert) => {
  const io = getIO();

  io.emit("alertUpdated", alert);
};

const emitAlertDeleted = (alertId) => {
  const io = getIO();

  io.emit("alertDeleted", {
    alertId,
  });
};

module.exports = {
  emitNewAlert,
  emitAlertUpdated,
  emitAlertDeleted,
};