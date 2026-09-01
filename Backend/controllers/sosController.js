const SOS = require("../models/SOS");
const {
  emitNewSOS,
  emitSOSUpdated,
  emitSOSResolved,
} = require("../sockets/sosSocket");

const createSOS = async (req, res, next) => {
  try {
    const { latitude, longitude, ...sosData } = req.body;
    const sos = await SOS.create({
      ...sosData,
      user: req.user?._id || null,
      location: {
        type: "Point",
        coordinates: [Number(longitude), Number(latitude)],
      },
    });
    emitNewSOS(sos);

    res.status(201).json({
      success: true,
      message: "SOS request created successfully",
      data: sos,
    });
  } catch (error) {
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