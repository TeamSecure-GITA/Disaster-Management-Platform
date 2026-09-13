const LoRaBeacon = require("../models/LoRaBeacon");
const MeshMessage = require("../models/MeshMessage");
const SOS = require("../models/SOS");
const {
  emitMeshSOS,
  emitMeshTiltAlert,
  emitBeaconStatus,
} = require("../sockets/meshSocket");

// ─────────────────────────────────────────────────────────────────────────────
// Beacon CRUD
// ─────────────────────────────────────────────────────────────────────────────

const registerBeacon = async (data) => {
  const beacon = await LoRaBeacon.create(data);
  return beacon;
};

const getBeacons = async (filters = {}) => {
  const query = {};

  if (filters.status) query.status = filters.status;
  if (filters.type) query.type = filters.type;
  if (filters.district) query.district = new RegExp(filters.district, "i");
  if (filters.villageName)
    query.villageName = new RegExp(filters.villageName, "i");
  if (filters.state) query.state = new RegExp(filters.state, "i");

  return LoRaBeacon.find(query).sort({ updatedAt: -1 });
};

const getBeaconById = async (id) => {
  const beacon = await LoRaBeacon.findById(id);
  if (!beacon) return null;

  const recentMessages = await MeshMessage.find({ originBeacon: beacon._id })
    .sort({ createdAt: -1 })
    .limit(50);

  return { beacon, recentMessages };
};

