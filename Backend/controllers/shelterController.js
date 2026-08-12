const Shelter = require("../models/Shelter");

const createShelter = async (req, res, next) => {
  try {
    const shelter = await Shelter.create(req.body);

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

module.exports = {
  createShelter,
  getShelters,
  getShelterById,
};