const mongoose = require("mongoose");
const Sensor = require("../models/Sensor");
const SensorReading = require("../models/SensorReading");
const Alert = require("../models/Alert");
const Notification = require("../models/Notification");
const { emitSensorReading } = require("../sockets/sensorSocket");
const { getIO } = require("../sockets/socket");

/**
 * Baseline Pre-Configured In-Situ Geotechnical Sensors across the 8 NER States
 * Spans: tiltmeters, piezometers, rain gauges, extensometers, soil moisture, geophones
 */
const DEFAULT_NER_SENSORS = [
  // ── SIKKIM (NH-10 Teesta Gorge Corridor) ─────────────────────────
  {
    deviceId: "SENS-SK-TILT-01",
    name: "29th Mile Teesta Gorge Inclinometer",
    type: "tilt",
    location: { type: "Point", coordinates: [88.4612, 27.0654] },
    status: "alert",
    unit: "degrees",
    threshold: { warning: 2.5, critical: 4.0 },
    lastReading: 4.82,
    lastSeen: new Date(),
    connectivity: {
      protocol: "lora",
      gatewayId: "GW-NER-SIKKIM-01",
      batteryVoltage: 3.82,
      batteryPct: 82,
      rssi: -78,
      snr: 9.2,
    },
    geotechProfile: {
      state: "Sikkim",
      district: "Kalimpong-Sikkim Border",
      corridor: "NH-10",
      slopeAngleDeg: 54,
      installationDepthMeters: 4.5,
      factorOfSafetyBaseline: 1.15,
    },
  },
  {
    deviceId: "SENS-SK-PIEZO-02",
    name: "Birik Dara Deep Pore Pressure Probe",
    type: "piezometer",
    location: { type: "Point", coordinates: [88.4521, 27.0432] },
    status: "online",
    unit: "kPa",
    threshold: { warning: 45.0, critical: 65.0 },
    lastReading: 58.4,
    lastSeen: new Date(),
    connectivity: {
      protocol: "lorawan",
      gatewayId: "GW-NER-SIKKIM-01",
      batteryVoltage: 3.95,
      batteryPct: 91,
      rssi: -72,
      snr: 10.1,
    },
    geotechProfile: {
      state: "Sikkim",
      district: "Pakyong",
      corridor: "NH-10",
      slopeAngleDeg: 48,
      installationDepthMeters: 6.0,
      factorOfSafetyBaseline: 1.25,
    },
  },
  {
    deviceId: "SENS-SK-EXT-03",
    name: "Teesta Bridge Approach Extensometer",
    type: "extensometer",
    location: { type: "Point", coordinates: [88.4715, 27.0812] },
    status: "online",
    unit: "mm",
    threshold: { warning: 10.0, critical: 20.0 },
    lastReading: 14.2,
    lastSeen: new Date(),
    connectivity: {
      protocol: "lora",
      gatewayId: "GW-NER-SIKKIM-01",
      batteryVoltage: 3.88,
      batteryPct: 86,
      rssi: -80,
      snr: 8.4,
    },
    geotechProfile: {
      state: "Sikkim",
      district: "Mangan",
      corridor: "NH-10",
      slopeAngleDeg: 50,
      installationDepthMeters: 1.0,
      factorOfSafetyBaseline: 1.2,
    },
  },

  // ── MEGHALAYA (NH-6 Sonapur Tunnel & Sohra Escarpment) ──────────
  {
    deviceId: "SENS-ML-SOIL-01",
    name: "Sohra Plateau Soil Saturation Probe",
    type: "soil_moisture",
    location: { type: "Point", coordinates: [91.7323, 25.2702] },
    status: "online",
    unit: "%",
    threshold: { warning: 80.0, critical: 92.0 },
    lastReading: 94.6,
    lastSeen: new Date(),
    connectivity: {
      protocol: "gsm_gprs",
      gatewayId: "GW-NER-SHILLONG-02",
      batteryVoltage: 4.05,
      batteryPct: 95,
      rssi: -65,
      snr: 12.0,
    },
    geotechProfile: {
      state: "Meghalaya",
      district: "East Khasi Hills",
      corridor: "Sohra-Shella Corridor",
      slopeAngleDeg: 42,
      installationDepthMeters: 1.5,
      factorOfSafetyBaseline: 1.3,
    },
  },
  {
    deviceId: "SENS-ML-PIEZO-02",
    name: "Sonapur Tunnel Outfall Piezometer",
    type: "piezometer",
    location: { type: "Point", coordinates: [92.3619, 25.1147] },
    status: "online",
    unit: "kPa",
    threshold: { warning: 50.0, critical: 70.0 },
    lastReading: 62.1,
    lastSeen: new Date(),
    connectivity: {
      protocol: "lora",
      gatewayId: "GW-NER-JAINTIA-01",
      batteryVoltage: 3.9,
      batteryPct: 88,
      rssi: -76,
      snr: 9.5,
    },
    geotechProfile: {
      state: "Meghalaya",
      district: "East Jaintia Hills",
      corridor: "NH-6",
      slopeAngleDeg: 46,
      installationDepthMeters: 8.0,
      factorOfSafetyBaseline: 1.18,
    },
  },

  // ── NAGALAND (NH-29 Dzüdza & Kohima Slopes) ─────────────────────
  {
    deviceId: "SENS-NL-EXT-01",
    name: "Dzüdza Mudslide Wire Extensometer",
    type: "extensometer",
    location: { type: "Point", coordinates: [94.0256, 25.6741] },
    status: "alert",
    unit: "mm",
    threshold: { warning: 12.0, critical: 25.0 },
    lastReading: 26.4,
    lastSeen: new Date(),
    connectivity: {
      protocol: "lorawan",
      gatewayId: "GW-NER-KOHIMA-01",
      batteryVoltage: 3.75,
      batteryPct: 75,
      rssi: -84,
      snr: 7.2,
    },
    geotechProfile: {
      state: "Nagaland",
      district: "Kohima",
      corridor: "NH-29",
      slopeAngleDeg: 48,
      installationDepthMeters: 2.0,
      factorOfSafetyBaseline: 1.12,
    },
  },
  {
    deviceId: "SENS-NL-TILT-02",
    name: "Phesama Slope Borehole Tiltmeter",
    type: "tilt",
    location: { type: "Point", coordinates: [94.1120, 25.6420] },
    status: "online",
    unit: "degrees",
    threshold: { warning: 2.0, critical: 3.8 },
    lastReading: 2.9,
    lastSeen: new Date(),
    connectivity: {
      protocol: "lora",
      gatewayId: "GW-NER-KOHIMA-01",
      batteryVoltage: 3.85,
      batteryPct: 84,
      rssi: -79,
      snr: 8.8,
    },
    geotechProfile: {
      state: "Nagaland",
      district: "Kohima",
      corridor: "NH-29",
      slopeAngleDeg: 44,
      installationDepthMeters: 5.0,
      factorOfSafetyBaseline: 1.22,
    },
  },

  // ── ASSAM (Dima Hasao Jatinga & Brahmaputra Corridor) ───────────
  {
    deviceId: "SENS-AS-RAIN-01",
    name: "Haflong Hill Rain Gauge",
    type: "rain_gauge",
    location: { type: "Point", coordinates: [92.9867, 25.1321] },
    status: "online",
    unit: "mm/h",
    threshold: { warning: 20.0, critical: 40.0 },
    lastReading: 28.5,
    lastSeen: new Date(),
    connectivity: {
      protocol: "gsm_gprs",
      gatewayId: "GW-NER-ASSAM-03",
      batteryVoltage: 4.1,
      batteryPct: 98,
      rssi: -62,
      snr: 13.0,
    },
    geotechProfile: {
      state: "Assam",
      district: "Dima Hasao",
      corridor: "Jatinga Railway Bypass",
      slopeAngleDeg: 38,
      installationDepthMeters: 0,
      factorOfSafetyBaseline: 1.35,
    },
  },
  {
    deviceId: "SENS-AS-GEO-02",
    name: "Jatinga Fault Acoustic Geophone",
    type: "geophone",
    location: { type: "Point", coordinates: [92.9912, 25.1285] },
    status: "online",
    unit: "mm/s",
    threshold: { warning: 1.2, critical: 2.8 },
    lastReading: 0.85,
    lastSeen: new Date(),
    connectivity: {
      protocol: "lora",
      gatewayId: "GW-NER-ASSAM-03",
      batteryVoltage: 3.82,
      batteryPct: 80,
      rssi: -82,
      snr: 7.9,
    },
    geotechProfile: {
      state: "Assam",
      district: "Dima Hasao",
      corridor: "Jatinga Railway Bypass",
      slopeAngleDeg: 40,
      installationDepthMeters: 3.5,
      factorOfSafetyBaseline: 1.28,
    },
  },

  // ── ARUNACHAL PRADESH (NH-13 Sela Pass Corridor) ────────────────
  {
    deviceId: "SENS-AR-TILT-01",
    name: "Sela Pass Descent Inclinometer",
    type: "tilt",
    location: { type: "Point", coordinates: [91.8653, 27.5861] },
    status: "online",
    unit: "degrees",
    threshold: { warning: 3.0, critical: 5.0 },
    lastReading: 2.1,
    lastSeen: new Date(),
    connectivity: {
      protocol: "satellite",
      gatewayId: "GW-NER-ARUNACHAL-01",
      batteryVoltage: 3.92,
      batteryPct: 90,
      rssi: -70,
      snr: 11.4,
    },
    geotechProfile: {
      state: "Arunachal Pradesh",
      district: "Tawang",
      corridor: "NH-13",
      slopeAngleDeg: 52,
      installationDepthMeters: 5.5,
      factorOfSafetyBaseline: 1.24,
    },
  },

  // ── MANIPUR (Noney Tupul Railway Valley) ────────────────────────
  {
    deviceId: "SENS-MN-PIEZO-01",
    name: "Noney Tupul Riverbank Piezometer",
    type: "piezometer",
    location: { type: "Point", coordinates: [93.6120, 24.8080] },
    status: "online",
    unit: "kPa",
    threshold: { warning: 40.0, critical: 60.0 },
    lastReading: 36.2,
    lastSeen: new Date(),
    connectivity: {
      protocol: "lora",
      gatewayId: "GW-NER-MANIPUR-01",
      batteryVoltage: 3.84,
      batteryPct: 85,
      rssi: -77,
      snr: 9.0,
    },
    geotechProfile: {
      state: "Manipur",
      district: "Noney",
      corridor: "NH-102",
      slopeAngleDeg: 42,
      installationDepthMeters: 4.0,
      factorOfSafetyBaseline: 1.3,
    },
  },

  // ── MIZORAM (NH-54 Aizawl - Kolasib) ────────────────────────────
  {
    deviceId: "SENS-MZ-EXT-01",
    name: "Kolasib Kawnpui Tension Crack Extensometer",
    type: "extensometer",
    location: { type: "Point", coordinates: [92.7176, 23.7271] },
    status: "online",
    unit: "mm",
    threshold: { warning: 10.0, critical: 22.0 },
    lastReading: 12.8,
    lastSeen: new Date(),
    connectivity: {
      protocol: "cellular_4g",
      gatewayId: "GW-NER-MIZORAM-01",
      batteryVoltage: 4.0,
      batteryPct: 93,
      rssi: -68,
      snr: 11.8,
    },
    geotechProfile: {
      state: "Mizoram",
      district: "Aizawl",
      corridor: "NH-54",
      slopeAngleDeg: 45,
      installationDepthMeters: 1.8,
      factorOfSafetyBaseline: 1.25,
    },
  },

  // ── TRIPURA (Jampui Hills) ──────────────────────────────────────
  {
    deviceId: "SENS-TR-SOIL-01",
    name: "Jampui Ridge Slope Moisture Array",
    type: "soil_moisture",
    location: { type: "Point", coordinates: [91.2868, 23.8315] },
    status: "online",
    unit: "%",
    threshold: { warning: 75.0, critical: 90.0 },
    lastReading: 68.2,
    lastSeen: new Date(),
    connectivity: {
      protocol: "lora",
      gatewayId: "GW-NER-TRIPURA-01",
      batteryVoltage: 3.86,
      batteryPct: 87,
      rssi: -81,
      snr: 8.2,
    },
    geotechProfile: {
      state: "Tripura",
      district: "North Tripura",
      corridor: "Jampui Highway",
      slopeAngleDeg: 32,
      installationDepthMeters: 2.0,
      factorOfSafetyBaseline: 1.45,
    },
  },
];

