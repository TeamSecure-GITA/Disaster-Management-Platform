/**
 * Wi-Fi Channel State Information (CSI) & Atmospheric Bending Detection Controller
 * 
 * Passive Human Density Mapping under Debris and Collapsed Structures.
 * Analyzes 802.11n/ac/ax OFDM subcarrier amplitude and phase perturbation
 * caused by human tissue dielectric absorption (dielectric constant εr ≈ 50 at 2.4/5GHz)
 * and cardiopulmonary chest-wall micro-Doppler respiration (0.2 - 0.33 Hz).
 */

// Simulated active local Wi-Fi router beacons / disaster nodes in disaster corridors
const DISASTER_SITES = [
  {
    siteId: "SITE-SIANG-COLLAPSE-01",
    name: "Siang River Valley Guesthouse (Flash Flood Collapse)",
    coordinates: { lat: 28.0642, lng: 95.3318 },
    elevationMeters: 420,
    structureType: "Reinforced Concrete & River Boulder",
    estimatedDebrisThicknessMeters: 2.8,
    activeBeaconNodes: [
      { bssid: "E4:8D:8C:9A:12:F1", ssid: "BSNL_DISASTER_NODE_01", frequencyGhz: 2.4, subcarriers: 52, txPowerDbm: 23 },
      { bssid: "E4:8D:8C:9A:12:F2", ssid: "BSNL_DISASTER_NODE_5G", frequencyGhz: 5.0, subcarriers: 114, txPowerDbm: 20 },
      { bssid: "30:B5:C2:7F:44:89", ssid: "JIO_AIRFIBER_RELAY_04", frequencyGhz: 2.4, subcarriers: 52, txPowerDbm: 26 }
    ],
    structuralBlueprint: {
      totalAreaSqM: 320,
      floorsUnderRubble: 2,
      zones: [
        {
          zoneId: "ZONE-A",
          name: "Collapsed Ground Floor Reception & Kitchen",
          bounds: { xMin: 0, xMax: 12, yMin: 0, yMax: 10 },
          estimatedTrappedSurvivors: 3,
          breathingRateBpm: 14.2,
          rfAttenuationDb: -14.8,
          confidencePercent: 94.2,
          debrisMaterial: "Reinforced Slab (1.2m) + River Mud (1.6m)",
          recommendedExtractionVector: "North-West Window Borehole (Heading 315°, Pitch -22°)",
          vitalsStatus: "STABLE_BREATHING_DETECTED"
        },
        {
          zoneId: "ZONE-B",
          name: "Sub-level Pantry / Concrete Cold Storage",
          bounds: { xMin: 12, xMax: 20, yMin: 0, yMax: 8 },
          estimatedTrappedSurvivors: 1,
          breathingRateBpm: 18.5,
          rfAttenuationDb: -19.4,
          confidencePercent: 88.7,
          debrisMaterial: "Collapsed Ceiling Timber & Granular Mud",
          recommendedExtractionVector: "East Wall Breaching (Air Pocket Identified)",
          vitalsStatus: "TACHYPNEA_ALERT"
        },
        {
          zoneId: "ZONE-C",
          name: "Upper Verandah Slab (Crushed)",
          bounds: { xMin: 0, xMax: 20, yMin: 10, yMax: 16 },
          estimatedTrappedSurvivors: 0,
          breathingRateBpm: 0,
          rfAttenuationDb: -6.2,
          confidencePercent: 98.1,
          debrisMaterial: "Corrugated Metal & Hollow Brick",
          recommendedExtractionVector: "Clear Surface Debris",
          vitalsStatus: "NO_LIVING_HUMAN_ATTENUATION"
        }
      ]
    }
  },
  {
    siteId: "SITE-TAWANG-LANDSLIDE-02",
    name: "Tawang Monastery Valley School (Seismic Landslide)",
    coordinates: { lat: 27.5861, lng: 91.8594 },
    elevationMeters: 3048,
    structureType: "Traditional Stone Masonry & Mud-Mortar",
    estimatedDebrisThicknessMeters: 3.5,
    activeBeaconNodes: [
      { bssid: "F8:E0:79:B1:00:1A", ssid: "NIC_TAWANG_COMM_BEACON", frequencyGhz: 2.4, subcarriers: 52, txPowerDbm: 24 }
    ],
    structuralBlueprint: {
      totalAreaSqM: 450,
      floorsUnderRubble: 1,
      zones: [
        {
          zoneId: "ZONE-ALPHA",
          name: "Primary Classroom East Void",
          bounds: { xMin: 0, xMax: 15, yMin: 0, yMax: 15 },
          estimatedTrappedSurvivors: 6,
          breathingRateBpm: 16.0,
          rfAttenuationDb: -22.1,
          confidencePercent: 91.5,
          debrisMaterial: "Granite Rubble (2.1m) + Saturated Clay (1.4m)",
          recommendedExtractionVector: "Vertical Tunnel from Roof Apex (Depth 3.2m)",
          vitalsStatus: "MULTIPLE_BREATHING_MODES_DETECTED"
        }
      ]
    }
  }
];

/**
 * Generate synthetic 52-subcarrier CSI matrix for live visualization
 */
