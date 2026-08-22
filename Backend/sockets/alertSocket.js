const { getIO } = require("./socket");

const emitNewAlert = (alert) => {
  const io = getIO();

  io.to("alerts").emit("newAlert", alert);
};

const emitAlertUpdated = (alert) => {
  const io = getIO();

  io.to("alerts").emit("alertUpdated", alert);
};

const emitAlertDeleted = (alertId) => {
  const io = getIO();

  io.to("alerts").emit("alertDeleted", {
    alertId,
  });
};

module.exports = {
  emitNewAlert,
  emitAlertUpdated,
  emitAlertDeleted,
};