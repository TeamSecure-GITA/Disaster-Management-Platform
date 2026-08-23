const Shelter = require("../models/Shelter");

const createShelter = async (req, res, next) => {
  try {
    const { latitude, longitude, ...shelterData } = req.body;
    const shelter = await Shelter.create({
      ...shelterData,
      location: {
        type: "Point",
        coordinates: [Number(longitude), Number(latitude)],
      },
    });

    res.status(201).json({
      success: true,
      message: "Shelter created successfully",
      data: shelter,
    });
  } catch (error) {
    next(error);
  }
};

const getShelters = async (req, res, next) => {
  try {
    const shelters = await Shelter.find();

    res.status(200).json({
      success: true,
      data: shelters,
    });
  } catch (error) {
    next(error);
  }
};

const getShelterById = async (req, res, next) => {
  try {
    const shelter = await Shelter.findById(req.params.id);

    if (!shelter) {
      return res.status(404).json({
        success: false,
        message: "Shelter not found",
      });
    }

    res.status(200).json({
      success: true,
      data: shelter,
    });
  } catch (error) {
    next(error);
  }
};

const updateShelter = async (req, res, next) => {
  try {
    const shelter = await Shelter.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!shelter) return res.status(404).json({ success: false, message: "Shelter not found" });
    res.status(200).json({ success: true, message: "Shelter updated successfully", data: shelter });
  } catch (error) { next(error); }
};

const deleteShelter = async (req, res, next) => {
  try {
    const shelter = await Shelter.findByIdAndDelete(req.params.id);
    if (!shelter) return res.status(404).json({ success: false, message: "Shelter not found" });
    res.status(204).send();
  } catch (error) { next(error); }
};

module.exports = {
  createShelter,
  getShelters,
  getShelterById,
  updateShelter,
  deleteShelter,
};