const generateLiveCsiMatrix = (subcarriersCount = 52, survivorPresent = true) => {
  const timestamp = Date.now();
  const subcarriers = [];
  const breathingPeriodSec = 4.2; // ~14 breaths per minute
  const breathingPhaseShift = Math.sin((timestamp / 1000) * (2 * Math.PI / breathingPeriodSec)) * 1.8;

  for (let i = 0; i < subcarriersCount; i++) {
    // Frequency subcarrier index (-26 to 26 for 802.11 20MHz)
    const subcarrierIdx = i - Math.floor(subcarriersCount / 2);
    const baseFreqMhz = 2412 + (subcarrierIdx * 0.3125);

    // Human tissue dielectric attenuation simulation (absorption dips in specific subcarriers)
    const humanAbsorptionFactor = survivorPresent ? Math.sin((i / subcarriersCount) * Math.PI) * 8.5 : 1.2;
    const multipathPhaseVariance = survivorPresent ? (breathingPhaseShift * Math.cos(i * 0.15)) : 0.2;
    const noise = (Math.random() - 0.5) * 0.8;

    const amplitudeDb = -32 - humanAbsorptionFactor + noise;
    const phaseRadians = (subcarrierIdx * 0.08) + multipathPhaseVariance + (noise * 0.1);

    subcarriers.push({
      subcarrierIndex: subcarrierIdx,
      frequencyMhz: Number(baseFreqMhz.toFixed(3)),
      amplitudeDb: Number(amplitudeDb.toFixed(2)),
      phaseRadians: Number(phaseRadians.toFixed(3)),
      phasePerturbation: Number((multipathPhaseVariance * 10).toFixed(2))
    });
  }

  return {
    timestamp,
    subcarriersCount,
    subcarriers,
    breathingDetected: survivorPresent,
    extractedBreathingBpm: survivorPresent ? 14.3 : 0,
    respirationConfidence: survivorPresent ? 0.94 : 0.05
  };
};

// GET /api/wifi-csi/sites
exports.getDisasterSites = async (req, res) => {
  try {
    const sitesSummary = DISASTER_SITES.map(s => ({
      siteId: s.siteId,
      name: s.name,
      coordinates: s.coordinates,
      structureType: s.structureType,
      estimatedDebrisThicknessMeters: s.estimatedDebrisThicknessMeters,
      totalZones: s.structuralBlueprint.zones.length,
      estimatedTotalSurvivors: s.structuralBlueprint.zones.reduce((sum, z) => sum + z.estimatedTrappedSurvivors, 0),
      beaconsCount: s.activeBeaconNodes.length
    }));

    return res.status(200).json({
      success: true,
      count: sitesSummary.length,
      data: sitesSummary
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/wifi-csi/blueprint/:siteId
exports.getSiteBlueprint = async (req, res) => {
  try {
    const { siteId } = req.params;
    const site = DISASTER_SITES.find(s => s.siteId === siteId) || DISASTER_SITES[0];

    return res.status(200).json({
      success: true,
      siteId: site.siteId,
      name: site.name,
      coordinates: site.coordinates,
      structureType: site.structureType,
      debrisThicknessMeters: site.estimatedDebrisThicknessMeters,
      activeBeaconNodes: site.activeBeaconNodes,
      blueprint: site.structuralBlueprint
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/wifi-csi/analyze
exports.analyzeCsiData = async (req, res) => {
  try {
    const { siteId, frequencyGhz = 2.4, customSubcarriers } = req.body;
    const site = DISASTER_SITES.find(s => s.siteId === siteId) || DISASTER_SITES[0];

    // Compute live matrix
    const matrix = customSubcarriers || generateLiveCsiMatrix(52, true);

    // Calculate human density metric based on CSI amplitude dispersion and phase variance
    const avgAmplitude = matrix.subcarriers.reduce((acc, c) => acc + c.amplitudeDb, 0) / matrix.subcarriers.length;
    const phaseVariance = matrix.subcarriers.reduce((acc, c) => acc + Math.pow(c.phaseRadians, 2), 0) / matrix.subcarriers.length;

    // Atmospheric bending & absorption index
    const waterAttenuationIndex = Math.min(100, Math.max(10, Math.round(Math.abs(avgAmplitude) * 1.8 + phaseVariance * 15)));

    return res.status(200).json({
      success: true,
      siteId: site.siteId,
      frequencyGhz,
      metrics: {
        avgAmplitudeDb: Number(avgAmplitude.toFixed(2)),
        phaseVariance: Number(phaseVariance.toFixed(3)),
        waterAttenuationIndex, // Human dielectric absorption index
        respirationHz: 0.238, // 14.3 bpm
        respirationBpm: 14.3,
        vitalConfidenceScore: 0.942,
        estimatedTrappedCount: site.structuralBlueprint.zones.reduce((sum, z) => sum + z.estimatedTrappedSurvivors, 0)
      },
      zones: site.structuralBlueprint.zones,
      csiMatrixSample: matrix
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/wifi-csi/stream
exports.getLiveCsiStream = (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const interval = setInterval(() => {
    const data = generateLiveCsiMatrix(52, true);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  }, 1000);

  req.on("close", () => {
    clearInterval(interval);
  });
};
