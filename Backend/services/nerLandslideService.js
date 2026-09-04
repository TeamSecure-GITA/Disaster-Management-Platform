/**
 * NER Landslide & Slope Risk Monitoring Service
 * Specialized early warning and risk intelligence engine for the 8 North Eastern Region States:
 * Assam, Meghalaya, Sikkim, Arunachal Pradesh, Nagaland, Manipur, Mizoram, and Tripura.
 */

// In-memory or persisted store for field crack & slope movement observations
let fieldCrackObservations = [
  {
    id: "OBS-NER-001",
    locationName: "NH-29 Dzüdza Slope, Kohima-Dimapur corridor",
    coordinates: [94.0256, 25.6741],
    state: "Nagaland",
    crackLengthMeters: 14.5,
    crackWidthCm: 8.2,
    slopeAngleDeg: 48,
    soilSaturationPercent: 88,
    status: "Active Movement",
    severity: "Critical",
    roadStatus: "Partially Blocked (One-way only)",
    reportedBy: "Field Geologist T. Ao (State Disaster Authority)",
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    photoUrl: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&auto=format&fit=crop&q=60"
  },
  {
    id: "OBS-NER-002",
    locationName: "29th Mile, NH-10 Teesta Valley, Kalimpong-Sikkim border",
    coordinates: [88.4612, 27.0654],
    state: "Sikkim",
    crackLengthMeters: 22.0,
    crackWidthCm: 12.5,
    slopeAngleDeg: 54,
    soilSaturationPercent: 94,
    status: "Immediate Collapse Risk",
    severity: "Critical",
    roadStatus: "Fully Blocked (Debris Clearance underway)",
    reportedBy: "BRO Task Force / District Control Room",
    timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
    photoUrl: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&auto=format&fit=crop&q=60"
  },
  {
    id: "OBS-NER-003",
    locationName: "Jatinga Slopes, Dima Hasao railway bypass",
    coordinates: [92.9867, 25.1321],
    state: "Assam",
    crackLengthMeters: 9.0,
    crackWidthCm: 4.5,
    slopeAngleDeg: 38,
    soilSaturationPercent: 79,
    status: "Under Observation",
    severity: "High",
    roadStatus: "Caution - Heavy Vehicles Restricted",
    reportedBy: "N.F. Railway Patrol Team",
    timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
    photoUrl: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&auto=format&fit=crop&q=60"
  }
];

// Live monitoring state for NER Highways & critical corridors
const nerCorridors = [
  {
    id: "CORR-01",
    route: "NH-10 (Sevoke - Gangtok)",
    states: ["Sikkim", "West Bengal"],
    status: "Blocked",
    blockageLocation: "Birik Dara & 29th Mile",
    debrisVolumeCuM: 4200,
    estimatedClearanceHours: 6,
    alternateRoute: "Via Lava - Algarah - Gorubathan (Light vehicles only)",
    isolatedVillages: 14,
    riskScore: 92,
    severity: "Critical"
  },
  {
    id: "CORR-02",
    route: "NH-29 (Dimapur - Kohima)",
    states: ["Nagaland"],
    status: "Caution",
    blockageLocation: "Phesama Mudslide Sector",
    debrisVolumeCuM: 800,
    estimatedClearanceHours: 2,
    alternateRoute: "Jotsoma Old Bypass",
    isolatedVillages: 6,
    riskScore: 78,
    severity: "High"
  },
  {
    id: "CORR-03",
    route: "NH-6 (Shillong - Silchar)",
    states: ["Meghalaya", "Assam"],
    status: "Caution",
    blockageLocation: "Sonapur Tunnel Outfall",
    debrisVolumeCuM: 1200,
    estimatedClearanceHours: 3,
    alternateRoute: "Via Umkiang bypass (Single lane alternating)",
    isolatedVillages: 9,
    riskScore: 84,
    severity: "High"
  },
  {
    id: "CORR-04",
    route: "NH-13 (Trans-Arunachal Highway / Bhalukpong - Tawang)",
    states: ["Arunachal Pradesh"],
    status: "Open with Advisory",
    blockageLocation: "Sela Pass descent",
    debrisVolumeCuM: 150,
    estimatedClearanceHours: 0,
    alternateRoute: "Direct highway passable",
    isolatedVillages: 2,
    riskScore: 61,
    severity: "Medium"
  },
  {
    id: "CORR-05",
    route: "NH-102 (Imphal - Moreh International Highway)",
    states: ["Manipur"],
    status: "Open",
    blockageLocation: "None active",
    debrisVolumeCuM: 0,
    estimatedClearanceHours: 0,
    alternateRoute: "Regular movement permitted",
    isolatedVillages: 0,
    riskScore: 42,
    severity: "Low"
  },
  {
    id: "CORR-06",
    route: "NH-54 / NH-2 (Silchar - Aizawl lifeline)",
    states: ["Mizoram", "Assam"],
    status: "Caution",
    blockageLocation: "Kolasib Kawnpui stretch",
    debrisVolumeCuM: 650,
    estimatedClearanceHours: 2.5,
    alternateRoute: "Via Bairabi link",
    isolatedVillages: 5,
    riskScore: 71,
    severity: "High"
  }
];