const updateBeacon = async (id, data) => {
  return LoRaBeacon.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// Message Ingestion — the core of the mesh system
// ─────────────────────────────────────────────────────────────────────────────

const ingestMessage = async (data) => {
  const {
    messageId,
    type,
    originEui,
    gatewayEui,
    relayPath = [],
    payload = {},
    latitude,
    longitude,
    rssi,
    snr,
    hopCount,
    originatedAt,
  } = data;

  // ── Deduplicate ──────────────────────────────────────────────────────────
  const existing = await MeshMessage.findOne({ messageId });
  if (existing) {
    return { duplicate: true, message: existing };
  }

  // ── Resolve origin beacon (auto-discover if unknown) ─────────────────────
  let originBeacon = await LoRaBeacon.findOne({ deviceEui: originEui });
  if (!originBeacon) {
    originBeacon = await LoRaBeacon.create({
      deviceEui: originEui,
      name: `Auto-discovered ${originEui}`,
      status: "online",
      location: {
        type: "Point",
        coordinates: [
          longitude !== undefined ? Number(longitude) : 0,
          latitude !== undefined ? Number(latitude) : 0,
        ],
      },
    });
  }

  // ── Resolve gateway beacon ───────────────────────────────────────────────
  let gatewayBeacon = null;
  if (gatewayEui) {
    gatewayBeacon = await LoRaBeacon.findOne({ deviceEui: gatewayEui });
  }

  // ── Build coordinates ────────────────────────────────────────────────────
  const hasLat =
    latitude !== undefined && latitude !== null && !isNaN(Number(latitude));
  const hasLng =
    longitude !== undefined && longitude !== null && !isNaN(Number(longitude));

  const coordinates = [
    hasLng ? Number(longitude) : originBeacon.location.coordinates[0],
    hasLat ? Number(latitude) : originBeacon.location.coordinates[1],
  ];

  // ── Create mesh message ──────────────────────────────────────────────────
  const meshMessage = await MeshMessage.create({
    messageId,
    type,
    originBeacon: originBeacon._id,
    originEui,
    relayPath,
    gatewayBeacon: gatewayBeacon?._id || null,
    gatewayEui: gatewayEui || null,
    payload,
    location: { type: "Point", coordinates },
    rssi: rssi ?? null,
    snr: snr ?? null,
    hopCount: hopCount ?? relayPath.length,
    originatedAt: originatedAt ? new Date(originatedAt) : new Date(),
    receivedAt: new Date(),
  });

  // ── Update beacon state ──────────────────────────────────────────────────
  const beaconUpdates = { lastHeartbeat: new Date(), status: "online" };

  if (payload.batteryLevel !== undefined) {
    beaconUpdates.batteryLevel = payload.batteryLevel;
    if (payload.batteryLevel < 20) {
      beaconUpdates.status = "low_battery";
    }
  }
  if (payload.solarVoltage !== undefined) {
    beaconUpdates.solarVoltage = payload.solarVoltage;
  }
  if (payload.firmwareVersion) {
    beaconUpdates.firmwareVersion = payload.firmwareVersion;
  }
  if (payload.meshNeighbors) {
    beaconUpdates.meshNeighbors = payload.meshNeighbors;
  }
  if (hasLat && hasLng) {
    beaconUpdates.location = { type: "Point", coordinates };
  }

  await LoRaBeacon.findByIdAndUpdate(originBeacon._id, beaconUpdates);

  // ── Type-specific processing ─────────────────────────────────────────────
  if (type === "sos") {
    await _processSOS(meshMessage, originBeacon, coordinates);
  } else if (type === "soil_tilt") {
    await _processTiltReading(meshMessage, originBeacon);
  } else if (type === "heartbeat") {
    // Heartbeat — beacon state already updated above
    emitBeaconStatus({
      beaconId: originBeacon._id,
      deviceEui: originEui,
      status: beaconUpdates.status,
      batteryLevel: beaconUpdates.batteryLevel,
      lastHeartbeat: beaconUpdates.lastHeartbeat,
    });
  }

  return { duplicate: false, message: meshMessage };
};

// ─────────────────────────────────────────────────────────────────────────────
// Internal helpers
// ─────────────────────────────────────────────────────────────────────────────

const _processSOS = async (meshMessage, originBeacon, coordinates) => {
  // Bridge to the existing SOS model so operations teams see mesh SOS
  // alongside phone-originated SOS in the same workflow
  const sos = await SOS.create({
    message: `[MESH SOS] ${meshMessage.payload.message || "Emergency SOS via LoRa mesh"} — Beacon: ${originBeacon.name} (${originBeacon.deviceEui}), Village: ${originBeacon.villageName || "Unknown"}`,
    emergencyType: meshMessage.payload.emergencyType || "other",
    location: { type: "Point", coordinates },
    priority: "critical",
    status: "active",
  });

  // Link back
  await MeshMessage.findByIdAndUpdate(meshMessage._id, { linkedSOS: sos._id });

  emitMeshSOS({
    meshMessage,
    sos,
    beacon: {
      _id: originBeacon._id,
      deviceEui: originBeacon.deviceEui,
      name: originBeacon.name,
      villageName: originBeacon.villageName,
    },
  });
};

const _processTiltReading = async (meshMessage, originBeacon) => {
  const tiltAngle = meshMessage.payload.tiltAngle;
  const threshold = originBeacon.tiltThreshold || 15;

  if (tiltAngle !== undefined && tiltAngle >= threshold) {
    // Tilt threshold breached — this could indicate soil movement / landslide risk
    emitMeshTiltAlert({
      meshMessage,
      beacon: {
        _id: originBeacon._id,
        deviceEui: originBeacon.deviceEui,
        name: originBeacon.name,
        villageName: originBeacon.villageName,
        district: originBeacon.district,
      },
      tiltAngle,
      threshold,
      severity: tiltAngle >= threshold * 2 ? "critical" : "warning",
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Message queries
// ─────────────────────────────────────────────────────────────────────────────

const getMeshMessages = async (filters = {}, page = 1, limit = 50) => {
  const query = {};

  if (filters.type) query.type = filters.type;
  if (filters.originBeacon) query.originBeacon = filters.originBeacon;
  if (filters.status) query.status = filters.status;
  if (filters.fromDate || filters.toDate) {
    query.createdAt = {};
    if (filters.fromDate) query.createdAt.$gte = new Date(filters.fromDate);
    if (filters.toDate) query.createdAt.$lte = new Date(filters.toDate);
  }

  const skip = (page - 1) * limit;

  const [messages, total] = await Promise.all([
    MeshMessage.find(query)
      .populate("originBeacon", "deviceEui name villageName district")
      .populate("gatewayBeacon", "deviceEui name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    MeshMessage.countDocuments(query),
  ]);

  return { messages, total, page, limit, totalPages: Math.ceil(total / limit) };
};

// ─────────────────────────────────────────────────────────────────────────────
// Network health / topology
// ─────────────────────────────────────────────────────────────────────────────

const getBeaconHealth = async () => {
  const beacons = await LoRaBeacon.find();
  const total = beacons.length;

  if (total === 0) {
    return {
      totalBeacons: 0,
      online: 0,
      offline: 0,
      lowBattery: 0,
      maintenance: 0,
      onlinePercent: 0,
      avgBattery: 0,
      gateways: 0,
      activeSOS: 0,
      recentTiltAlerts: 0,
    };
  }

  const online = beacons.filter((b) => b.status === "online").length;
  const offline = beacons.filter((b) => b.status === "offline").length;
  const lowBattery = beacons.filter((b) => b.status === "low_battery").length;
  const maintenance = beacons.filter((b) => b.status === "maintenance").length;
  const gateways = beacons.filter((b) => b.type === "gateway").length;

  const batteriedBeacons = beacons.filter((b) => b.batteryLevel !== null);
  const avgBattery =
    batteriedBeacons.length > 0
      ? Math.round(
          batteriedBeacons.reduce((sum, b) => sum + b.batteryLevel, 0) /
            batteriedBeacons.length
        )
      : 0;

  // Count active mesh SOS
  const activeSOS = await MeshMessage.countDocuments({
    type: "sos",
    status: { $in: ["received", "acknowledged"] },
  });

  // Count tilt alerts in last 24 hours
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const recentTiltAlerts = await MeshMessage.countDocuments({
    type: "soil_tilt",
    createdAt: { $gte: twentyFourHoursAgo },
    "payload.tiltAngle": { $exists: true },
  });

  return {
    totalBeacons: total,
    online,
    offline,
    lowBattery,
    maintenance,
    onlinePercent: Math.round((online / total) * 100),
    avgBattery,
    gateways,
    activeSOS,
    recentTiltAlerts,
  };
};

const getMeshTopology = async () => {
  const beacons = await LoRaBeacon.find().select(
    "deviceEui name villageName type status batteryLevel location meshNeighbors lastHeartbeat"
  );

  // Build links from meshNeighbors arrays
  const links = [];
  const seenLinks = new Set();

  for (const beacon of beacons) {
    for (const neighborEui of beacon.meshNeighbors || []) {
      // Deduplicate bidirectional links
      const linkKey = [beacon.deviceEui, neighborEui].sort().join("-");
      if (!seenLinks.has(linkKey)) {
        seenLinks.add(linkKey);
        links.push({
          source: beacon.deviceEui,
          target: neighborEui,
        });
      }
    }
  }

  return { nodes: beacons, links };
};

// ─────────────────────────────────────────────────────────────────────────────
// SOS acknowledgement
// ─────────────────────────────────────────────────────────────────────────────

const acknowledgeMeshSOS = async (messageId, userId, newStatus) => {
  const validStatuses = ["acknowledged", "dispatched", "resolved"];
  const status = validStatuses.includes(newStatus) ? newStatus : "acknowledged";

  const message = await MeshMessage.findByIdAndUpdate(
    messageId,
    {
      status,
      acknowledgedBy: userId,
      acknowledgedAt: new Date(),
    },
    { new: true }
  );

  if (!message) return null;

  // Also update the linked SOS record if one exists
  if (message.linkedSOS) {
    const sosStatusMap = {
      acknowledged: "acknowledged",
      dispatched: "responding",
      resolved: "resolved",
    };
    await SOS.findByIdAndUpdate(message.linkedSOS, {
      status: sosStatusMap[status] || "acknowledged",
      ...(status === "resolved" ? { resolvedAt: new Date() } : {}),
      ...(status === "acknowledged" ? { respondedAt: new Date() } : {}),
    });
  }

  return message;
};

module.exports = {
  registerBeacon,
  getBeacons,
  getBeaconById,
  updateBeacon,
  ingestMessage,
  getMeshMessages,
  getBeaconHealth,
  getMeshTopology,
  acknowledgeMeshSOS,
};
