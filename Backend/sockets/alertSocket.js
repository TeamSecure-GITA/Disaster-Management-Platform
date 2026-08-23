const { getIO } = require("./socket");

const emitNewAlert = (alert) => {
  try { getIO().to("alerts").emit("newAlert", alert); } catch (error) { return false; }
  return true;
};

const emitAlertUpdated = (alert) => {
  try { getIO().to("alerts").emit("alertUpdated", alert); } catch (error) { return false; }
  return true;
};

const emitAlertDeleted = (alertId) => {
  try { getIO().to("alerts").emit("alertDeleted", { alertId }); } catch (error) { return false; }
  return true;
};

module.exports = {
  emitNewAlert,
  emitAlertUpdated,
  emitAlertDeleted,
};