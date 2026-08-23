const Alert = require("../models/Alert");
const {
  emitNewAlert,
  emitAlertUpdated,
  emitAlertDeleted,
} = require("../sockets/alertSocket");

const createAlert = async (alertData) => {
  const alert = await Alert.create(alertData);
  emitNewAlert(alert);
  return alert;
};

const getAllAlerts = async () => {
  return await Alert.find().sort({ createdAt: -1 });
};

const getAlertById = async (id) => {
  return await Alert.findById(id);
};

const deleteAlert = async (id) => {
  const alert = await Alert.findByIdAndDelete(id);
  if (alert) emitAlertDeleted(alert._id);
  return alert;
};

const updateAlert = async (id, updates) => {
  const alert = await Alert.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  });
  if (alert) emitAlertUpdated(alert);
  return alert;
};

module.exports = {
  createAlert,
  getAllAlerts,
  getAlertById,
  deleteAlert,
  updateAlert,
};