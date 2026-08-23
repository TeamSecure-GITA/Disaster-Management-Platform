const Disaster = require("../models/Disaster");

const createDisaster = async (req, res, next) => {
  try {
    const disaster = await Disaster.create(req.body);

    res.status(201).json({
      success: true,
      message: "Disaster created successfully",
      data: disaster,
    });
  } catch (error) {
    next(error);
  }
};

const getDisasters = async (req, res, next) => {
  try {
    const disasters = await Disaster.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: disasters,
    });
  } catch (error) {
    next(error);
  }
};

const getDisasterById = async (req, res, next) => {
  try {
    const disaster = await Disaster.findById(req.params.id);

    if (!disaster) {
      return res.status(404).json({
        success: false,
        message: "Disaster not found",
      });
    }

    res.status(200).json({
      success: true,
      data: disaster,
    });
  } catch (error) {
    next(error);
  }
};

const updateDisaster = async (req, res, next) => {
  try {
    const disaster = await Disaster.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!disaster) {
      return res.status(404).json({ success: false, message: "Disaster not found" });
    }

    res.status(200).json({ success: true, message: "Disaster updated successfully", data: disaster });
  } catch (error) {
    next(error);
  }
};

const deleteDisaster = async (req, res, next) => {
  try {
    const disaster = await Disaster.findByIdAndDelete(req.params.id);

    if (!disaster) {
      return res.status(404).json({ success: false, message: "Disaster not found" });
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createDisaster,
  getDisasters,
  getDisasterById,
  updateDisaster,
  deleteDisaster,
};