import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Fallback initial data in case backend server is spinning up
const INITIAL_DATA = {
  region: "North Eastern Region (NER) - 8 States",
  metrics: {
    monitoredStates: 8,
    totalActiveSensors: 243,
    highRiskStates: 5,
    isolatedVillages: 78,
    blockedCorridors: 2,
    activeFieldObservations: 3,
  },
  states: [
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
        en: "CRITICAL WARNING: Precipitation exceeding 200mm in Sohra plateau. High risk of mudslides along NH-6 Sonapur corridor.",
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
      imdBand: "Orange Alert (Heavy Rain)",
      multilingualAlert: {
        en: "ORANGE ALERT: Sela & Bhalukpong mountain passes experiencing flash runoff and debris slip. Exercise caution.",
        hi: "ऑरेंज अलर्ट: भालुकपोंग और सेला दर्रे में मलबा गिरने की आशंका।"
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
        bn: "উচ্চ সতর্কতা: ডিমা হাসাও এবং বরাক উপত্যকায় ভূমিধসের আশঙ্কা।"
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
  ],
  corridors: [
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
  ],
  prioritization: [
    {
      state: "Sikkim",
      priorityIndex: 94,
      riskLevel: "Critical",
      isolatedVillages: 18,
      criticalHighways: ["NH-10 (Sevoke - Gangtok)"],
      recommendedAction: "Deploy NDRF/SDRF earthmovers, activate wireless satellite phones, pre-position food drops."
    },
    {
      state: "Meghalaya",
      priorityIndex: 91,
      riskLevel: "Critical",
      isolatedVillages: 14,
      criticalHighways: ["NH-6 (Shillong - Silchar)"],
      recommendedAction: "Continuous clearance at Sonapur tunnel, coordinate border convoy with Assam SDRF."
    },
    {
      state: "Assam",
      priorityIndex: 82,
      riskLevel: "High",
      isolatedVillages: 15,
      criticalHighways: ["NH-6 (Shillong - Silchar)", "NH-54 (Silchar - Aizawl)"],
      recommendedAction: "Maintain standby emergency rail wagons at Lumding; monitor Dima Hasao slope sensors."
    },
    {
      state: "Nagaland",
      priorityIndex: 78,
      riskLevel: "High",
      isolatedVillages: 8,
      criticalHighways: ["NH-29 (Dimapur - Kohima)"],
      recommendedAction: "Restrict nighttime passenger movement; station heavy excavators at Dzüdza bridgehead."
    },
    {
      state: "Arunachal Pradesh",
      priorityIndex: 75,
      riskLevel: "High",
      isolatedVillages: 12,
      criticalHighways: ["NH-13 (Trans-Arunachal Highway)"],
      recommendedAction: "Coordinate with Border Roads Organisation (BRO) for Sela tunnel approach stabilization."
    }
  ],
  recentObservations: [
    {
      id: "OBS-NER-001",
      locationName: "NH-29 Dzüdza Slope, Kohima-Dimapur corridor",
      state: "Nagaland",
      crackLengthMeters: 14.5,
      crackWidthCm: 8.2,
      slopeAngleDeg: 48,
      soilSaturationPercent: 88,
      status: "Active Movement",
      severity: "Critical",
      roadStatus: "Partially Blocked (One-way only)",
      reportedBy: "Field Geologist T. Ao (State Disaster Authority)",
      timeAgo: "2 hours ago"
    },
    {
      id: "OBS-NER-002",
      locationName: "29th Mile, NH-10 Teesta Valley, Kalimpong-Sikkim border",
      state: "Sikkim",
      crackLengthMeters: 22.0,
      crackWidthCm: 12.5,
      slopeAngleDeg: 54,
      soilSaturationPercent: 94,
      status: "Immediate Collapse Risk",
      severity: "Critical",
      roadStatus: "Fully Blocked (Debris Clearance underway)",
      reportedBy: "BRO Task Force / District Control Room",
      timeAgo: "5 hours ago"
    },
    {
      id: "OBS-NER-003",
      locationName: "Jatinga Slopes, Dima Hasao railway bypass",
      state: "Assam",
      crackLengthMeters: 9.0,
      crackWidthCm: 4.5,
      slopeAngleDeg: 38,
      soilSaturationPercent: 79,
      status: "Under Observation",
      severity: "High",
      roadStatus: "Caution - Heavy Vehicles Restricted",
      reportedBy: "N.F. Railway Patrol Team",
      timeAgo: "12 hours ago"
    }
  ]
};

// Verified North Eastern Region (NER) Emergency Infrastructure
export const NER_EMERGENCY_FACILITIES = [
  // ── APEX HOSPITALS & TRAUMA CENTERS ──
  {
    id: "ner-hosp-1",
    name: "Gauhati Medical College & Hospital (GMCH)",
    category: "Level-1 Trauma Center & Apex Hospital",
    type: "hospital",
    state: "Assam",
    city: "Guwahati",
    address: "Narakasur Hilltop, Bhangagarh, Guwahati, Assam 781032",
    lat: 26.1584,
    lng: 91.7709,
    phone: "+91 361 2529457",
    emergencyPhone: "108 / 102",
    capacity: "1800 Beds • Apex Regional Trauma Care",
    status: "Open 24/7",
    facilities: ["Apex Trauma ICU", "Emergency Blood Bank", "Helipad Evacuation", "Disaster Ward"]
  },
  {
    id: "ner-hosp-2",
    name: "AIIMS Guwahati Apex Hospital",
    category: "Super Specialty Apex Hospital",
    type: "hospital",
    state: "Assam",
    city: "Changsari",
    address: "Silbharal, Changsari, Kamrup, Assam 781101",
    lat: 26.2415,
    lng: 91.6847,
    phone: "+91 361 2680000",
    emergencyPhone: "108 / 112",
    capacity: "750 Beds • 24/7 Advanced Critical Care",
    status: "Open 24/7",
    facilities: ["Level-1 Trauma Unit", "Critical Care Resuscitation", "High-Tech Diagnostics"]
  },
  {
    id: "ner-hosp-3",
    name: "STNM Multispecialty Hospital & Apex Disaster Trauma Wing",
    category: "Apex Government Hospital",
    type: "hospital",
    state: "Sikkim",
    city: "Gangtok",
    address: "Sochagang, Sichey, Gangtok, East Sikkim 737101",
    lat: 27.3389,
    lng: 88.6065,
    phone: "+91 3592 202944",
    emergencyPhone: "108 / 112",
    capacity: "1000 Beds • Mountain Trauma Resuscitation Hub",
    status: "Open 24/7",
    facilities: ["Teesta Landslide Casualty Triage", "Blood Bank", "Dedicated Disaster ICU"]
  },
  {
    id: "ner-hosp-4",
    name: "NEIGRIHMS Super Specialty Emergency & Trauma Center",
    category: "Autonomous Apex Medical Institute",
    type: "hospital",
    state: "Meghalaya",
    city: "Shillong",
    address: "Mawdiangdiang, Shillong, Meghalaya 793018",
    lat: 25.5962,
    lng: 91.9392,
    phone: "+91 364 2538025",
    emergencyPhone: "108 / +91 364 2538011",
    capacity: "800 Beds • Regional Disaster Triage Center",
    status: "Open 24/7",
    facilities: ["Regional Trauma & Burn Unit", "Critical Care ICU", "Emergency Blood Storage"]
  },
  {
    id: "ner-hosp-5",
    name: "Mangan District Hospital",
    category: "High-Altitude District Emergency Hospital",
    type: "hospital",
    state: "Sikkim",
    city: "Mangan",
    address: "Mangan Bazaar, North Sikkim 737116",
    lat: 27.5097,
    lng: 88.5284,
    phone: "+91 3592 234224",
    emergencyPhone: "108",
    capacity: "120 Beds • Frontline Teesta Valley Disaster Medical Unit",
    status: "Open 24/7",
    facilities: ["Emergency Surgical Suite", "Oxygen Plant", "Frontline Landslide Triage"]
  },
  {
    id: "ner-hosp-6",
    name: "TRIHMS Naharlagun Disaster Trauma & Emergency Center",
    category: "State Medical Institute & Hospital",
    type: "hospital",
    state: "Arunachal Pradesh",
    city: "Naharlagun",
    address: "LGB Regional Hospital Campus, Papum Pare, Arunachal Pradesh 791110",
    lat: 27.1065,
    lng: 93.6923,
    phone: "+91 360 2244248",
    emergencyPhone: "108 / 112",
    capacity: "600 Beds • 24/7 Trauma Resuscitation",
    status: "Open 24/7",
    facilities: ["Landslide Road Casualty Unit", "Blood Bank", "Emergency ICU"]
  },
  {
    id: "ner-hosp-7",
    name: "Naga Hospital Authority Kohima (NHAK)",
    category: "Apex State Referral & Trauma Hospital",
    type: "hospital",
    state: "Nagaland",
    city: "Kohima",
    address: "Hospital Road, Kohima, Nagaland 797001",
    lat: 25.6669,
    lng: 94.1086,
    phone: "+91 370 2222916",
    emergencyPhone: "108 / 112",
    capacity: "500 Beds • High Altitude Trauma Care",
    status: "Open 24/7",
    facilities: ["Disaster Emergency Ward", "Trauma Care Suite", "Blood Bank"]
  },
  {
    id: "ner-hosp-8",
    name: "Regional Institute of Medical Sciences (RIMS)",
    category: "Premier Autonomous Medical College & Hospital",
    type: "hospital",
    state: "Manipur",
    city: "Imphal",
    address: "Lamphelpat, Imphal West, Manipur 795004",
    lat: 24.8197,
    lng: 93.9219,
    phone: "+91 385 2414629",
    emergencyPhone: "108 / 112",
    capacity: "1074 Beds • Apex Regional Referral & Trauma",
    status: "Open 24/7",
    facilities: ["Multispecialty Disaster ICU", "Burn Care", "Emergency Operation Theatres"]
  },
  {
    id: "ner-hosp-9",
    name: "Zoram Medical College & Hospital (ZMC)",
    category: "Apex State Medical College Hospital",
    type: "hospital",
    state: "Mizoram",
    city: "Falkawn",
    address: "Falkawn, Aizawl District, Mizoram 796005",
    lat: 23.6375,
    lng: 92.7094,
    phone: "+91 389 2330831",
    emergencyPhone: "108 / 112",
    capacity: "500 Beds • Landslide Triage & Trauma Center",
    status: "Open 24/7",
    facilities: ["Specialist Trauma Surgery", "Blood Component Center", "Emergency ICU"]
  },
  {
    id: "ner-hosp-10",
    name: "Agartala Government Medical College & GBP Hospital",
    category: "Apex State Referral & Emergency Hospital",
    type: "hospital",
    state: "Tripura",
    city: "Agartala",
    address: "Kunjaban, Agartala, West Tripura 799006",
    lat: 23.8569,
    lng: 91.2868,
    phone: "+91 381 2357155",
    emergencyPhone: "108 / 112",
    capacity: "1100 Beds • Level-1 State Trauma Center",
    status: "Open 24/7",
    facilities: ["24/7 Critical Care", "High Volume Triage", "Disaster Burn Unit"]
  },

  // ── DISASTER MANAGEMENT OFFICES & AUTHORITIES ──
  {
    id: "ner-office-1",
    name: "North Eastern Space Applications Centre (NESAC - ISRO)",
    category: "Space Early Warning & Satellite Landslide Atlas Division",
    type: "office",
    state: "Meghalaya",
    city: "Umiam",
    address: "Department of Space, Govt of India, Umiam, Meghalaya 793103",
    lat: 25.6749,
    lng: 91.9168,
    phone: "+91 364 2570140",
    emergencyPhone: "+91 364 2570141",
    capacity: "ISRO Satellite Earth Observation & Early Warning Command",
    status: "Operational 24/7 (Emergency Cell)",
    facilities: ["Real-time ISRO Satellite Feeds", "Rainfall Threshold Modeling", "Multi-hazard Mapping"]
  },
  {
    id: "ner-office-2",
    name: "Assam State Disaster Management Authority (ASDMA)",
    category: "State Disaster Management Authority & EOC",
    type: "office",
    state: "Assam",
    city: "Guwahati",
    address: "State Emergency Operation Centre, Dispur, Guwahati 781006",
    lat: 26.1438,
    lng: 91.7898,
    phone: "+91 361 2237221",
    emergencyPhone: "1070 / 1079",
    capacity: "Apex State Disaster Command Hub",
    status: "Operational 24/7",
    facilities: ["State EOC", "Flood & Landslide Control Room", "Wireless Satellite Uplink"]
  },
  {
    id: "ner-office-3",
    name: "Sikkim State Disaster Management Authority (SSDMA)",
    category: "State Disaster Authority & Mountain Hazard EOC",
    type: "office",
    state: "Sikkim",
    city: "Gangtok",
    address: "Tashiling Secretariat, Gangtok, Sikkim 737101",
    lat: 27.3325,
    lng: 88.6142,
    phone: "+91 3592 202206",
    emergencyPhone: "1070 / +91 3592 202206",
    capacity: "Sikkim Multi-hazard Landslide & GLOF Cell",
    status: "Operational 24/7",
    facilities: ["Teesta Basin Sensor Monitoring", "GLOF Early Warning Center", "Inter-agency Radio"]
  },
  {
    id: "ner-office-4",
    name: "Meghalaya State Disaster Management Authority (MSDMA)",
    category: "State Emergency Operation Centre",
    type: "office",
    state: "Meghalaya",
    city: "Shillong",
    address: "Revenue & Disaster Management, Civil Secretariat, Shillong 793001",
    lat: 25.5788,
    lng: 91.8833,
    phone: "+91 364 2502098",
    emergencyPhone: "1070 / 112",
    capacity: "Khasi, Jaintia & Garo Hills Disaster Monitoring",
    status: "Operational 24/7",
    facilities: ["State EOC", "Rainfall & Landslide Command", "District Liaison"]
  },
  {
    id: "ner-office-5",
    name: "Arunachal Pradesh State Disaster Management Authority (APSDMA)",
    category: "State Emergency Operations Centre",
    type: "office",
    state: "Arunachal Pradesh",
    city: "Itanagar",
    address: "Civil Secretariat, Block 2, Itanagar, Arunachal Pradesh 791111",
    lat: 27.0844,
    lng: 93.6053,
    phone: "+91 360 2212240",
    emergencyPhone: "1070 / 112",
    capacity: "Frontier State Mountain Hazard Operations",
    status: "Operational 24/7",
    facilities: ["High-Altitude Rescue Coordination", "Riverine Flood Watch", "Satellite Comms"]
  },
  {
    id: "ner-office-6",
    name: "Nagaland State Disaster Management Authority (NSDMA)",
    category: "State Emergency Operation Centre",
    type: "office",
    state: "Nagaland",
    city: "Kohima",
    address: "Civil Secretariat Complex, Kohima, Nagaland 797004",
    lat: 25.6989,
    lng: 94.1118,
    phone: "+91 370 2270050",
    emergencyPhone: "1070 / +91 370 2291122",
    capacity: "State EOC • Landslide Warning Cell",
    status: "Operational 24/7",
    facilities: ["Weather Radar Link", "District Response Hub", "Community First Responder Desk"]
  },
  {
    id: "ner-office-7",
    name: "Disaster Management & Rehabilitation Department (Mizoram)",
    category: "State Disaster Management Department & SEOC",
    type: "office",
    state: "Mizoram",
    city: "Aizawl",
    address: "Chaltlang, Aizawl, Mizoram 796012",
    lat: 23.7431,
    lng: 92.7302,
    phone: "+91 389 2334898",
    emergencyPhone: "1070 / 112",
    capacity: "Aizawl Subsidence & Slope Safety Directorate",
    status: "Operational 24/7",
    facilities: ["Slope Stabilization Directorate", "State Disaster Control Room", "Geo-hazard Cell"]
  },
  {
    id: "ner-office-8",
    name: "Mangan District Disaster Management Authority (DDMA)",
    category: "District Incident Command Post (North Sikkim Landslides)",
    type: "office",
    state: "Sikkim",
    city: "Mangan",
    address: "DC Office Complex, Pentok, Mangan, North Sikkim 737116",
    lat: 27.5052,
    lng: 88.5341,
    phone: "+91 3592 234241",
    emergencyPhone: "+91 3592 234241 / 1077",
    capacity: "North Sikkim Frontline Landslide Command Post",
    status: "Operational 24/7",
    facilities: ["Chungthang-Lachen-Lachung Relief Command", "Heavy Earthmover Dispatch", "Army-Civilian Liaison"]
  },

  // ── RESCUE CENTERS, NDRF & SDRF BATTALIONS ──
  {
    id: "ner-rescue-1",
    name: "1st Battalion NDRF State Headquarters",
    category: "National Disaster Response Force (NDRF)",
    type: "rescue",
    state: "Assam",
    city: "Guwahati",
    address: "Patgaon, Rani, Kamrup Rural, Guwahati, Assam 781017",
    lat: 26.0682,
    lng: 91.6119,
    phone: "+91 361 2849005",
    emergencyPhone: "0361-2849005 / +91 9435552693",
    capacity: "18 Deep Disaster Response Teams • Canine Search Units",
    status: "Operational 24/7",
    facilities: ["Collapsed Structure Search & Rescue (CSSR)", "Deep Water Rescue Boats", "Heliborne Quick Reaction"]
  },
  {
    id: "ner-rescue-2",
    name: "12th Battalion NDRF Base",
    category: "National Disaster Response Force (NDRF)",
    type: "rescue",
    state: "Arunachal Pradesh",
    city: "Doimukh",
    address: "Emchi, Doimukh, Papum Pare, Arunachal Pradesh 791112",
    lat: 27.1422,
    lng: 93.7511,
    phone: "+91 360 2277107",
    emergencyPhone: "112 / +91 360 2277107",
    capacity: "Mountain & Heavy Landslide Specialized Battalions",
    status: "Operational 24/7",
    facilities: ["High-Altitude Technical Rescue", "Pneumatic Jack Extrication", "Satellite Comms Rig"]
  },
  {
    id: "ner-rescue-3",
    name: "NDRF Regional Response Center (RRC Burtuk)",
    category: "NDRF Specialized Mountain Avalanche & Landslide Unit",
    type: "rescue",
    state: "Sikkim",
    city: "Gangtok",
    address: "Burtuk, Gangtok, East Sikkim 737101",
    lat: 27.3524,
    lng: 88.6212,
    phone: "+91 3592 205112",
    emergencyPhone: "108 / 112",
    capacity: "Fast-Deployment Mountain & Riverine Rescue Teams",
    status: "Operational 24/7",
    facilities: ["Teesta Basin Quick Reaction Teams", "Hydraulic Rock Cutters", "Rope Rescue Systems"]
  },
  {
    id: "ner-rescue-4",
    name: "Border Roads Organisation (BRO) Project Swastik Heavy Clearance Post",
    category: "BRO Landslide Heavy Equipment Task Force",
    type: "rescue",
    state: "Sikkim",
    city: "Singtam",
    address: "NH-10 Clearing Depot, Singtam / Rangpo Axis, Sikkim 737134",
    lat: 27.2341,
    lng: 88.4988,
    phone: "+91 3592 231140",
    emergencyPhone: "Control Room: 03592-231140",
    capacity: "Heavy Earthmovers • Hydraulic Breakers • Rapid Bailey Bridge Units",
    status: "Operational 24/7",
    facilities: ["JCBs & Track Excavators", "Rock Blasting Explosive Engineers", "Emergency Bailey Bridge Launchers"]
  },
  {
    id: "ner-rescue-5",
    name: "Sikkim SDRF Quick Reaction Base",
    category: "State Disaster Response Force (SDRF)",
    type: "rescue",
    state: "Sikkim",
    city: "Gangtok",
    address: "Police Reserve Lines, Burtuk, Gangtok 737101",
    lat: 27.3481,
    lng: 88.6189,
    phone: "+91 3592 202206",
    emergencyPhone: "112",
    capacity: "Specialized Mountain Rescue Teams",
    status: "Operational 24/7",
    facilities: ["Slope Stabilization Crews", "Search & Extrication Dogs", "Emergency Radio"]
  },
  {
    id: "ner-rescue-6",
    name: "Assam SDRF State Headquarters",
    category: "State Disaster Response Force (SDRF)",
    type: "rescue",
    state: "Assam",
    city: "Guwahati",
    address: "Fire Service & SDRF Complex, Sila, Changsari, Assam 781101",
    lat: 26.2289,
    lng: 91.6742,
    phone: "+91 361 2840003",
    emergencyPhone: "101 / 112",
    capacity: "Brahmaputra Flood & Hilly Slope Rescue Units",
    status: "Operational 24/7",
    facilities: ["High-power Inflatable Boats", "Deep Diving Equipment", "Heavy Cutting Tools"]
  },

  // ── RELIEF & EVACUATION SHELTERS ──
  {
    id: "ner-shelter-1",
    name: "Sarusajai Indoor Stadium Mega Evacuation & Relief Hub",
    category: "Mega Evacuation & Relief Staging Center",
    type: "shelter",
    state: "Assam",
    city: "Guwahati",
    address: "National Highway 37, Sarusajai, Guwahati, Assam 781034",
    lat: 26.1158,
    lng: 91.7371,
    phone: "1070 / 1079",
    emergencyPhone: "1070",
    capacity: "2500 Displaced Persons • Food & Relief Logistics Hub",
    status: "Active Evacuation Center",
    facilities: ["High-Capacity Shelter", "24/7 Medical Unit", "Community Kitchen", "NDRF Liaison", "Backup Generators"]
  },
  {
    id: "ner-shelter-2",
    name: "Melli Teesta River Landslide Transit & Relief Shelter",
    category: "Valley Landslide Transit Evacuation Refuge",
    type: "shelter",
    state: "Sikkim",
    city: "South Sikkim",
    address: "NH-10 Junction, Melli Bazaar, South Sikkim 737128",
    lat: 27.0906,
    lng: 88.4552,
    phone: "+91 3592 202206",
    emergencyPhone: "1070",
    capacity: "650 Persons • High Ground River Safe Zone",
    status: "Active Relief Station",
    facilities: ["Landslide Safe High-Ground", "First Aid Station", "Clean Water Filtration", "Emergency Rations"]
  },
  {
    id: "ner-shelter-3",
    name: "Ramhlun North Landslide & Subsidence Community Refuge",
    category: "Community Landslide & Sinking Slope Refuge",
    type: "shelter",
    state: "Mizoram",
    city: "Aizawl",
    address: "Ramhlun Vengthlang, Aizawl, Mizoram 796012",
    lat: 23.7538,
    lng: 92.7231,
    phone: "+91 389 2334898",
    emergencyPhone: "1070",
    capacity: "500 Persons • Reinforced Foundation Shelter",
    status: "Open & Stocked",
    facilities: ["Reinforced Slope Foundation", "Safe Potable Water", "Blankets & Bedding", "Solar Backup Lights"]
  },
  {
    id: "ner-shelter-4",
    name: "Majuli Island High-Plinth Flood & Erosion Haven",
    category: "Elevated Disaster Safe Haven",
    type: "shelter",
    state: "Assam",
    city: "Majuli",
    address: "Kamalabari Ghat Road, Garamur, Majuli, Assam 785104",
    lat: 26.9602,
    lng: 94.2185,
    phone: "+91 3775 274433",
    emergencyPhone: "1077",
    capacity: "1200 Persons • Raised Plinth Refuge",
    status: "Stocked with Emergency Supplies",
    facilities: ["Raised Elevated Plinth", "Rescue Inflatable Boats", "Water Purification Plants", "Solar Microgrid"]
  },
  {
    id: "ner-shelter-5",
    name: "Kohima Solidarity Park Disaster Evacuation Center",
    category: "Evacuation & Emergency Relief Camp",
    type: "shelter",
    state: "Nagaland",
    city: "Kohima",
    address: "Below New Secretariat, Kohima, Nagaland 797004",
    lat: 25.6882,
    lng: 94.1037,
    phone: "+91 370 2270050",
    emergencyPhone: "1070",
    capacity: "750 Evacuees • Medical & Water Storage",
    status: "Operational",
    facilities: ["Open Staging Area", "Mobile Medical Units", "Sanitation Blocks", "Emergency Communications"]
  },
  {
    id: "ner-shelter-6",
    name: "Sohra High-Plateau Storm & Cloudburst Safe Haven",
    category: "High Altitude Extreme Weather Refuge",
    type: "shelter",
    state: "Meghalaya",
    city: "Cherrapunji",
    address: "Near Circuit House, Sohra, East Khasi Hills, Meghalaya 793108",
    lat: 25.2744,
    lng: 91.7323,
    phone: "+91 364 2502098",
    emergencyPhone: "108 / 112",
    capacity: "450 Evacuees • Rain-Shielded Concrete Compound",
    status: "Operational",
    facilities: ["Reinforced Concrete Roof", "Thermal Blankets", "Clean Rainwater Harvesting", "Emergency Radio"]
  }
];

export default function NERLandslideMonitor() {
  const [data, setData] = useState(INITIAL_DATA);
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [activeTab, setActiveTab] = useState("overview"); // "overview" | "corridors" | "calculator" | "priorities" | "field" | "infrastructure"
  const [corridorFilter, setCorridorFilter] = useState("All");
  const [infrCategory, setInfrCategory] = useState("all"); // "all" | "hospital" | "office" | "rescue" | "shelter"
  const [infrState, setInfrState] = useState("all");
  const [infrSearch, setInfrSearch] = useState("");

  // Calculator State
  const [calcRain, setCalcRain] = useState(135);
  const [calcThreshold, setCalcThreshold] = useState(110);
  const [calcSoil, setCalcSoil] = useState(85);
  const [calcSlope, setCalcSlope] = useState(45);
  const [calcResult, setCalcResult] = useState(null);

  // Fetch real-time data from backend
  useEffect(() => {
    fetch(`${API_BASE}/api/ner/overview`)
      .then((res) => {
        if (!res.ok) throw new Error("Network error");
        return res.json();
      })
      .then((resData) => {
        if (resData && resData.states) {
          setData(resData);
        }
      })
      .catch(() => {
        // Keeps graceful fallback initial data
      });
  }, []);

  // Compute LSI locally or via API
  const handleCalculateLsi = (e) => {
    e.preventDefault();
    const rainFactor = Math.min(calcRain / (calcThreshold || 100), 1.8) * 0.35;
    const soilFactor = (calcSoil / 100) * 0.25;
    const slopeFactor = Math.min(calcSlope / 60, 1.2) * 0.25;
    const histFactor = 0.15 * 0.7; // average historical weight

    const rawScore = rainFactor + soilFactor + slopeFactor + histFactor;
    const normalizedLSI = Math.min(Math.max(rawScore, 0.05), 0.99);

    let riskLevel = "Low";
    let color = "#10b981";
    if (normalizedLSI >= 0.8) {
      riskLevel = "Critical - Immediate Evacuation";
      color = "#ef4444";
    } else if (normalizedLSI >= 0.65) {
      riskLevel = "High - Active Geotechnical Risk";
      color = "#f97316";
    } else if (normalizedLSI >= 0.45) {
      riskLevel = "Moderate - Watch Advisory";
      color = "#eab308";
    }

    setCalcResult({
      lsi: normalizedLSI.toFixed(2),
      riskLevel,
      color,
      safetyFactor: (1 / (normalizedLSI + 0.1)).toFixed(2)
    });
  };

  const filteredCorridors = data.corridors.filter((c) => {
    if (corridorFilter === "All") return true;
    return c.status.toLowerCase().includes(corridorFilter.toLowerCase());
  });

  return (
    <div style={{ padding: "20px 24px", minHeight: "100vh", backgroundColor: "#020617", color: "#f8fafc" }}>
      
      {/* ── HEADER BANNER ── */}
      <div style={{
        background: "linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.85))",
        border: "1px solid rgba(56, 189, 248, 0.3)",
        borderRadius: "16px",
        padding: "24px 28px",
        marginBottom: "24px",
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)",
        position: "relative",
        overflow: "hidden"
      }}>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "16px" }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(239, 68, 68, 0.2)", border: "1px solid rgba(239, 68, 68, 0.4)", padding: "4px 12px", borderRadius: "999px", fontSize: "0.8rem", color: "#fca5a5", marginBottom: "10px", fontWeight: "600" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#ef4444", display: "inline-block", animation: "pulse 1.5s infinite" }}></span>
              LIVE NER MONITORING SYSTEM · 8 STATES
            </div>
            <h1 style={{ fontSize: "1.85rem", fontWeight: "800", margin: "0 0 6px 0", color: "#f1f5f9", letterSpacing: "-0.5px" }}>
              ⛰️ AI Early Warning & Landslide Risk Monitoring Platform (NER)
            </h1>
            <p style={{ margin: 0, color: "#94a3b8", fontSize: "0.95rem", maxWidth: "850px" }}>
              Autonomous multi-sensor geotechnical intelligence, IMD rainfall threshold analytics, road connectivity tracking, and geotagged field reporting across Arunachal, Assam, Manipur, Meghalaya, Mizoram, Nagaland, Sikkim & Tripura.
            </p>
          </div>

          {/* Quick Actions */}
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <Link
              to="/incident-report"
              style={{
                backgroundColor: "#ef4444",
                color: "#ffffff",
                padding: "10px 18px",
                borderRadius: "10px",
                fontWeight: "600",
                fontSize: "0.9rem",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                boxShadow: "0 4px 14px rgba(239, 68, 68, 0.4)"
              }}
            >
              📸 Report Slope Crack
            </Link>
            <Link
              to="/map"
              style={{
                backgroundColor: "rgba(56, 189, 248, 0.15)",
                color: "#38bdf8",
                border: "1px solid rgba(56, 189, 248, 0.4)",
                padding: "10px 18px",
                borderRadius: "10px",
                fontWeight: "600",
                fontSize: "0.9rem",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px"
              }}
            >
              🗺️ GIS Risk Map
            </Link>
            <Link
              to="/ar-see-the-risk"
              style={{
                background: "linear-gradient(135deg, #0369a1, #22d3ee33)",
                color: "#22d3ee",
                border: "1.5px solid #22d3ee",
                padding: "10px 18px",
                borderRadius: "10px",
                fontWeight: "700",
                fontSize: "0.9rem",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                boxShadow: "0 4px 14px rgba(34,211,238,0.3)",
                animation: "arGlow 2s ease-in-out infinite alternate",
              }}
            >
              📡 AR See the Risk
            </Link>
          </div>
        </div>

        {/* Metric Counter Bar */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap: "14px",
          marginTop: "22px",
          paddingTop: "18px",
          borderTop: "1px solid rgba(255, 255, 255, 0.1)"
        }}>
          <div style={{ background: "rgba(15, 23, 42, 0.6)", padding: "12px 14px", borderRadius: "10px", border: "1px solid rgba(255, 255, 255, 0.06)" }}>
            <span style={{ fontSize: "0.75rem", color: "#94a3b8", display: "block" }}>Monitored States</span>
            <span style={{ fontSize: "1.4rem", fontWeight: "700", color: "#38bdf8" }}>8 / 8 NER</span>
          </div>
          <div style={{ background: "rgba(15, 23, 42, 0.6)", padding: "12px 14px", borderRadius: "10px", border: "1px solid rgba(255, 255, 255, 0.06)" }}>
            <span style={{ fontSize: "0.75rem", color: "#94a3b8", display: "block" }}>IoT Slope Sensors</span>
            <span style={{ fontSize: "1.4rem", fontWeight: "700", color: "#10b981" }}>{data.metrics.totalActiveSensors} Online</span>
          </div>
          <div style={{ background: "rgba(15, 23, 42, 0.6)", padding: "12px 14px", borderRadius: "10px", border: "1px solid rgba(255, 255, 255, 0.06)" }}>
            <span style={{ fontSize: "0.75rem", color: "#94a3b8", display: "block" }}>High / Critical States</span>
            <span style={{ fontSize: "1.4rem", fontWeight: "700", color: "#f87171" }}>{data.metrics.highRiskStates} States</span>
          </div>
          <div style={{ background: "rgba(15, 23, 42, 0.6)", padding: "12px 14px", borderRadius: "10px", border: "1px solid rgba(255, 255, 255, 0.06)" }}>
            <span style={{ fontSize: "0.75rem", color: "#94a3b8", display: "block" }}>Isolated Habitations</span>
            <span style={{ fontSize: "1.4rem", fontWeight: "700", color: "#fbbf24" }}>{data.metrics.isolatedVillages} Villages</span>
          </div>
          <div style={{ background: "rgba(15, 23, 42, 0.6)", padding: "12px 14px", borderRadius: "10px", border: "1px solid rgba(255, 255, 255, 0.06)" }}>
            <span style={{ fontSize: "0.75rem", color: "#94a3b8", display: "block" }}>Blocked High-Risk Roads</span>
            <span style={{ fontSize: "1.4rem", fontWeight: "700", color: "#f43f5e" }}>{data.metrics.blockedCorridors} Highways</span>
          </div>
        </div>
      </div>

      {/* ── NAVIGATION TABS & LANGUAGE BAR ── */}
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {[
            { id: "overview", label: "📊 NER State Risk Heatmap", icon: "🗺️" },
            { id: "corridors", label: "🛣️ Road Connectivity & Blockages", icon: "🚧" },
            { id: "priorities", label: "🚨 Emergency Response Priority", icon: "🎯" },
            { id: "calculator", label: "🧮 AI Landslide Susceptibility Calculator", icon: "⚡" },
            { id: "field", label: "📝 Recent Field Crack Reports", icon: "🔍" },
            { id: "infrastructure", label: "🏛️ Emergency Infrastructure & Hospitals", icon: "🏥" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: "9px 16px",
                borderRadius: "10px",
                border: "none",
                background: activeTab === tab.id ? "#2563eb" : "rgba(30, 41, 59, 0.7)",
                color: activeTab === tab.id ? "#ffffff" : "#94a3b8",
                fontWeight: activeTab === tab.id ? "700" : "500",
                fontSize: "0.88rem",
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Multilingual Selector for Alerts */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "rgba(30, 41, 59, 0.8)", padding: "4px 8px", borderRadius: "8px", border: "1px solid rgba(255, 255, 255, 0.1)" }}>
          <span style={{ fontSize: "0.75rem", color: "#94a3b8", marginRight: "4px" }}>Language:</span>
          {[
            { code: "en", label: "EN" },
            { code: "hi", label: "हिंदी" },
            { code: "as", label: "অসমীয়া" },
            { code: "bn", label: "বাংলা" },
            { code: "ne", label: "नेपाली" },
          ].map((lang) => (
            <button
              key={lang.code}
              onClick={() => setSelectedLanguage(lang.code)}
              style={{
                padding: "3px 8px",
                borderRadius: "6px",
                border: "none",
                background: selectedLanguage === lang.code ? "#38bdf8" : "transparent",
                color: selectedLanguage === lang.code ? "#0f172a" : "#cbd5e1",
                fontSize: "0.78rem",
                fontWeight: "600",
                cursor: "pointer"
              }}
            >
              {lang.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── TAB 1: OVERVIEW & STATE RISK MATRIX ── */}
      {activeTab === "overview" && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "16px" }}>
            {data.states.map((st) => {
              const alertMsg = st.multilingualAlert?.[selectedLanguage] || st.multilingualAlert?.en || "Standard monitoring active.";
              const isCrit = st.riskLevel === "Critical";
              const isHigh = st.riskLevel === "High";

              return (
                <div
                  key={st.state}
                  style={{
                    backgroundColor: "rgba(15, 23, 42, 0.85)",
                    borderRadius: "14px",
                    border: `1.5px solid ${isCrit ? "rgba(239, 68, 68, 0.5)" : isHigh ? "rgba(249, 115, 22, 0.4)" : "rgba(255, 255, 255, 0.08)"}`,
                    padding: "18px 20px",
                    boxShadow: isCrit ? "0 6px 20px rgba(239, 68, 68, 0.15)" : "none",
                    position: "relative"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                    <div>
                      <h3 style={{ margin: "0 0 2px 0", fontSize: "1.2rem", fontWeight: "700", color: "#f8fafc" }}>
                        {st.state}
                      </h3>
                      <span style={{ fontSize: "0.78rem", color: "#94a3b8" }}>
                        Vulnerable Hub: <strong style={{ color: "#e2e8f0" }}>{st.highestRiskDistrict}</strong>
                      </span>
                    </div>

                    <span style={{
                      padding: "4px 10px",
                      borderRadius: "999px",
                      fontSize: "0.75rem",
                      fontWeight: "700",
                      backgroundColor: isCrit ? "rgba(239, 68, 68, 0.2)" : isHigh ? "rgba(249, 115, 22, 0.2)" : "rgba(16, 185, 129, 0.2)",
                      color: isCrit ? "#fca5a5" : isHigh ? "#fdba74" : "#6ee7b7",
                      border: `1px solid ${isCrit ? "rgba(239, 68, 68, 0.4)" : isHigh ? "rgba(249, 115, 22, 0.4)" : "rgba(16, 185, 129, 0.4)"}`
                    }}>
                      {st.riskLevel.toUpperCase()} RISK
                    </span>
                  </div>

                  {/* Geotechnical & Weather Metrics Grid */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "14px" }}>
                    <div style={{ background: "rgba(30, 41, 59, 0.5)", padding: "8px 10px", borderRadius: "8px" }}>
                      <span style={{ fontSize: "0.72rem", color: "#94a3b8", display: "block" }}>24h Rainfall / Threshold</span>
                      <strong style={{ fontSize: "0.95rem", color: st.currentRainfall24hMm > st.rainfallThresholdMm ? "#f87171" : "#38bdf8" }}>
                        {st.currentRainfall24hMm} mm
                      </strong>
                      <span style={{ fontSize: "0.72rem", color: "#64748b" }}> / {st.rainfallThresholdMm} mm</span>
                    </div>

                    <div style={{ background: "rgba(30, 41, 59, 0.5)", padding: "8px 10px", borderRadius: "8px" }}>
                      <span style={{ fontSize: "0.72rem", color: "#94a3b8", display: "block" }}>Soil Saturation</span>
                      <strong style={{ fontSize: "0.95rem", color: st.soilSaturationPercent > 85 ? "#f87171" : "#34d399" }}>
                        {st.soilSaturationPercent}% Saturation
                      </strong>
                    </div>

                    <div style={{ background: "rgba(30, 41, 59, 0.5)", padding: "8px 10px", borderRadius: "8px" }}>
                      <span style={{ fontSize: "0.72rem", color: "#94a3b8", display: "block" }}>Mean Slope Angle</span>
                      <strong style={{ fontSize: "0.95rem", color: "#fbbf24" }}>{st.averageSlopeDeg}° Incline</strong>
                    </div>

                    <div style={{ background: "rgba(30, 41, 59, 0.5)", padding: "8px 10px", borderRadius: "8px" }}>
                      <span style={{ fontSize: "0.72rem", color: "#94a3b8", display: "block" }}>LSI Risk Index</span>
                      <strong style={{ fontSize: "0.95rem", color: isCrit ? "#f87171" : "#38bdf8" }}>
                        {st.landslideSusceptibilityIndex} / 1.0
                      </strong>
                    </div>
                  </div>

                  {/* IMD Weather Alert Tag */}
                  <div style={{ marginBottom: "10px", fontSize: "0.78rem", color: "#cbd5e1" }}>
                    <span style={{ color: "#38bdf8", fontWeight: "600" }}>IMD Advisory:</span> {st.imdBand}
                  </div>

                  {/* Multilingual Early Warning Box */}
                  <div style={{
                    background: isCrit ? "rgba(239, 68, 68, 0.12)" : "rgba(30, 41, 59, 0.6)",
                    border: `1px solid ${isCrit ? "rgba(239, 68, 68, 0.3)" : "rgba(255, 255, 255, 0.08)"}`,
                    borderRadius: "8px",
                    padding: "10px 12px",
                    fontSize: "0.82rem",
                    color: isCrit ? "#fecaca" : "#cbd5e1",
                    lineHeight: "1.4"
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px", fontSize: "0.72rem", color: "#94a3b8", textTransform: "uppercase" }}>
                      <span>📢 Broadcast Notice ({selectedLanguage.toUpperCase()}):</span>
                    </div>
                    {alertMsg}
                  </div>

                  <div style={{ marginTop: "12px", display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "#94a3b8" }}>
                    <span>Isolated Villages: <strong style={{ color: "#f87171" }}>{st.isolatedVillagesCount}</strong></span>
                    <span>Sensors: <strong style={{ color: "#38bdf8" }}>{st.activeSensors} Active</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── TAB 2: ROAD CONNECTIVITY & CORRIDORS ── */}
      {activeTab === "corridors" && (
        <div>
          {/* Filter Bar */}
          <div style={{ display: "flex", gap: "8px", marginBottom: "16px", alignItems: "center" }}>
            <span style={{ fontSize: "0.82rem", color: "#94a3b8", marginRight: "6px" }}>Filter Status:</span>
            {["All", "Blocked", "Caution", "Open"].map((f) => (
              <button
                key={f}
                onClick={() => setCorridorFilter(f)}
                style={{
                  padding: "5px 12px",
                  borderRadius: "6px",
                  border: "none",
                  backgroundColor: corridorFilter === f ? "#38bdf8" : "rgba(30, 41, 59, 0.8)",
                  color: corridorFilter === f ? "#0f172a" : "#cbd5e1",
                  fontSize: "0.8rem",
                  fontWeight: "600",
                  cursor: "pointer"
                }}
              >
                {f}
              </button>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "16px" }}>
            {filteredCorridors.map((c) => {
              const isBlocked = c.status === "Blocked";
              const isCaution = c.status === "Caution";

              return (
                <div
                  key={c.id}
                  style={{
                    backgroundColor: "rgba(15, 23, 42, 0.85)",
                    border: `1.5px solid ${isBlocked ? "rgba(239, 68, 68, 0.6)" : isCaution ? "rgba(249, 115, 22, 0.5)" : "rgba(16, 185, 129, 0.4)"}`,
                    borderRadius: "14px",
                    padding: "18px 20px"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                    <div>
                      <h3 style={{ margin: "0 0 4px 0", fontSize: "1.15rem", fontWeight: "700", color: "#f8fafc" }}>
                        {c.route}
                      </h3>
                      <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                        States: {c.states.join(", ")}
                      </span>
                    </div>

                    <span style={{
                      padding: "4px 10px",
                      borderRadius: "6px",
                      fontSize: "0.75rem",
                      fontWeight: "700",
                      backgroundColor: isBlocked ? "rgba(239, 68, 68, 0.25)" : isCaution ? "rgba(249, 115, 22, 0.25)" : "rgba(16, 185, 129, 0.25)",
                      color: isBlocked ? "#f87171" : isCaution ? "#fb923c" : "#34d399",
                    }}>
                      {c.status.toUpperCase()}
                    </span>
                  </div>

                  <div style={{ fontSize: "0.85rem", color: "#cbd5e1", marginBottom: "10px" }}>
                    <strong>Blockage Point:</strong> {c.blockageLocation}
                  </div>

                  {c.debrisVolumeCuM > 0 && (
                    <div style={{ background: "rgba(30, 41, 59, 0.6)", padding: "10px 12px", borderRadius: "8px", marginBottom: "12px", fontSize: "0.8rem" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                        <span style={{ color: "#94a3b8" }}>Debris Volume:</span>
                        <strong style={{ color: "#fca5a5" }}>{c.debrisVolumeCuM} m³</strong>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "#94a3b8" }}>Estimated Clearance:</span>
                        <strong style={{ color: "#38bdf8" }}>{c.estimatedClearanceHours} Hours</strong>
                      </div>
                    </div>
                  )}

                  <div style={{ fontSize: "0.8rem", color: "#94a3b8", marginBottom: "12px" }}>
                    <strong style={{ color: "#38bdf8" }}>Alternate Bypass:</strong> {c.alternateRoute}
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "10px", borderTop: "1px solid rgba(255, 255, 255, 0.08)", fontSize: "0.78rem" }}>
                    <span style={{ color: "#f87171" }}>
                      ⚠️ <strong>{c.isolatedVillages} Isolated Villages</strong> dependent
                    </span>
                    <span style={{ color: "#94a3b8" }}>
                      Risk Score: <strong>{c.riskScore} / 100</strong>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── TAB 3: EMERGENCY RESPONSE PRIORITIZATION ── */}
      {activeTab === "priorities" && (
        <div style={{ backgroundColor: "rgba(15, 23, 42, 0.85)", borderRadius: "16px", border: "1px solid rgba(255, 255, 255, 0.08)", padding: "20px 24px" }}>
          <h2 style={{ fontSize: "1.3rem", fontWeight: "700", margin: "0 0 8px 0" }}>
            🎯 Real-Time Emergency Response Prioritization Matrix
          </h2>
          <p style={{ color: "#94a3b8", fontSize: "0.88rem", margin: "0 0 20px 0" }}>
            Autonomous ranking based on Landslide Susceptibility Index (LSI), isolated habitation count, highway blockages, and IMD rainfall intensity.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {data.prioritization.map((p, idx) => (
              <div
                key={p.state}
                style={{
                  backgroundColor: "rgba(30, 41, 59, 0.6)",
                  borderRadius: "12px",
                  padding: "16px 20px",
                  borderLeft: `4px solid ${p.riskLevel === "Critical" ? "#ef4444" : "#f97316"}`,
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "14px"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                  <div style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    background: p.riskLevel === "Critical" ? "#ef4444" : "#f97316",
                    color: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "800",
                    fontSize: "0.95rem"
                  }}>
                    #{idx + 1}
                  </div>
                  <div>
                    <h4 style={{ margin: "0 0 3px 0", fontSize: "1.1rem", fontWeight: "700", color: "#f8fafc" }}>
                      {p.state}
                    </h4>
                    <span style={{ fontSize: "0.78rem", color: "#94a3b8" }}>
                      Isolated Villages: <strong style={{ color: "#f87171" }}>{p.isolatedVillages}</strong> · Critical Routes: <strong style={{ color: "#38bdf8" }}>{p.criticalHighways.join(", ") || "None"}</strong>
                    </span>
                  </div>
                </div>

                <div style={{ flex: "1 1 300px", maxWidth: "450px" }}>
                  <div style={{ fontSize: "0.8rem", color: "#e2e8f0", background: "rgba(15, 23, 42, 0.5)", padding: "8px 12px", borderRadius: "8px", border: "1px solid rgba(255, 255, 255, 0.05)" }}>
                    <strong style={{ color: "#38bdf8" }}>Tactical Directive:</strong> {p.recommendedAction}
                  </div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "1.3rem", fontWeight: "800", color: p.riskLevel === "Critical" ? "#f87171" : "#fbbf24" }}>
                    {p.priorityIndex} <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>/ 100</span>
                  </div>
                  <span style={{ fontSize: "0.72rem", color: "#94a3b8", textTransform: "uppercase" }}>Priority Score</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 4: CALCULATOR ── */}
      {activeTab === "calculator" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px" }}>
          <div style={{ backgroundColor: "rgba(15, 23, 42, 0.85)", borderRadius: "16px", border: "1px solid rgba(255, 255, 255, 0.08)", padding: "20px 24px" }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: "700", margin: "0 0 6px 0" }}>
              ⚡ Landslide Susceptibility Index (LSI) Simulator
            </h2>
            <p style={{ color: "#94a3b8", fontSize: "0.85rem", margin: "0 0 18px 0" }}>
              Simulate slope stability in real-time based on cumulative precipitation, saturation and terrain slope angle.
            </p>

            <form onSubmit={handleCalculateLsi}>
              <div style={{ marginBottom: "14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                  <label style={{ fontSize: "0.82rem", color: "#cbd5e1" }}>Cumulative 24h Rainfall (mm)</label>
                  <strong style={{ color: "#38bdf8", fontSize: "0.85rem" }}>{calcRain} mm</strong>
                </div>
                <input
                  type="range"
                  min="10"
                  max="300"
                  value={calcRain}
                  onChange={(e) => setCalcRain(Number(e.target.value))}
                  style={{ width: "100%", accentColor: "#38bdf8" }}
                />
              </div>

              <div style={{ marginBottom: "14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                  <label style={{ fontSize: "0.82rem", color: "#cbd5e1" }}>Critical Geological Threshold (mm)</label>
                  <strong style={{ color: "#fbbf24", fontSize: "0.85rem" }}>{calcThreshold} mm</strong>
                </div>
                <input
                  type="range"
                  min="50"
                  max="200"
                  value={calcThreshold}
                  onChange={(e) => setCalcThreshold(Number(e.target.value))}
                  style={{ width: "100%", accentColor: "#fbbf24" }}
                />
              </div>

              <div style={{ marginBottom: "14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                  <label style={{ fontSize: "0.82rem", color: "#cbd5e1" }}>Soil Moisture Saturation (%)</label>
                  <strong style={{ color: "#34d399", fontSize: "0.85rem" }}>{calcSoil}%</strong>
                </div>
                <input
                  type="range"
                  min="20"
                  max="100"
                  value={calcSoil}
                  onChange={(e) => setCalcSoil(Number(e.target.value))}
                  style={{ width: "100%", accentColor: "#34d399" }}
                />
              </div>

              <div style={{ marginBottom: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                  <label style={{ fontSize: "0.82rem", color: "#cbd5e1" }}>Terrain Slope Incline (°)</label>
                  <strong style={{ color: "#f87171", fontSize: "0.85rem" }}>{calcSlope}°</strong>
                </div>
                <input
                  type="range"
                  min="15"
                  max="70"
                  value={calcSlope}
                  onChange={(e) => setCalcSlope(Number(e.target.value))}
                  style={{ width: "100%", accentColor: "#f87171" }}
                />
              </div>

              <button
                type="submit"
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "10px",
                  border: "none",
                  backgroundColor: "#2563eb",
                  color: "#ffffff",
                  fontWeight: "700",
                  fontSize: "0.95rem",
                  cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(37, 99, 235, 0.4)"
                }}
              >
                Compute Real-Time Stability Index
              </button>
            </form>
          </div>

          {/* Results Display */}
          <div style={{ backgroundColor: "rgba(15, 23, 42, 0.85)", borderRadius: "16px", border: "1px solid rgba(255, 255, 255, 0.08)", padding: "24px", display: "flex", flexDirection: "column", justifyContent: "center", textAlign: "center" }}>
            {calcResult ? (
              <div>
                <span style={{ fontSize: "0.8rem", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "1px" }}>Computed Landslide Index</span>
                <div style={{ fontSize: "3.5rem", fontWeight: "900", color: calcResult.color, margin: "10px 0" }}>
                  {calcResult.lsi}
                </div>
                <div style={{ display: "inline-block", padding: "6px 14px", borderRadius: "999px", background: "rgba(255, 255, 255, 0.08)", fontSize: "0.95rem", fontWeight: "700", color: calcResult.color, marginBottom: "16px" }}>
                  {calcResult.riskLevel}
                </div>
                <div style={{ background: "rgba(30, 41, 59, 0.6)", padding: "14px", borderRadius: "10px", textAlign: "left", fontSize: "0.85rem", color: "#cbd5e1" }}>
                  <div><strong>Factor of Safety (FoS):</strong> {calcResult.safetyFactor} {calcResult.safetyFactor < 1.0 ? "(Unstable Slope!)" : "(Stable)"}</div>
                  <div style={{ marginTop: "6px" }}><strong>Recommended Protocol:</strong> {calcResult.lsi >= 0.8 ? "Immediate evacuation of downslope habitations; sound siren and notify SDRF." : "Deploy drone patrol and monitor piezometric sensor logs."}</div>
                </div>
              </div>
            ) : (
              <div>
                <span style={{ fontSize: "3rem", display: "block", marginBottom: "10px" }}>⛰️</span>
                <h3 style={{ color: "#f8fafc", margin: "0 0 6px 0" }}>Ready for Computation</h3>
                <p style={{ color: "#94a3b8", fontSize: "0.85rem", margin: 0 }}>
                  Adjust parameters on the left and click 'Compute Real-Time Stability Index' to simulate slope failure probability.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB 5: RECENT FIELD CRACK REPORTS ── */}
      {activeTab === "field" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: "700" }}>
              🔍 Field Observations: Geo-Tagged Cracks & Slope Movement
            </h3>
            <Link
              to="/incident-report"
              style={{
                backgroundColor: "#2563eb",
                color: "#fff",
                padding: "8px 14px",
                borderRadius: "8px",
                fontSize: "0.85rem",
                fontWeight: "600",
                textDecoration: "none"
              }}
            >
              + Submit Observation
            </Link>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {data.recentObservations.map((obs) => (
              <div
                key={obs.id}
                style={{
                  backgroundColor: "rgba(15, 23, 42, 0.85)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: "12px",
                  padding: "16px 20px"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                  <div>
                    <h4 style={{ margin: "0 0 2px 0", fontSize: "1.05rem", color: "#f8fafc", fontWeight: "700" }}>
                      {obs.locationName}
                    </h4>
                    <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                      State: {obs.state} · Reported by: {obs.reportedBy} ({obs.timeAgo || "Recently"})
                    </span>
                  </div>
                  <span style={{
                    padding: "3px 8px",
                    borderRadius: "6px",
                    fontSize: "0.72rem",
                    fontWeight: "700",
                    background: obs.severity === "Critical" ? "rgba(239, 68, 68, 0.2)" : "rgba(249, 115, 22, 0.2)",
                    color: obs.severity === "Critical" ? "#f87171" : "#fb923c"
                  }}>
                    {obs.status}
                  </span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "10px", marginTop: "10px", fontSize: "0.8rem", color: "#cbd5e1" }}>
                  <div>Crack Length: <strong style={{ color: "#38bdf8" }}>{obs.crackLengthMeters} m</strong></div>
                  <div>Crack Width: <strong style={{ color: "#f87171" }}>{obs.crackWidthCm} cm</strong></div>
                  <div>Slope Angle: <strong style={{ color: "#fbbf24" }}>{obs.slopeAngleDeg}°</strong></div>
                  <div>Road Status: <strong style={{ color: "#fca5a5" }}>{obs.roadStatus}</strong></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 6: NER EMERGENCY INFRASTRUCTURE, HOSPITALS & SDMAs ── */}
      {activeTab === "infrastructure" && (
        <div>
          {/* Header Banner & Live Map Jump */}
          <div
            style={{
              backgroundColor: "rgba(15, 23, 42, 0.9)",
              border: "1px solid rgba(56, 189, 248, 0.3)",
              borderRadius: "16px",
              padding: "20px 24px",
              marginBottom: "20px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "16px",
              background: "linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 58, 138, 0.4) 100%)",
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                <span style={{ fontSize: "1.5rem" }}>🏛️</span>
                <h3 style={{ margin: 0, fontSize: "1.3rem", fontWeight: "800", color: "#f8fafc" }}>
                  North Eastern Region (NER) Disaster Response Directory
                </h3>
                <span style={{ backgroundColor: "#0284c7", color: "#ffffff", padding: "2px 8px", borderRadius: "6px", fontSize: "0.72rem", fontWeight: "700" }}>
                  8 States Covered
                </span>
              </div>
              <p style={{ margin: 0, color: "#94a3b8", fontSize: "0.85rem", maxWidth: "760px" }}>
                Verified emergency hospitals, state disaster management authorities (SDMA), ISRO NESAC command, NDRF & SDRF battalions, BRO clearance depots, and high-altitude relief shelters across Assam, Sikkim, Meghalaya, Arunachal, Nagaland, Manipur, Mizoram & Tripura.
              </p>
            </div>

            <Link
              to="/map?region=ner"
              style={{
                backgroundColor: "#2563eb",
                color: "#ffffff",
                padding: "10px 18px",
                borderRadius: "10px",
                fontWeight: "700",
                fontSize: "0.88rem",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                boxShadow: "0 4px 14px rgba(37, 99, 235, 0.4)",
                transition: "all 0.2s ease",
              }}
            >
              🗺️ Open Live Response Map (NER View)
            </Link>
          </div>

          {/* Filters Bar: Category, State & Search */}
          <div
            style={{
              backgroundColor: "rgba(15, 23, 42, 0.8)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "12px",
              padding: "14px 18px",
              marginBottom: "20px",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            {/* Top row: Category tabs */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
              <span style={{ fontSize: "0.76rem", color: "#94a3b8", fontWeight: "700" }}>FACILITY TYPE:</span>
              {[
                { id: "all", label: "All Infrastructure (28)" },
                { id: "hospital", label: "🏥 Hospitals & Trauma Centers (10)" },
                { id: "office", label: "🏛️ Disaster Offices & SDMA (8)" },
                { id: "rescue", label: "🚒 NDRF / SDRF / BRO Bases (6)" },
                { id: "shelter", label: "⛺ Evacuation Shelters (6)" },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setInfrCategory(cat.id)}
                  style={{
                    padding: "5px 12px",
                    borderRadius: "8px",
                    border: infrCategory === cat.id ? "1px solid #38bdf8" : "1px solid transparent",
                    background: infrCategory === cat.id ? "#0369a1" : "rgba(30, 41, 59, 0.6)",
                    color: infrCategory === cat.id ? "#ffffff" : "#cbd5e1",
                    fontSize: "0.78rem",
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Bottom row: State selector & Search input */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                <span style={{ fontSize: "0.76rem", color: "#94a3b8", fontWeight: "700" }}>STATE:</span>
                {[
                  "all",
                  "Assam",
                  "Sikkim",
                  "Meghalaya",
                  "Arunachal Pradesh",
                  "Nagaland",
                  "Manipur",
                  "Mizoram",
                  "Tripura",
                ].map((st) => (
                  <button
                    key={st}
                    onClick={() => setInfrState(st)}
                    style={{
                      padding: "3px 10px",
                      borderRadius: "6px",
                      border: infrState === st ? "1px solid #64748b" : "1px solid rgba(255, 255, 255, 0.05)",
                      background: infrState === st ? "#334155" : "transparent",
                      color: infrState === st ? "#38bdf8" : "#94a3b8",
                      fontSize: "0.74rem",
                      fontWeight: infrState === st ? "700" : "500",
                      cursor: "pointer",
                    }}
                  >
                    {st === "all" ? "All 8 States" : st}
                  </button>
                ))}
              </div>

              {/* Search text input */}
              <input
                type="text"
                placeholder="🔍 Search name, district, or capacity..."
                value={infrSearch}
                onChange={(e) => setInfrSearch(e.target.value)}
                style={{
                  padding: "6px 12px",
                  borderRadius: "8px",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  background: "rgba(15, 23, 42, 0.9)",
                  color: "#f8fafc",
                  fontSize: "0.8rem",
                  minWidth: "240px",
                  outline: "none",
                }}
              />
            </div>
          </div>

          {/* Cards Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
              gap: "16px",
            }}
          >
            {NER_EMERGENCY_FACILITIES.filter((fac) => {
              const matchesCat = infrCategory === "all" || fac.type === infrCategory;
              const matchesState = infrState === "all" || fac.state.toLowerCase() === infrState.toLowerCase();
              const matchesQuery =
                !infrSearch ||
                fac.name.toLowerCase().includes(infrSearch.toLowerCase()) ||
                fac.city.toLowerCase().includes(infrSearch.toLowerCase()) ||
                fac.state.toLowerCase().includes(infrSearch.toLowerCase()) ||
                fac.category.toLowerCase().includes(infrSearch.toLowerCase());
              return matchesCat && matchesState && matchesQuery;
            }).map((fac) => (
              <div
                key={fac.id}
                style={{
                  backgroundColor: "rgba(15, 23, 42, 0.85)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: "14px",
                  padding: "18px 20px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  transition: "transform 0.15s ease, border-color 0.15s ease",
                }}
              >
                <div>
                  {/* Category & State Tag */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px", gap: "8px" }}>
                    <span
                      style={{
                        fontSize: "0.7rem",
                        padding: "2px 8px",
                        borderRadius: "4px",
                        fontWeight: "700",
                        backgroundColor:
                          fac.type === "hospital"
                            ? "rgba(239, 68, 68, 0.2)"
                            : fac.type === "office"
                            ? "rgba(139, 92, 246, 0.2)"
                            : fac.type === "rescue"
                            ? "rgba(234, 88, 12, 0.2)"
                            : "rgba(37, 99, 235, 0.2)",
                        color:
                          fac.type === "hospital"
                            ? "#f87171"
                            : fac.type === "office"
                            ? "#c084fc"
                            : fac.type === "rescue"
                            ? "#fb923c"
                            : "#60a5fa",
                        border: `1px solid ${
                          fac.type === "hospital"
                            ? "#ef4444"
                            : fac.type === "office"
                            ? "#8b5cf6"
                            : fac.type === "rescue"
                            ? "#ea580c"
                            : "#2563eb"
                        }`,
                      }}
                    >
                      {fac.type === "hospital"
                        ? "🏥 " + fac.category
                        : fac.type === "office"
                        ? "🏛️ " + fac.category
                        : fac.type === "rescue"
                        ? "🚒 " + fac.category
                        : "⛺ " + fac.category}
                    </span>

                    <span
                      style={{
                        fontSize: "0.72rem",
                        fontWeight: "700",
                        backgroundColor: "#065f46",
                        color: "#a7f3d0",
                        padding: "2px 8px",
                        borderRadius: "4px",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {fac.state}
                    </span>
                  </div>

                  {/* Title */}
                  <h4 style={{ margin: "4px 0 6px 0", fontSize: "1.08rem", fontWeight: "700", color: "#f8fafc", lineHeight: "1.3" }}>
                    {fac.name}
                  </h4>

                  {/* Location & Capacity */}
                  <div style={{ fontSize: "0.78rem", color: "#94a3b8", marginBottom: "8px", display: "flex", flexDirection: "column", gap: "4px" }}>
                    <div>📍 {fac.address}</div>
                    <div style={{ color: "#e2e8f0" }}>
                      👥 <strong>Capacity:</strong> {fac.capacity}
                    </div>
                  </div>

                  {/* Badges */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "12px" }}>
                    {fac.facilities?.map((f, i) => (
                      <span
                        key={i}
                        style={{
                          fontSize: "0.68rem",
                          backgroundColor: "rgba(30, 41, 59, 0.8)",
                          color: "#cbd5e1",
                          padding: "2px 6px",
                          borderRadius: "4px",
                          border: "1px solid rgba(255, 255, 255, 0.05)",
                        }}
                      >
                        ✓ {f}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bottom Actions & Helplines */}
                <div style={{ borderTop: "1px solid rgba(255, 255, 255, 0.06)", paddingTop: "12px", marginTop: "6px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                    <span style={{ fontSize: "0.74rem", color: "#10b981", fontWeight: "700" }}>
                      ● {fac.status}
                    </span>
                    <span style={{ fontSize: "0.78rem", color: "#fca5a5", fontWeight: "700" }}>
                      📞 {fac.emergencyPhone}
                    </span>
                  </div>

                  <div style={{ display: "flex", gap: "8px" }}>
                    <Link
                      to={`/map?region=ner&lat=${fac.lat}&lng=${fac.lng}`}
                      style={{
                        flex: "1",
                        textAlign: "center",
                        padding: "7px 10px",
                        backgroundColor: "#16a34a",
                        color: "#ffffff",
                        borderRadius: "8px",
                        fontWeight: "700",
                        fontSize: "0.78rem",
                        textDecoration: "none",
                        transition: "background 0.15s ease",
                      }}
                    >
                      📍 Live Map View
                    </Link>
                    <a
                      href={`tel:${fac.emergencyPhone.replace(/[^0-9]/g, "")}`}
                      style={{
                        padding: "7px 12px",
                        backgroundColor: "rgba(239, 68, 68, 0.2)",
                        color: "#f87171",
                        border: "1px solid #ef4444",
                        borderRadius: "8px",
                        fontWeight: "700",
                        fontSize: "0.78rem",
                        textDecoration: "none",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      📞 Call
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}


      {/* ── AR See the Risk Feature Banner ── */}
      <div style={{
        background: 'linear-gradient(135deg, #0c2340, #0369a1 60%, #0c2340)',
        border: '2px solid #22d3ee',
        borderRadius: '16px',
        padding: '20px 24px',
        marginTop: '24px',
        display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap',
        boxShadow: '0 0 40px rgba(34,211,238,0.2)',
      }}>
        <span style={{ fontSize: '3rem', flexShrink: 0 }}>📡</span>
        <div style={{ flex: 1, minWidth: '220px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontSize: '1rem', fontWeight: 800, color: '#22d3ee' }}>AR "See the Risk" — World First</span>
            <span style={{ background: 'linear-gradient(135deg,#7c3aed,#1d4ed8)', color: '#fff', borderRadius: '6px', padding: '2px 8px', fontSize: '0.65rem', fontWeight: 800 }}>NEW</span>
          </div>
          <p style={{ margin: 0, fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.5 }}>
            Point your phone camera at any slope — see a live LSI heatmap overlay and safe-distance line in real time. Designed for non-literate users in remote NER villages. Nobody in disaster-tech has shipped this.
          </p>
        </div>
        <Link to="/ar-see-the-risk" style={{
          background: 'linear-gradient(135deg,#22d3ee,#0369a1)',
          color: '#000',
          border: 'none',
          borderRadius: '10px',
          padding: '12px 24px',
          fontSize: '0.92rem',
          fontWeight: 800,
          textDecoration: 'none',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          boxShadow: '0 4px 20px rgba(34,211,238,0.45)',
          flexShrink: 0,
        }}>
          🚀 Launch AR Camera
        </Link>
      </div>

      <style>{`
        @keyframes arGlow {
          from { box-shadow: 0 4px 14px rgba(34,211,238,0.3); }
          to   { box-shadow: 0 4px 28px rgba(34,211,238,0.7); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.3; }
        }
      `}</style>

    </div>
  );
}
