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

// ─────────────────────────────────────────────────────────────────────────────
// AMC & Authority Revenue Stats
// ─────────────────────────────────────────────────────────────────────────────

const getAmcStats = async () => {
  const beacons = await LoRaBeacon.find();

  const authorityMap = {};
  let totalContractValueINR = 0;

  for (const b of beacons) {
    const amc = b.amcContract;
    if (amc && amc.contractId) {
      if (!authorityMap[amc.contractId]) {
        authorityMap[amc.contractId] = {
          contractId: amc.contractId,
          authority: amc.authority || "State Authority",
          tier: amc.tier || "standard",
          amountINR: amc.amountINR || 0,
          expiresAt: amc.expiresAt,
          beaconsCount: 0,
          onlineCount: 0,
          status: amc.expiresAt && new Date(amc.expiresAt) < new Date() ? "Expired" : "Active",
        };
        totalContractValueINR += amc.amountINR || 0;
      }
      authorityMap[amc.contractId].beaconsCount += 1;
      if (b.status === "online") authorityMap[amc.contractId].onlineCount += 1;
    }
  }

  const contracts = Object.values(authorityMap);

  return {
    totalContractValueINR,
    activeContractsCount: contracts.filter((c) => c.status === "Active").length,
    contracts,
    slaTarget: "99.5%",
    slaCurrent: "99.8%",
    mttrHours: "3.2 hrs",
    hardwareWarrantyActive: beacons.filter((b) => b.status !== "offline").length,
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// Demo Seed & Simulation
// ─────────────────────────────────────────────────────────────────────────────

const seedMeshNetwork = async (force = false) => {
  const count = await LoRaBeacon.countDocuments();
  if (count > 0 && !force) {
    return { seeded: false, message: `Mesh network already has ${count} beacons.` };
  }

  if (force) {
    await LoRaBeacon.deleteMany({});
    await MeshMessage.deleteMany({});
  }

  const demoBeacons = [
    {
      deviceEui: "70B3D57ED0001A01",
      name: "Upper Chamoli Ridge-01",
      villageName: "Chamoli Gopeshwar",
      district: "Chamoli",
      state: "Uttarakhand",
      type: "relay",
      powerSource: "solar",
      status: "online",
      batteryLevel: 92,
      solarVoltage: 4.4,
      firmwareVersion: "2.1.4-mesh",
      tiltThreshold: 12,
      location: { type: "Point", coordinates: [79.3245, 30.3956] },
      meshNeighbors: ["70B3D57ED0001A02", "70B3D57ED0001A99"],
      lastHeartbeat: new Date(),
      amcContract: {
        contractId: "AMC-UK-2026-042",
        authority: "SDRF Uttarakhand",
        tier: "premium",
        amountINR: 4200000,
        startDate: new Date("2026-01-01"),
        expiresAt: new Date("2027-03-31"),
      },
    },
    {
      deviceEui: "70B3D57ED0001A02",
      name: "Joshimath Cliff-02",
      villageName: "Joshimath Ward 4",
      district: "Chamoli",
      state: "Uttarakhand",
      type: "relay",
      powerSource: "solar",
      status: "online",
      batteryLevel: 88,
      solarVoltage: 4.2,
      firmwareVersion: "2.1.4-mesh",
      tiltThreshold: 10,
      location: { type: "Point", coordinates: [79.5661, 30.5564] },
      meshNeighbors: ["70B3D57ED0001A01", "70B3D57ED0001A03"],
      lastHeartbeat: new Date(),
      amcContract: {
        contractId: "AMC-UK-2026-042",
        authority: "SDRF Uttarakhand",
        tier: "premium",
        amountINR: 4200000,
        startDate: new Date("2026-01-01"),
        expiresAt: new Date("2027-03-31"),
      },
    },
    {
      deviceEui: "70B3D57ED0001A03",
      name: "Pipalkoti Gorge-03",
      villageName: "Pipalkoti Outpost",
      district: "Chamoli",
      state: "Uttarakhand",
      type: "relay",
      powerSource: "solar",
      status: "low_battery",
      batteryLevel: 18,
      solarVoltage: 2.1,
      firmwareVersion: "2.1.4-mesh",
      tiltThreshold: 15,
      location: { type: "Point", coordinates: [79.43, 30.43] },
      meshNeighbors: ["70B3D57ED0001A02", "70B3D57ED0001A99"],
      lastHeartbeat: new Date(Date.now() - 1000 * 60 * 18),
      amcContract: {
        contractId: "AMC-UK-2026-042",
        authority: "SDRF Uttarakhand",
        tier: "premium",
        amountINR: 4200000,
        startDate: new Date("2026-01-01"),
        expiresAt: new Date("2027-03-31"),
      },
    },
    {
      deviceEui: "70B3D57ED0001A99",
      name: "Alaknanda Base Gateway",
      villageName: "Alaknanda Valley",
      district: "Chamoli",
      state: "Uttarakhand",
      type: "gateway",
      powerSource: "hybrid",
      status: "online",
      batteryLevel: 98,
      solarVoltage: 4.8,
      firmwareVersion: "3.0.1-gw",
      location: { type: "Point", coordinates: [79.31, 30.38] },
      meshNeighbors: ["70B3D57ED0001A01", "70B3D57ED0001A03"],
      lastHeartbeat: new Date(),
      amcContract: {
        contractId: "AMC-UK-2026-042",
        authority: "SDRF Uttarakhand",
        tier: "premium",
        amountINR: 4200000,
        startDate: new Date("2026-01-01"),
        expiresAt: new Date("2027-03-31"),
      },
    },
    {
      deviceEui: "70B3D57ED0002B01",
      name: "Majuli Sandbar Relay-01",
      villageName: "Garamur Village",
      district: "Majuli",
      state: "Assam",
      type: "relay",
      powerSource: "solar",
      status: "online",
      batteryLevel: 78,
      solarVoltage: 3.9,
      firmwareVersion: "2.1.4-mesh",
      location: { type: "Point", coordinates: [94.2167, 26.95] },
      meshNeighbors: ["70B3D57ED0002B02", "70B3D57ED0002B99"],
      lastHeartbeat: new Date(),
      amcContract: {
        contractId: "AMC-AS-2026-018",
        authority: "SDMA Assam",
        tier: "standard",
        amountINR: 2800000,
        startDate: new Date("2026-01-15"),
        expiresAt: new Date("2026-12-31"),
      },
    },
    {
      deviceEui: "70B3D57ED0002B02",
      name: "Kamalabari River Post",
      villageName: "Kamalabari Ghat",
      district: "Majuli",
      state: "Assam",
      type: "relay",
      powerSource: "solar",
      status: "online",
      batteryLevel: 84,
      solarVoltage: 4.1,
      firmwareVersion: "2.1.4-mesh",
      location: { type: "Point", coordinates: [94.17, 26.91] },
      meshNeighbors: ["70B3D57ED0002B01", "70B3D57ED0002B99"],
      lastHeartbeat: new Date(),
      amcContract: {
        contractId: "AMC-AS-2026-018",
        authority: "SDMA Assam",
        tier: "standard",
        amountINR: 2800000,
        startDate: new Date("2026-01-15"),
        expiresAt: new Date("2026-12-31"),
      },
    },
    {
      deviceEui: "70B3D57ED0002B99",
      name: "Jorhat Brahmaputra Uplink",
      villageName: "Nimati Ghat Uplink",
      district: "Jorhat",
      state: "Assam",
      type: "gateway",
      powerSource: "hybrid",
      status: "online",
      batteryLevel: 100,
      solarVoltage: 5.0,
      firmwareVersion: "3.0.1-gw",
      location: { type: "Point", coordinates: [94.2037, 26.7509] },
      meshNeighbors: ["70B3D57ED0002B01", "70B3D57ED0002B02"],
      lastHeartbeat: new Date(),
      amcContract: {
        contractId: "AMC-AS-2026-018",
        authority: "SDMA Assam",
        tier: "standard",
        amountINR: 2800000,
        startDate: new Date("2026-01-15"),
        expiresAt: new Date("2026-12-31"),
      },
    },
    {
      deviceEui: "70B3D57ED0003C01",
      name: "Wayanad Chooramala Slopes",
      villageName: "Chooramala Hill",
      district: "Wayanad",
      state: "Kerala",
      type: "relay",
      powerSource: "solar",
      status: "online",
      batteryLevel: 82,
      solarVoltage: 4.0,
      firmwareVersion: "2.1.4-mesh",
      tiltThreshold: 14,
      location: { type: "Point", coordinates: [76.15, 11.52] },
      meshNeighbors: ["70B3D57ED0003C99"],
      lastHeartbeat: new Date(),
      amcContract: {
        contractId: "AMC-KL-2026-009",
        authority: "KSDMA Kerala",
        tier: "premium",
        amountINR: 3600000,
        startDate: new Date("2026-02-01"),
        expiresAt: new Date("2027-06-30"),
      },
    },
    {
      deviceEui: "70B3D57ED0003C99",
      name: "Meppadi Rescue Uplink",
      villageName: "Meppadi Station",
      district: "Wayanad",
      state: "Kerala",
      type: "gateway",
      powerSource: "hybrid",
      status: "online",
      batteryLevel: 95,
      solarVoltage: 4.6,
      firmwareVersion: "3.0.1-gw",
      location: { type: "Point", coordinates: [76.12, 11.55] },
      meshNeighbors: ["70B3D57ED0003C01"],
      lastHeartbeat: new Date(),
      amcContract: {
        contractId: "AMC-KL-2026-009",
        authority: "KSDMA Kerala",
        tier: "premium",
        amountINR: 3600000,
        startDate: new Date("2026-02-01"),
        expiresAt: new Date("2027-06-30"),
      },
    },
  ];

  await LoRaBeacon.insertMany(demoBeacons);

  // Ingest sample emergency message: SOS multi-hop
  await ingestMessage({
    messageId: `demo-sos-${Date.now()}`,
    type: "sos",
    originEui: "70B3D57ED0001A02",
    gatewayEui: "70B3D57ED0001A99",
    relayPath: ["70B3D57ED0001A02", "70B3D57ED0001A01", "70B3D57ED0001A99"],
    latitude: 30.5564,
    longitude: 79.5661,
    rssi: -78,
    snr: 8.5,
    hopCount: 2,
    payload: {
      message: "Flash flood cutoff at Joshimath Ward 4 — 12 villagers trapped, telecom towers severed.",
      emergencyType: "flood",
      batteryLevel: 88,
      solarVoltage: 4.2,
    },
  });

  // Ingest sample soil tilt alert
  await ingestMessage({
    messageId: `demo-tilt-${Date.now()}`,
    type: "soil_tilt",
    originEui: "70B3D57ED0001A01",
    gatewayEui: "70B3D57ED0001A99",
    relayPath: ["70B3D57ED0001A01", "70B3D57ED0001A99"],
    latitude: 30.3956,
    longitude: 79.3245,
    rssi: -84,
    snr: 6.8,
    hopCount: 1,
    payload: {
      tiltAngle: 16.4,
      pitch: 12.1,
      roll: 11.2,
      accelerationZ: 0.94,
      batteryLevel: 92,
      solarVoltage: 4.4,
    },
  });

  return {
    seeded: true,
    message: "Demo mesh network initialized with 9 beacons, active links, and emergency telemetry.",
    beaconsCount: demoBeacons.length,
  };
};

const simulateMeshPacket = async (params = {}) => {
  const { type = "sos", originEui, messageText } = params;

  const beacons = await LoRaBeacon.find();
  if (beacons.length === 0) {
    await seedMeshNetwork(false);
  }

  const gateways = beacons.filter((b) => b.type === "gateway");
  const relays = beacons.filter((b) => b.type !== "gateway");

  const origin = originEui
    ? beacons.find((b) => b.deviceEui === originEui) || relays[0]
    : relays[Math.floor(Math.random() * relays.length)] || beacons[0];

  const gateway = gateways[0] || beacons[beacons.length - 1];

  const uniqueId = `sim-${type}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const lat = origin.location.coordinates[1];
  const lng = origin.location.coordinates[0];

  let payload = {};
  if (type === "sos") {
    payload = {
      message: messageText || `Off-grid SOS from ${origin.villageName || origin.name}: urgent rescue needed!`,
      emergencyType: "flood",
      batteryLevel: origin.batteryLevel ?? 85,
      solarVoltage: origin.solarVoltage ?? 4.2,
    };
  } else if (type === "soil_tilt") {
    const angle = origin.tiltThreshold ? origin.tiltThreshold + 4.5 : 19.5;
    payload = {
      tiltAngle: angle,
      pitch: 14.2,
      roll: 13.5,
      batteryLevel: origin.batteryLevel ?? 90,
      solarVoltage: origin.solarVoltage ?? 4.3,
    };
  } else {
    payload = {
      batteryLevel: Math.min(100, (origin.batteryLevel ?? 80) + 2),
      solarVoltage: 4.5,
      firmwareVersion: origin.firmwareVersion || "2.1.4-mesh",
    };
  }

  const result = await ingestMessage({
    messageId: uniqueId,
    type,
    originEui: origin.deviceEui,
    gatewayEui: gateway.deviceEui,
    relayPath: [origin.deviceEui, ...(origin.meshNeighbors?.[0] ? [origin.meshNeighbors[0]] : []), gateway.deviceEui],
    latitude: lat,
    longitude: lng,
    rssi: -72 - Math.floor(Math.random() * 25),
    snr: +(5 + Math.random() * 6).toFixed(1),
    hopCount: origin.meshNeighbors?.length > 0 ? 2 : 1,
    payload,
  });

  return result;
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
  getAmcStats,
  seedMeshNetwork,
  simulateMeshPacket,
};
