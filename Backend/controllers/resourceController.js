const Resource = require("../models/Resource");

const createResource = async (req, res, next) => {
  try {
    const { latitude, longitude, ...resourceData } = req.body;
    const resource = await Resource.create({
      ...resourceData,
      location: {
        type: "Point",
        coordinates: [Number(longitude), Number(latitude)],
      },
    });

    res.status(201).json({
      success: true,
      message: "Resource created successfully",
      data: resource,
    });
  } catch (error) {
    next(error);
  }
};

const getResources = async (req, res, next) => {
  try {
    const resources = await Resource.find();

    res.status(200).json({
      success: true,
      data: resources,
    });
  } catch (error) {
    next(error);
  }
};

const getResourceById = async (req, res, next) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: "Resource not found",
      });
    }

    res.status(200).json({
      success: true,
      data: resource,
    });
  } catch (error) {
    next(error);
  }
};

const updateResource = async (req, res, next) => {
  try {
    const resource = await Resource.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!resource) return res.status(404).json({ success: false, message: "Resource not found" });
    res.status(200).json({ success: true, message: "Resource updated successfully", data: resource });
  } catch (error) { next(error); }
};

const deleteResource = async (req, res, next) => {
  try {
    const resource = await Resource.findByIdAndDelete(req.params.id);
    if (!resource) return res.status(404).json({ success: false, message: "Resource not found" });
    res.status(204).send();
  } catch (error) { next(error); }
};

module.exports = {
  createResource,
  getResources,
  getResourceById,
  updateResource,
  deleteResource,
};