// In-memory runtime cache for sensors
const inMemorySensors = new Map();
DEFAULT_NER_SENSORS.forEach((s) => inMemorySensors.set(s.deviceId, { ...s, _id: s.deviceId }));

/**
 * Seed or sync default sensors into MongoDB if table is empty
 */
const ensureSensorsSeeded = async () => {
  if (mongoose.connection.readyState === 1) {
    try {
      const count = await Sensor.countDocuments();
      if (count === 0) {
        console.log(`[SensorService] Seeding ${DEFAULT_NER_SENSORS.length} in-situ slope sensors...`);
        for (const s of DEFAULT_NER_SENSORS) {
          try {
            await Sensor.create(s);
          } catch (e) {
            // Ignore duplicate key if already created
          }
        }
      }
    } catch (e) {
      console.warn("[SensorService] Seeding check note:", e.message);
    }
  }
};

// Trigger seed check
ensureSensorsSeeded();

/**
 * Create a new sensor
 */
const createSensor = async (sensorData) => {
  let created = null;
  if (mongoose.connection.readyState === 1) {
    created = await Sensor.create(sensorData);
  } else {
    created = {
      ...sensorData,
      _id: sensorData.deviceId || `sens-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
  inMemorySensors.set(created.deviceId || created._id, created);
  return created;
};

/**
 * Get all sensors with optional filtering
 */
const getAllSensors = async (filters = {}) => {
  const query = {};
  if (filters.type) query.type = filters.type;
  if (filters.status) query.status = filters.status;
  if (filters.state) query["geotechProfile.state"] = filters.state;
  if (filters.corridor) query["geotechProfile.corridor"] = filters.corridor;

  if (mongoose.connection.readyState === 1) {
    try {
      const sensors = await Sensor.find(query).sort({ lastSeen: -1 }).lean();
      if (sensors.length > 0) return sensors;
    } catch (e) {
      console.warn("[SensorService] getAllSensors DB fallback:", e.message);
    }
  }

  // Fallback to in-memory store
  let list = Array.from(inMemorySensors.values());
  if (filters.type) list = list.filter((s) => s.type === filters.type);
  if (filters.status) list = list.filter((s) => s.status === filters.status);
  if (filters.state) list = list.filter((s) => s.geotechProfile?.state === filters.state);
  if (filters.corridor) list = list.filter((s) => s.geotechProfile?.corridor === filters.corridor);
  return list;
};

/**
 * Get single sensor by ObjectId or deviceId
 */
const getSensorById = async (idOrDeviceId) => {
  if (mongoose.connection.readyState === 1) {
    try {
      let sensor = null;
      if (mongoose.Types.ObjectId.isValid(idOrDeviceId)) {
        sensor = await Sensor.findById(idOrDeviceId);
      }
      if (!sensor) {
        sensor = await Sensor.findOne({ deviceId: idOrDeviceId });
      }
      if (sensor) return sensor;
    } catch (e) {
      // Fallback
    }
  }
  return inMemorySensors.get(idOrDeviceId) || null;
};

/**
 * Return platform-wide sensor network summary
 */
const getSensorSummary = async () => {
  const sensors = await getAllSensors();
  const onlineCount = sensors.filter((s) => s.status === "online" || s.status === "alert").length;
  const alertCount = sensors.filter((s) => s.status === "alert").length;

  const byType = {};
  const byState = {};

  for (const s of sensors) {
    byType[s.type] = (byType[s.type] || 0) + 1;
    const st = s.geotechProfile?.state || "NER Regional";
    byState[st] = (byState[st] || 0) + 1;
  }

  return {
    totalSensors: sensors.length,
    activeSensors: onlineCount,
    offlineSensors: sensors.length - onlineCount,
    alertSensors: alertCount,
    meshHealthPct: sensors.length > 0 ? Number(((onlineCount / sensors.length) * 100).toFixed(1)) : 95.0,
    byType,
    byState,
    timestamp: new Date().toISOString(),
  };
};

/**
 * Get active sensor anomalies (readings exceeding critical or warning thresholds)
 */
const getSensorAnomalies = async () => {
  const sensors = await getAllSensors();
  const anomalies = [];

  for (const s of sensors) {
    const val = Number(s.lastReading) || 0;
    const crit = s.threshold?.critical;
    const warn = s.threshold?.warning;

    if (crit !== null && val >= crit) {
      anomalies.push({
        id: `anom-${s.deviceId}`,
        sensorId: s.deviceId,
        sensorName: s.name,
        type: s.type,
        state: s.geotechProfile?.state,
        corridor: s.geotechProfile?.corridor,
        detectedAt: s.lastSeen || new Date().toISOString(),
        anomalyScore: 0.95,
        severity: "critical",
        readingValue: val,
        unit: s.unit,
        threshold: crit,
        potentialCause: getPotentialGeotechCause(s.type, val),
      });
    } else if (warn !== null && val >= warn) {
      anomalies.push({
        id: `anom-${s.deviceId}`,
        sensorId: s.deviceId,
        sensorName: s.name,
        type: s.type,
        state: s.geotechProfile?.state,
        corridor: s.geotechProfile?.corridor,
        detectedAt: s.lastSeen || new Date().toISOString(),
        anomalyScore: 0.72,
        severity: "warning",
        readingValue: val,
        unit: s.unit,
        threshold: warn,
        potentialCause: getPotentialGeotechCause(s.type, val),
      });
    }
  }

  return anomalies;
};

const getPotentialGeotechCause = (type, value) => {
  switch (type) {
    case "tilt":
    case "mems_tilt":
      return `Rapid shear displacement along rock strata (${value}° angular tilt deviation)`;
    case "piezometer":
      return `Severe pore-water pressure buildup (${value} kPa) reducing effective normal stress`;
    case "soil_moisture":
      return `Soil matrix approaching full saturation liquid limit (${value}%)`;
    case "extensometer":
      return `Tension crack dilation (${value} mm) indicating impending slope face detachment`;
    case "rain_gauge":
      return `High-intensity cloudburst rate (${value} mm/h) accelerating soil infiltration`;
    case "geophone":
      return `Sub-audible micro-seismic acoustic emission from subsurface rock shear`;
    default:
      return "Critical geotechnical threshold breach detected by in-situ telemetry";
  }
};

/**
 * Add a sensor reading, evaluate thresholds, and trigger alerts/risk calculations
 */
const addSensorReading = async (readingData) => {
  const { deviceId, value, unit, protocol, gatewayId, batteryPct, rssi, snr, metadata } = readingData;
  const numValue = Number(value);

  // 1. Locate sensor
  let sensor = await getSensorById(readingData.sensor || deviceId);
  if (!sensor && deviceId) {
    // Auto-register sensor if transmitting from gateway for first time
    sensor = await createSensor({
      deviceId,
      name: `IoT Node ${deviceId}`,
      type: readingData.type || "mems_tilt",
      location: {
        type: "Point",
        coordinates: readingData.coordinates || [91.88, 25.57],
      },
      status: "online",
      unit: unit || "degrees",
      threshold: { warning: 2.5, critical: 4.0 },
      connectivity: { protocol: protocol || "lora", gatewayId },
    });
  }

  // 2. Evaluate threshold exceedance
  let alertSeverity = "normal";
  let isThresholdExceeded = false;
  let quality = "good";

  if (sensor && sensor.threshold) {
    if (sensor.threshold.critical !== null && numValue >= sensor.threshold.critical) {
      alertSeverity = "critical";
      isThresholdExceeded = true;
      quality = "critical";
    } else if (sensor.threshold.warning !== null && numValue >= sensor.threshold.warning) {
      alertSeverity = "warning";
      isThresholdExceeded = true;
      quality = "warning";
    }
  }

  // 3. Compute geotechnical indicators
  let geotechMetrics = {};
  if (sensor) {
    const depth = sensor.geotechProfile?.installationDepthMeters || 3.0;
    const baseFoS = sensor.geotechProfile?.factorOfSafetyBaseline || 1.35;

    if (sensor.type === "piezometer") {
      const ru = Math.min(0.85, Number((numValue / (depth * 20)).toFixed(2)));
      geotechMetrics.porePressureRatio = ru;
      geotechMetrics.estimatedFoS = Number(Math.max(0.6, baseFoS * (1 - ru * 0.9)).toFixed(2));
    } else if (sensor.type === "tilt" || sensor.type === "mems_tilt") {
      const prev = sensor.lastReading || 0;
      geotechMetrics.tiltRateDegPerDay = Number((Math.abs(numValue - prev) * 24).toFixed(2));
      geotechMetrics.estimatedFoS = Number(Math.max(0.5, baseFoS - numValue * 0.15).toFixed(2));
    } else if (sensor.type === "extensometer") {
      geotechMetrics.crackOpeningRateMmPerHr = Number((numValue / 12).toFixed(2));
      geotechMetrics.estimatedFoS = Number(Math.max(0.5, baseFoS - numValue * 0.04).toFixed(2));
    }
  }

  const recordPayload = {
    sensor: sensor?._id || new mongoose.Types.ObjectId(),
    deviceId: deviceId || sensor?.deviceId || "UNKNOWN-DEV",
    value: numValue,
    unit: unit || sensor?.unit || "",
    timestamp: new Date(),
    quality,
    isThresholdExceeded,
    alertTriggered: alertSeverity !== "normal",
    alertSeverity,
    gatewayId: gatewayId || sensor?.connectivity?.gatewayId || null,
    protocol: protocol || sensor?.connectivity?.protocol || "lora",
    batteryPct: batteryPct ?? sensor?.connectivity?.batteryPct,
    rssi: rssi ?? sensor?.connectivity?.rssi,
    snr: snr ?? sensor?.connectivity?.snr,
    geotechMetrics,
    metadata: metadata || {},
  };

  // 4. Save reading in DB if available
  let reading = null;
  if (mongoose.connection.readyState === 1) {
    try {
      reading = await SensorReading.create(recordPayload);
    } catch (dbErr) {
      console.warn("[SensorService] DB create reading note:", dbErr.message);
    }
  }
  if (!reading) {
    reading = { ...recordPayload, _id: `reading-${Date.now()}` };
  }

  // 5. Update Sensor state
  if (sensor) {
    sensor.lastReading = numValue;
    sensor.lastSeen = new Date();
    sensor.status = alertSeverity === "critical" ? "alert" : "online";
    if (batteryPct !== undefined && sensor.connectivity) sensor.connectivity.batteryPct = batteryPct;
    if (rssi !== undefined && sensor.connectivity) sensor.connectivity.rssi = rssi;

    if (mongoose.connection.readyState === 1 && sensor.save) {
      try {
        await sensor.save();
      } catch (err) {
        // Ignore
      }
    }
    inMemorySensors.set(sensor.deviceId, sensor);
  }

  // 6. Push real-time Socket.IO telemetry
  emitSensorReading(reading);

  // 7. 🚨 TURN READINGS INTO ALERTS & NOTIFICATIONS
  if (alertSeverity === "critical" || alertSeverity === "warning") {
    const sName = sensor?.name || deviceId;
    const sState = sensor?.geotechProfile?.state || "NER Mountain Region";
    const sCorridor = sensor?.geotechProfile?.corridor ? ` (${sensor.geotechProfile.corridor})` : "";
    const cause = getPotentialGeotechCause(sensor?.type, numValue);

    const alertTitle = `[IoT In-Situ Sensor Alert] ${sName}: Critical Threshold Exceeded`;
    const alertMessage = `Real-time sensor ${sName} in ${sState}${sCorridor} recorded ${numValue} ${sensor?.unit || ""}. Cause: ${cause}. Immediate geotechnical inspection & traffic caution advised.`;

    // Persist official Alert and Notification
    if (mongoose.connection.readyState === 1) {
      try {
        const createdAlert = await Alert.create({
          title: alertTitle,
          message: alertMessage,
          type: "landslide",
          severity: alertSeverity === "critical" ? "critical" : "high",
          location: sensor?.location || { type: "Point", coordinates: [91.88, 25.57] },
          radiusKm: alertSeverity === "critical" ? 25 : 15,
          isGovtOfficial: false,
          sourceAgency: `In-Situ IoT Sensor Network (${sensor?.connectivity?.protocol?.toUpperCase() || "LORA"})`,
          sourceNodalAgency: "State Disaster Management Authority (SDMA / GSI)",
          feedSource: "IOT_SLOPE_SENSOR",
          country: "India",
          affectedAreas: [sState, sensor?.geotechProfile?.district].filter(Boolean),
          urgency: "Immediate",
          certainty: "Observed",
          instructions: [
            "Geotechnical early warning triggered by physical ground sensor.",
            "Restrict transit along vulnerable road cuttings and escarpments.",
            "Inspect drainage culverts and clear debris blockages immediately.",
          ],
        });

        await Notification.create({
          title: alertTitle,
          message: alertMessage,
          type: "alert",
          priority: alertSeverity === "critical" ? "critical" : "high",
          isBroadcast: true,
          channels: ["in-app", "push"],
          metadata: {
            sensorId: sensor?.deviceId,
            sensorType: sensor?.type,
            readingValue: numValue,
            unit: sensor?.unit,
            corridor: sensor?.geotechProfile?.corridor,
            alertId: createdAlert._id,
          },
        });
      } catch (alertErr) {
        console.warn("[SensorService] Alert creation note:", alertErr.message);
      }
    }

    // Broadcast immediate Socket.IO warning
    try {
      const io = getIO();
      if (io) {
        io.emit("sensorAlert", {
          severity: alertSeverity,
          sensorId: sensor?.deviceId,
          sensorName: sName,
          state: sState,
          corridor: sensor?.geotechProfile?.corridor,
          readingValue: numValue,
          unit: sensor?.unit,
          threshold: alertSeverity === "critical" ? sensor?.threshold?.critical : sensor?.threshold?.warning,
          cause,
          timestamp: new Date(),
        });
      }
    } catch (socketErr) {
      // Ignore
    }
  }

  return reading;
};

/**
 * Get readings for a sensor
 */
const getSensorReadings = async (sensorId, limit = 50) => {
  if (mongoose.connection.readyState === 1) {
    try {
      return await SensorReading.find({
        $or: [{ sensor: sensorId }, { deviceId: sensorId }],
      })
        .sort({ timestamp: -1 })
        .limit(limit);
    } catch (e) {
      console.warn("[SensorService] getSensorReadings DB fallback:", e.message);
    }
  }
  return [];
};

/**
 * Device Gateway Ingest Protocol (GSM / GPRS / LoRa / LoRaWAN)
 * Ingests single, multi-channel, or batch sensor payloads directly from IoT Gateways
 */
const ingestGatewayPayload = async (payloadData) => {
  const { gatewayId, protocol = "lora", readings = [], rawGsmString } = payloadData;
  const processed = [];
  const alertsTriggered = [];

  // 1. If payload is raw GSM key-value string (e.g. "dev=SENS-01&val=4.82&bat=90")
  if (rawGsmString && typeof rawGsmString === "string") {
    const params = new URLSearchParams(rawGsmString);
    const deviceId = params.get("dev") || params.get("deviceId");
    const val = parseFloat(params.get("val") || params.get("value") || "0");
    const bat = parseFloat(params.get("bat") || params.get("battery") || "90");
    const tilt = params.get("tilt") ? parseFloat(params.get("tilt")) : null;
    const piezo = params.get("piezo") ? parseFloat(params.get("piezo")) : null;

    if (deviceId && !isNaN(val)) {
      const r = await addSensorReading({
        deviceId,
        value: val,
        protocol: "gsm_gprs",
        gatewayId: gatewayId || "GW-GSM-DIRECT",
        batteryPct: bat,
      });
      processed.push(r);
      if (r.alertTriggered) alertsTriggered.push(r);
    }

    if (tilt !== null && !isNaN(tilt)) {
      const rTilt = await addSensorReading({
        deviceId: `${deviceId}-TILT`,
        value: tilt,
        unit: "degrees",
        protocol: "gsm_gprs",
        gatewayId,
      });
      processed.push(rTilt);
      if (rTilt.alertTriggered) alertsTriggered.push(rTilt);
    }

    if (piezo !== null && !isNaN(piezo)) {
      const rPiezo = await addSensorReading({
        deviceId: `${deviceId}-PIEZO`,
        value: piezo,
        unit: "kPa",
        protocol: "gsm_gprs",
        gatewayId,
      });
      processed.push(rPiezo);
      if (rPiezo.alertTriggered) alertsTriggered.push(rPiezo);
    }

    return {
      success: true,
      protocol: "gsm_gprs",
      processedCount: processed.length,
      alertsCount: alertsTriggered.length,
      readings: processed,
    };
  }

  // 2. Multi-channel slope node payload (e.g. { deviceId, tilt, porePressure, soilMoisture, batteryPct })
  if (payloadData.deviceId && (payloadData.tilt !== undefined || payloadData.porePressure !== undefined || payloadData.soilMoisture !== undefined)) {
    const devId = payloadData.deviceId;

    if (payloadData.tilt !== undefined) {
      const r = await addSensorReading({
        deviceId: `${devId}-TILT`,
        value: Number(payloadData.tilt),
        unit: "degrees",
        protocol,
        gatewayId,
        batteryPct: payloadData.batteryPct,
        rssi: payloadData.rssi,
      });
      processed.push(r);
      if (r.alertTriggered) alertsTriggered.push(r);
    }

    if (payloadData.porePressure !== undefined) {
      const r = await addSensorReading({
        deviceId: `${devId}-PIEZO`,
        value: Number(payloadData.porePressure),
        unit: "kPa",
        protocol,
        gatewayId,
        batteryPct: payloadData.batteryPct,
        rssi: payloadData.rssi,
      });
      processed.push(r);
      if (r.alertTriggered) alertsTriggered.push(r);
    }

    if (payloadData.soilMoisture !== undefined) {
      const r = await addSensorReading({
        deviceId: `${devId}-SOIL`,
        value: Number(payloadData.soilMoisture),
        unit: "%",
        protocol,
        gatewayId,
        batteryPct: payloadData.batteryPct,
        rssi: payloadData.rssi,
      });
      processed.push(r);
      if (r.alertTriggered) alertsTriggered.push(r);
    }

    return {
      success: true,
      protocol,
      processedCount: processed.length,
      alertsCount: alertsTriggered.length,
      readings: processed,
    };
  }

  // 3. Batch readings array or standard single reading
  const items = Array.isArray(readings) && readings.length > 0 ? readings : [payloadData];
  for (const item of items) {
    if (!item.deviceId && !item.sensor) continue;
    const r = await addSensorReading({
      ...item,
      gatewayId: item.gatewayId || gatewayId,
      protocol: item.protocol || protocol,
    });
    processed.push(r);
    if (r.alertTriggered) alertsTriggered.push(r);
  }

  return {
    success: true,
    protocol,
    processedCount: processed.length,
    alertsCount: alertsTriggered.length,
    readings: processed,
  };
};

module.exports = {
  createSensor,
  getAllSensors,
  getSensorById,
  getSensorSummary,
  getSensorAnomalies,
  addSensorReading,
  getSensorReadings,
  ingestGatewayPayload,
  DEFAULT_NER_SENSORS,
};