const Volunteer = require("../models/Volunteer");

const createVolunteer = async (req, res, next) => {
  try {
    const volunteer = await Volunteer.create(req.body);

    res.status(201).json({
      success: true,
      message: "Volunteer created successfully",
      data: volunteer,
    });
  } catch (error) {
    next(error);
  }
};

const getVolunteers = async (req, res, next) => {
  try {
    const volunteers = await Volunteer.find();

    res.status(200).json({
      success: true,
      data: volunteers,
    });
  } catch (error) {
    next(error);
  }
};

const getVolunteerById = async (req, res, next) => {
  try {
    const volunteer = await Volunteer.findById(req.params.id);

    if (!volunteer) {
      return res.status(404).json({
        success: false,
        message: "Volunteer not found",
      });
    }

    res.status(200).json({
      success: true,
      data: volunteer,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createVolunteer,
  getVolunteers,
  getVolunteerById,
};