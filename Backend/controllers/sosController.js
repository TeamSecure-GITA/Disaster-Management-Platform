const mongoose = require("mongoose");
const SOS = require("../models/SOS");
const {
  emitNewSOS,
  emitSOSUpdated,
  emitSOSResolved,
} = require("../sockets/sosSocket");

const createSOS = async (req, res, next) => {
  // ── Database connectivity guard ─────────────────────────────────────────────
  // readyState: 0=disconnected, 1=connected, 2=connecting, 3=disconnecting
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      message: "Database unavailable. Your SOS has been queued locally and will sync automatically when the service recovers.",
    });
  }

  try {
    const { latitude, longitude, ...sosData } = req.body;

    const hasLat = latitude !== undefined && latitude !== null && !isNaN(Number(latitude));
    const hasLng = longitude !== undefined && longitude !== null && !isNaN(Number(longitude));

    const sos = await SOS.create({
      ...sosData,
      user: req.user?._id || null,
      location: {
        type: "Point",
        // GeoJSON: [longitude, latitude]
        coordinates: [
          hasLng ? Number(longitude) : 0,
          hasLat ? Number(latitude) : 0,
        ],
      },
    });

    // Broadcast to operations room — errors here must NOT fail the HTTP response
    emitNewSOS(sos);

    res.status(201).json({
      success: true,
      message: "SOS request created successfully",
      data: sos,
    });
  } catch (error) {
    // Surface Mongoose validation errors explicitly so the frontend can react
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation failed.",
        errors: Object.values(error.errors).map((e) => ({
          field: e.path,
          message: e.message,
        })),
      });
    }
    next(error);
  }
};

const getSOSRequests = async (req, res, next) => {
  try {
    const requests = await SOS.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: requests,
    });
  } catch (error) {
    next(error);
  }
};

const getSOSById = async (req, res, next) => {
  try {
    const sos = await SOS.findById(req.params.id);

    if (!sos) {
      return res.status(404).json({
        success: false,
        message: "SOS request not found",
      });
    }

    res.status(200).json({
      success: true,
      data: sos,
    });
  } catch (error) {
    next(error);
  }
};

const updateSOS = async (req, res, next) => {
  try {
    const sos = await SOS.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!sos) return res.status(404).json({ success: false, message: "SOS request not found" });
    emitSOSUpdated(sos);
    if (sos.status === "resolved") emitSOSResolved(sos._id);
    res.status(200).json({ success: true, message: "SOS request updated successfully", data: sos });
  } catch (error) { next(error); }
};

const deleteSOS = async (req, res, next) => {
  try {
    const sos = await SOS.findByIdAndDelete(req.params.id);
    if (!sos) return res.status(404).json({ success: false, message: "SOS request not found" });
    emitSOSResolved(sos._id);
    res.status(204).send();
  } catch (error) { next(error); }
};

module.exports = {
  createSOS,
  getSOSRequests,
  getSOSById,
  updateSOS,
  deleteSOS,
};