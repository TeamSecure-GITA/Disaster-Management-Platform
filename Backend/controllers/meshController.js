const meshService = require("../services/meshService");

// ─────────────────────────────────────────────────────────────────────────────
// Gateway webhook — ingest mesh messages (API-key auth)
// ─────────────────────────────────────────────────────────────────────────────

const ingestMessage = async (req, res, next) => {
  try {
    const result = await meshService.ingestMessage(req.body);

    if (result.duplicate) {
      return res.status(200).json({
        success: true,
        message: "Duplicate message — already processed",
        duplicate: true,
        data: result.message,
      });
    }

    res.status(201).json({
      success: true,
      message: "Mesh message ingested successfully",
      data: result.message,
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Beacon CRUD
// ─────────────────────────────────────────────────────────────────────────────

const registerBeacon = async (req, res, next) => {
  try {
    const { latitude, longitude, ...beaconData } = req.body;

    const hasLat =
      latitude !== undefined && latitude !== null && !isNaN(Number(latitude));
    const hasLng =
      longitude !== undefined && longitude !== null && !isNaN(Number(longitude));

    const data = {
      ...beaconData,
      location: {
        type: "Point",
        coordinates: [
          hasLng ? Number(longitude) : 0,
          hasLat ? Number(latitude) : 0,
        ],
      },
    };

    const beacon = await meshService.registerBeacon(data);

    res.status(201).json({
      success: true,
      message: "Beacon registered successfully",
      data: beacon,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "A beacon with this EUI already exists",
      });
    }
    next(error);
  }
};

const getBeacons = async (req, res, next) => {
  try {
    const beacons = await meshService.getBeacons(req.query);

    res.status(200).json({
      success: true,
      data: beacons,
      count: beacons.length,
    });
  } catch (error) {
    next(error);
  }
};

const getBeaconById = async (req, res, next) => {
  try {
    const result = await meshService.getBeaconById(req.params.id);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Beacon not found",
      });
    }

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const updateBeacon = async (req, res, next) => {
  try {
    const beacon = await meshService.updateBeacon(req.params.id, req.body);

    if (!beacon) {
      return res.status(404).json({
        success: false,
        message: "Beacon not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Beacon updated successfully",
      data: beacon,
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Network health & topology
// ─────────────────────────────────────────────────────────────────────────────

const getBeaconHealth = async (req, res, next) => {
  try {
    const health = await meshService.getBeaconHealth();

    res.status(200).json({
      success: true,
      data: health,
    });
  } catch (error) {
    next(error);
  }
};

const getMeshMessages = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, ...filters } = req.query;
    const result = await meshService.getMeshMessages(
      filters,
      parseInt(page, 10),
      parseInt(limit, 10)
    );

    res.status(200).json({
      success: true,
      data: result.messages,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getMeshTopology = async (req, res, next) => {
  try {
    const topology = await meshService.getMeshTopology();

    res.status(200).json({
      success: true,
      data: topology,
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// SOS acknowledgement
// ─────────────────────────────────────────────────────────────────────────────

const acknowledgeSOS = async (req, res, next) => {
  try {
    const message = await meshService.acknowledgeMeshSOS(
      req.params.id,
      req.user?._id,
      req.body.status
    );

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Mesh message not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "SOS acknowledged",
      data: message,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  ingestMessage,
  registerBeacon,
  getBeacons,
  getBeaconById,
  updateBeacon,
  getBeaconHealth,
  getMeshMessages,
  getMeshTopology,
  acknowledgeSOS,
};
