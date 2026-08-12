const Alert = require("../models/Alert");

const createAlert = async (alertData) => {
  return await Alert.create(alertData);
};

const getAllAlerts = async () => {
  return await Alert.find().sort({ createdAt: -1 });
};

const getAlertById = async (id) => {
  return await Alert.findById(id);
};

const deleteAlert = async (id) => {
  return await Alert.findByIdAndDelete(id);
};

module.exports = {
  createAlert,
  getAllAlerts,
  getAlertById,
  deleteAlert,
};