// NER State Overview & Predictive Real-Time Analytics
const nerStateOverview = [
  {
    state: "Sikkim",
    code: "SK",
    capital: "Gangtok",
    districtsMonitored: 6,
    highestRiskDistrict: "Mangan & Pakyong",
    currentRainfall24hMm: 164.2,
    rainfallThresholdMm: 120.0,
    soilSaturationPercent: 93,
    averageSlopeDeg: 46,
    landslideSusceptibilityIndex: 0.91,
    riskLevel: "Critical",
    isolatedVillagesCount: 18,
    activeSensors: 42,
    imdBand: "Red Alert (Extremely Heavy Rainfall)",
    multilingualAlert: {
      en: "IMMEDIATE RED ALERT: Widespread slope destabilization across NH-10 Teesta corridor. Evacuate vulnerable river-bend habitations.",
      hi: "तत्काल रेड अलर्ट: एनएच-10 तीस्ता कॉरिडोर पर भारी भूस्खलन का खतरा। संवेदनशील क्षेत्रों को तुरंत खाली करें।",
      ne: "तत्काल रातो चेतावनी: एनएच-१० टिस्टा करिडोरमा व्यापक पहिरोको जोखिम। कमजोर बस्तीहरू तुरुन्त खाली गर्नुहोस्।",
      as: "জৰুৰী ৰঙা সতৰ্কবাণী: ছিকিম তিস্তা কৰিড’ৰত ভূমিস্খলনৰ প্ৰচণ্ড সম্ভাৱনা। নিৰাপদ স্থানলৈ স্থানান্তৰিত হওক।"
    }
  },
  {
    state: "Meghalaya",
    code: "ML",
    capital: "Shillong",
    districtsMonitored: 12,
    highestRiskDistrict: "East Khasi Hills (Cherrapunji/Sohra) & South Garo",
    currentRainfall24hMm: 212.8,
    rainfallThresholdMm: 150.0,
    soilSaturationPercent: 96,
    averageSlopeDeg: 42,
    landslideSusceptibilityIndex: 0.88,
    riskLevel: "Critical",
    isolatedVillagesCount: 14,
    activeSensors: 38,
    imdBand: "Red Alert (Torrential Downpour)",
    multilingualAlert: {
      en: "CRITICAL WARNING: Intense precipitation exceeding 200mm in Sohra plateau. High risk of mudslides along NH-6 Sonapur corridor.",
      hi: "गंभीर चेतावनी: चेरापूंजी पठार पर 200 मिमी से अधिक बारिश। एनएच-6 पर मलबे व भूस्खलन की चेतावनी।",
      as: "গুৰুতৰ সতৰ্কতা: মেঘালয়ৰ সোহৰা অঞ্চলত ২০০ মিমিৰো অধিক বৰষুণ। এনএইচ-৬ পথত ভূমিস্খলনৰ সম্ভাৱনা।"
    }
  },
  {
    state: "Nagaland",
    code: "NL",
    capital: "Kohima",
    districtsMonitored: 16,
    highestRiskDistrict: "Kohima & Phek",
    currentRainfall24hMm: 98.4,
    rainfallThresholdMm: 90.0,
    soilSaturationPercent: 85,
    averageSlopeDeg: 40,
    landslideSusceptibilityIndex: 0.79,
    riskLevel: "High",
    isolatedVillagesCount: 8,
    activeSensors: 26,
    imdBand: "Orange Alert (Heavy Rain)",
    multilingualAlert: {
      en: "ORANGE ALERT: Slope cracking detected at Dzüdza sector. Kohima-Dimapur night travel strictly discouraged.",
      hi: "ऑरेंज अलर्ट: कोहिमा-दीमापुर मार्ग पर ढलान दरारों की पुष्टि। रात के सफर से बचें।"
    }
  },
  {
    state: "Arunachal Pradesh",
    code: "AR",
    capital: "Itanagar",
    districtsMonitored: 26,
    highestRiskDistrict: "West Kameng, Kurung Kumey & Tawang",
    currentRainfall24hMm: 114.6,
    rainfallThresholdMm: 100.0,
    soilSaturationPercent: 82,
    averageSlopeDeg: 51,
    landslideSusceptibilityIndex: 0.82,
    riskLevel: "High",
    isolatedVillagesCount: 12,
    activeSensors: 31,
    imdBand: "Orange Alert (Heavy to Very Heavy Rain)",
    multilingualAlert: {
      en: "ORANGE ALERT: Sela & Bhalukpong mountain passes experiencing flash runoff and debris slip. Exercise caution.",
      hi: "ऑरेंज अलर्ट: भालुकपोंग और सेला दर्रे में मलबा गिरने की आशंका। प्रशासन के दिशा-निर्देशों का पालन करें।"
    }
  },
  {
    state: "Assam",
    code: "AS",
    capital: "Dispur",
    districtsMonitored: 31,
    highestRiskDistrict: "Dima Hasao (Haflong) & Karbi Anglong",
    currentRainfall24hMm: 128.0,
    rainfallThresholdMm: 110.0,
    soilSaturationPercent: 86,
    averageSlopeDeg: 34,
    landslideSusceptibilityIndex: 0.80,
    riskLevel: "High",
    isolatedVillagesCount: 15,
    activeSensors: 64,
    imdBand: "Orange Alert (Continuous Downpour)",
    multilingualAlert: {
      en: "HIGH RISK: Dima Hasao hill tracks and Barak Valley transit routes under high mudslide stress. SDRF on standby.",
      as: "উচ্চ সতৰ্কবাণী: ডিমা হাছাও পাহাৰীয়া এলেকাত আৰু বৰাক উপত্যকাত ভূমিস্খলনৰ সম্ভাৱনা। সতৰ্ক থাকক।",
      bn: "উচ্চ সতর্কতা: ডিমা হাসাও এবং বরাক উপত্যকায় ভূমিধসের আশঙ্কা। এসডিআরএফ সতর্ক রয়েছে।"
    }
  },
  {
    state: "Manipur",
    code: "MN",
    capital: "Imphal",
    districtsMonitored: 16,
    highestRiskDistrict: "Noney (Tupul railway sector) & Tamenglong",
    currentRainfall24hMm: 76.5,
    rainfallThresholdMm: 85.0,
    soilSaturationPercent: 74,
    averageSlopeDeg: 39,
    landslideSusceptibilityIndex: 0.68,
    riskLevel: "Moderate",
    isolatedVillagesCount: 4,
    activeSensors: 22,
    imdBand: "Yellow Advisory",
    multilingualAlert: {
      en: "ADVISORY: Railway construction corridors in Noney district on continuous geotechnical monitoring.",
      hi: "परामर्श: नोनी और तामेंगलांग क्षेत्रों में भूवैज्ञानिक निगरानी जारी।"
    }
  },
  {
    state: "Mizoram",
    code: "MZ",
    capital: "Aizawl",
    districtsMonitored: 11,
    highestRiskDistrict: "Aizawl & Lunglei",
    currentRainfall24hMm: 92.0,
    rainfallThresholdMm: 95.0,
    soilSaturationPercent: 78,
    averageSlopeDeg: 44,
    landslideSusceptibilityIndex: 0.74,
    riskLevel: "High",
    isolatedVillagesCount: 7,
    activeSensors: 24,
    imdBand: "Orange Alert",
    multilingualAlert: {
      en: "ORANGE ALERT: Sinking zones in Ramhlun and Laipuitlang monitored. Evacuation shelters designated.",
      hi: "ऑरेंज अलर्ट: आइजोल के धंसाव क्षेत्रों में राहत दल तैनात।"
    }
  },
  {
    state: "Tripura",
    code: "TR",
    capital: "Agartala",
    districtsMonitored: 8,
    highestRiskDistrict: "Dhalai & Jampui Hills",
    currentRainfall24hMm: 54.0,
    rainfallThresholdMm: 90.0,
    soilSaturationPercent: 62,
    averageSlopeDeg: 28,
    landslideSusceptibilityIndex: 0.45,
    riskLevel: "Moderate",
    isolatedVillagesCount: 1,
    activeSensors: 16,
    imdBand: "Green / Normal",
    multilingualAlert: {
      en: "MODERATE: Normal hillside runoff observed in Jampui ridges. No highway blockages reported.",
      bn: "স্বাভাবিক: জাম্পুই হিলস অঞ্চলে পরিস্থিতি নিয়ন্ত্রণে রয়েছে।"
    }
  }
];

