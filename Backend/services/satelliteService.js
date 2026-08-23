const SatelliteData = require("../models/SatelliteData");
const axios = require("axios");
const environment = require("../config/environment");

const saveSatelliteData = async (data) => {
  return await SatelliteData.create(data);
};

const getSatelliteData = async ({ provider, satellite, dataType, processingStatus, from, to, page = 1, limit = 50 } = {}) => {
  const filters = {};
  if (provider) filters.provider = provider;
  if (satellite) filters.satellite = satellite;
  if (dataType) filters.dataType = dataType;
  if (processingStatus) filters.processingStatus = processingStatus;
  if (from || to) filters.acquisitionTime = {};
  if (from) filters.acquisitionTime.$gte = new Date(from);
  if (to) filters.acquisitionTime.$lte = new Date(to);
  const safePage = Math.max(Number(page) || 1, 1);
  const safeLimit = Math.min(Math.max(Number(limit) || 50, 1), 100);
  return SatelliteData.find(filters)
    .sort({ acquisitionTime: -1 })
    .skip((safePage - 1) * safeLimit)
    .limit(safeLimit);
};

const getSatelliteDataById = async (id) => SatelliteData.findById(id);

const updateProcessingStatus = async (id, processingStatus, analysisResults) => {
  const updates = { processingStatus };
  if (analysisResults !== undefined) updates.analysisResults = analysisResults;
  return SatelliteData.findByIdAndUpdate(id, { $set: updates }, { new: true, runValidators: true });
};

const updateSatelliteData = async () => {
  const providerUrl = environment.satelliteApiUrl;
  if (!providerUrl) return { updated: 0, status: "not_configured" };

  const response = await axios.get(providerUrl, { timeout: 15000 });
  const records = Array.isArray(response.data) ? response.data : response.data.records;
  if (!Array.isArray(records)) throw new Error("Satellite provider returned an invalid records payload");
  if (!records.length) return { updated: 0, status: "no_data" };
  let updated = 0;
  for (const record of records) {
    const externalId = record.externalId || record.id || record.dataId;
    if (externalId) {
      await SatelliteData.findOneAndUpdate(
        { externalId: String(externalId) },
        { ...record, externalId: String(externalId) },
        { upsert: true, new: true, setDefaultsOnInsert: true, runValidators: true }
      );
    } else {
      await SatelliteData.create(record);
    }
    updated += 1;
  }
  return { updated, status: "updated" };
};

module.exports = {
  saveSatelliteData,
  getSatelliteData,
  getSatelliteDataById,
  updateProcessingStatus,
  updateSatelliteData,
};