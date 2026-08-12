const SatelliteData = require("../models/SatelliteData");

const saveSatelliteData = async (data) => {
  return await SatelliteData.create(data);
};

const getSatelliteData = async (filters = {}) => {
  return await SatelliteData.find(filters)
    .sort({ createdAt: -1 });
};

module.exports = {
  saveSatelliteData,
  getSatelliteData,
};