// Calculation of Landslide Susceptibility Index (LSI)
function calculateLSI({ rainfall24h, threshold, soilSaturation, slopeAngle, historicalEvents = 5 }) {
  const rainFactor = Math.min(rainfall24h / (threshold || 100), 1.8) * 0.35;
  const soilFactor = (soilSaturation / 100) * 0.25;
  const slopeFactor = Math.min(slopeAngle / 60, 1.2) * 0.25;
  const histFactor = Math.min(historicalEvents / 10, 1.0) * 0.15;

  const rawScore = rainFactor + soilFactor + slopeFactor + histFactor;
  const normalizedLSI = Math.min(Math.max(rawScore, 0.05), 0.99);

  let riskLevel = "Low";
  if (normalizedLSI >= 0.8) riskLevel = "Critical";
  else if (normalizedLSI >= 0.65) riskLevel = "High";
  else if (normalizedLSI >= 0.45) riskLevel = "Moderate";

  return {
    lsiScore: Number(normalizedLSI.toFixed(2)),
    riskLevel,
    safetyFactor: Number((1 / (normalizedLSI + 0.1)).toFixed(2))
  };
}

// Emergency Response Prioritization Algorithm
function getResponsePrioritization() {
  return nerStateOverview.map(s => {
    // Priority formula combining LSI, isolated villages, and rainfall excess
    const rainExcess = Math.max(0, s.currentRainfall24hMm - s.rainfallThresholdMm);
    const priorityIndex = Math.round((s.landslideSusceptibilityIndex * 45) + (s.isolatedVillagesCount * 2.5) + (rainExcess * 0.2));

    return {
      state: s.state,
      priorityIndex: Math.min(priorityIndex, 100),
      riskLevel: s.riskLevel,
      isolatedVillages: s.isolatedVillagesCount,
      criticalHighways: nerCorridors.filter(c => c.states.includes(s.state) && c.status !== "Open").map(c => c.route),
      recommendedAction: s.riskLevel === "Critical"
        ? "Deploy NDRF/SDRF earthmovers, activate wireless satellite phones, pre-position food drops."
        : s.riskLevel === "High"
        ? "Restrict night transit, issue vernacular SMS alerts, inspect slope sensor telemetry."
        : "Standard vigilance and daily drone surveillance."
    };
  }).sort((a, b) => b.priorityIndex - a.priorityIndex);
}

// API methods
const getOverview = async () => {
  const totalIsolatedVillages = nerStateOverview.reduce((sum, s) => sum + s.isolatedVillagesCount, 0);
  const criticalHighwaysCount = nerCorridors.filter(c => c.status === "Blocked").length;
  const highRiskStatesCount = nerStateOverview.filter(s => s.riskLevel === "Critical" || s.riskLevel === "High").length;

  return {
    success: true,
    region: "North Eastern Region (NER) - 8 States",
    timestamp: new Date().toISOString(),
    metrics: {
      monitoredStates: 8,
      totalActiveSensors: nerStateOverview.reduce((sum, s) => sum + s.activeSensors, 0),
      highRiskStates: highRiskStatesCount,
      isolatedVillages: totalIsolatedVillages,
      blockedCorridors: criticalHighwaysCount,
      activeFieldObservations: fieldCrackObservations.length,
    },
    states: nerStateOverview,
    corridors: nerCorridors,
    prioritization: getResponsePrioritization(),
    recentObservations: fieldCrackObservations
  };
};

const getCorridors = async () => {
  return {
    success: true,
    corridors: nerCorridors
  };
};

const recordFieldObservation = async (data) => {
  const newObs = {
    id: `OBS-NER-${String(fieldCrackObservations.length + 1).padStart(3, "0")}`,
    locationName: data.locationName || "NER Hill Sector",
    coordinates: data.coordinates || [92.0, 26.0],
    state: data.state || "Assam",
    crackLengthMeters: Number(data.crackLengthMeters) || 0,
    crackWidthCm: Number(data.crackWidthCm) || 0,
    slopeAngleDeg: Number(data.slopeAngleDeg) || 40,
    soilSaturationPercent: Number(data.soilSaturationPercent) || 75,
    status: data.status || "Under Observation",
    severity: data.severity || "Medium",
    roadStatus: data.roadStatus || "Open",
    reportedBy: data.reportedBy || "Field Official / Citizen",
    timestamp: new Date().toISOString(),
    photoUrl: data.photoUrl || null
  };

  fieldCrackObservations.unshift(newObs);
  return {
    success: true,
    message: "NER Slope crack observation recorded successfully",
    observation: newObs
  };
};

module.exports = {
  getOverview,
  getCorridors,
  recordFieldObservation,
  calculateLSI,
  getResponsePrioritization
};
