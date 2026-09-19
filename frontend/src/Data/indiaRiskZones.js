// ─── INDIA & NER GEOGRAPHIC DISASTER RISK ZONES DATASET ─────────────────────
// Coordinate Space: SVG 1000 x 680 Viewport
// Special focus on North Eastern Region (NER: Sikkim, Assam, Arunachal, Meghalaya, Nagaland, Manipur, Mizoram, Tripura)

export const INDIA_MAP_OUTLINE_PATH = `
  M 320,20
  L 355,24 L 385,48 L 415,75 L 425,102 L 405,125 L 438,152 L 472,178
  L 525,212 L 575,232
  L 588,206 L 610,210 L 606,238
  L 652,234 L 688,168 L 760,144 L 838,158 L 872,192 L 852,228
  L 830,274 L 820,332 L 802,374 L 780,424 L 762,442 L 748,405
  L 736,370 L 715,382 L 708,354 L 652,338 L 626,324 L 604,296
  L 590,260 L 572,292 L 576,356 L 564,394 L 546,410 L 522,402
  L 492,440 L 464,482 L 434,528 L 402,572 L 378,618 L 362,658
  L 348,648 L 332,608 L 314,548 L 292,498 L 272,438 L 258,378
  L 238,368 L 202,392 L 172,378 L 166,340 L 194,320 L 174,290
  L 184,260 L 210,210 L 238,162 L 264,122 L 284,94 L 304,54 Z
`;

// Regional boundaries & natural corridors (subtle glowing stroke)
export const INDIA_REGION_PATHS = [
  // Siliguri Corridor / Chicken's Neck connecting mainland to NER
  { id: "siliguri_corridor", d: "M 575,232 L 590,260 L 604,296 L 626,324", stroke: "rgba(56, 189, 248, 0.4)", dash: "4,4" },
  // Brahmaputra River Basin line across NER
  { id: "brahmaputra_river", d: "M 860,185 Q 810,215 760,238 T 680,264 T 620,290 T 580,350", stroke: "rgba(56, 189, 248, 0.5)", dash: "none", width: "2" },
  // Teesta River flowing south from Sikkim through Kalimpong / NH-10
  { id: "teesta_river", d: "M 598,206 Q 604,228 600,248 T 592,274", stroke: "rgba(56, 189, 248, 0.6)", dash: "2,2", width: "1.8" },
  // Ganga River system through North India
  { id: "ganga_river", d: "M 445,160 Q 490,230 540,265 T 576,356", stroke: "rgba(56, 189, 248, 0.35)", dash: "none", width: "1.5" },
  // Himalayan Mountain Ridges
  { id: "himalayan_arc", d: "M 310,65 Q 400,120 520,195 T 670,225 T 845,170", stroke: "rgba(34, 197, 94, 0.3)", dash: "6,4", width: "1.5" },
  // Western Ghats Ridge Line
  { id: "western_ghats", d: "M 264,390 Q 280,470 305,530 T 345,640", stroke: "rgba(34, 197, 94, 0.25)", dash: "5,4", width: "1.5" },
  // NER State Inter-Connection Network
  { id: "ner_backbone", d: "M 606,238 L 686,182 L 724,246 L 802,288 L 788,352 L 752,406 L 708,364 L 668,308 Z", stroke: "rgba(245, 158, 11, 0.2)", dash: "3,3", width: "1" }
];

export const REGION_VIEWPORTS = {
  all: {
    id: "all",
    label: "🇮🇳 Full India (14 Zones)",
    badge: "Pan-India",
    viewBox: "0 0 1000 680",
    scale: 1,
    desc: "All National & NER Hazard Corridors"
  },
  ner: {
    id: "ner",
    label: "🏔️ NER Focus (NH-10, 8 States)",
    badge: "8 Critical Zones",
    viewBox: "540 120 360 360",
    scale: 2.2,
    desc: "Sikkim, Assam, Arunachal, Meghalaya, Nagaland, Manipur, Mizoram, Tripura"
  },
  himalayas: {
    id: "himalayas",
    label: "⛰️ North Himalayas (NH-7, NH-5, NH-44)",
    badge: "3 Corridors",
    viewBox: "260 30 260 190",
    scale: 2.4,
    desc: "Uttarakhand Joshimath, HP Kinnaur, J&K Ramban"
  },
  south: {
    id: "south",
    label: "🌊 Western Ghats (Wayanad NH-766)",
    badge: "Western Ghats",
    viewBox: "260 480 180 200",
    scale: 2.5,
    desc: "Kerala Wayanad Debris Flow Belt"
  },
  east: {
    id: "east",
    label: "🌪️ East Coast & Delta (Odisha & Bengal)",
    badge: "Coastal Surge",
    viewBox: "440 330 190 160",
    scale: 2.3,
    desc: "Odisha Cyclone Belt & Sundarbans Delta"
  }
};

export const INDIA_RISK_ZONES = [
  // ──────────────────────────────────────────────────────────────────────────
  // 1. NER: SIKKIM / KALIMPONG — NH-10 (CRITICAL BASELINE)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "nh10_sikkim",
    incidentId: 1,
    name: "Landslide Risk Zone NH-10",
    subtitle: "Sikkim-Kalimpong Teesta Corridor (NER Lifeline)",
    state: "Sikkim / North Bengal",
    region: "ner",
    level: "CRITICAL",
    levelColor: "#ef4444",
    type: "Landslide / Flash Flood",
    highway: "NH-10",
    lsi: "94% LSI (FoS: 0.91)",
    center: { x: 602, y: 228 },
    polygons: {
      critical: "592,216 618,210 624,234 606,244 588,232",
      warning: "578,206 628,202 638,244 612,256 574,238"
    },
    evacuationRoad: "M 570,265 Q 590,245 604,228 T 622,205",
    secondaryRoad: "M 588,222 Q 606,212 626,206 T 642,218",
    villages: [
      { name: "Towang village", pop: 98, color: "#fbbf24", x: 574, y: 206 },
      { name: "Teesta Bazaar", pop: 310, color: "#ef4444", x: 624, y: 236 },
      { name: "Khero village", pop: 212, color: "#fbbf24", x: 588, y: 250 },
      { name: "Ranipur village", pop: 161, color: "#4ade80", x: 630, y: 216 }
    ],
    rescueUnits: [
      { id: "RU-07", name: "Rescue Unit 07", status: "En Route", eta: "8 min", x: 586, y: 222 },
      { id: "RU-12", name: "NDRF Sapper Unit", status: "On Site", eta: "Live", x: 618, y: 242 }
    ],
    shelters: [
      { id: "SH-A", name: "Safe Shelter Alpha (Singtam)", capacity: 450, dist: "3.2 km", x: 616, y: 212 },
      { id: "SH-B", name: "Safe Shelter Beta (Kalimpong Hub)", capacity: 320, dist: "5.8 km", x: 580, y: 242 }
    ],
    blockedPoints: [
      { id: "BP-01", name: "29th Mile Rockfall Breach", road: "NH-10", x: 602, y: 232 }
    ],
    iotSensors: [
      { id: "IOT-S10A", name: "Pore Pressure Node S-10-A", sat: "94%", tilt: "4.8°", x: 596, y: 216 }
    ],
    details: {
      rainfall: "142 mm / 3h",
      soilSaturation: "94%",
      slopeAngle: "46°",
      exposed: 781,
      clearingEta: "08 min"
    }
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 2. NER: ASSAM — BRAHMAPUTRA FLOOD BASIN (NH-715 / KAZIRANGA & MAJULI)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "brahmaputra_assam",
    incidentId: 2,
    name: "Flood Risk Zone Brahmaputra Basin",
    subtitle: "NH-715 Kaziranga-Majuli Flood Inundation Belt",
    state: "Assam",
    region: "ner",
    level: "CRITICAL",
    levelColor: "#ef4444",
    type: "Riverine Breach & Flash Flood",
    highway: "NH-715 / NH-27",
    lsi: "92% Inundation Index",
    center: { x: 724, y: 246 },
    polygons: {
      critical: "704,234 748,228 760,256 722,266 696,250",
      warning: "688,226 764,218 774,268 714,278 682,258"
    },
    evacuationRoad: "M 660,270 Q 700,250 740,240 T 780,230",
    secondaryRoad: "M 700,265 Q 730,275 760,260",
    villages: [
      { name: "Bokakhat village", pop: 480, color: "#ef4444", x: 742, y: 232 },
      { name: "Majuli Island Ward-3", pop: 620, color: "#ef4444", x: 756, y: 260 },
      { name: "Silghat Settlement", pop: 295, color: "#fbbf24", x: 696, y: 262 }
    ],
    rescueUnits: [
      { id: "RU-AS01", name: "SDRF Water Rescue 04", status: "Active Ops", eta: "Live", x: 712, y: 238 },
      { id: "RU-AS02", name: "Indian Army Inflatable Boat Unit", status: "Dispatched", eta: "12 min", x: 746, y: 252 }
    ],
    shelters: [
      { id: "SH-AS01", name: "Kaziranga Elevated High Shelter", capacity: 800, dist: "1.8 km", x: 734, y: 258 },
      { id: "SH-AS02", name: "Bokakhat Relief Camp", capacity: 600, dist: "4.1 km", x: 708, y: 232 }
    ],
    blockedPoints: [
      { id: "BP-AS01", name: "NH-715 Submerged at Kohora", road: "NH-715", x: 728, y: 244 }
    ],
    iotSensors: [
      { id: "IOT-BR01", name: "CWC Hydro Sensor Majuli", sat: "99%", tilt: "0.2m gauge", x: 718, y: 250 }
    ],
    details: {
      rainfall: "186 mm / 24h",
      soilSaturation: "98%",
      slopeAngle: "12°",
      exposed: 1395,
      clearingEta: "15 min"
    }
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 3. NER: ARUNACHAL PRADESH — TAWANG / SELA PASS (NH-13)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "nh13_tawang",
    incidentId: 3,
    name: "Landslide Risk Zone NH-13",
    subtitle: "Tawang-Sela Pass Trans-Himalayan Slip Corridor",
    state: "Arunachal Pradesh",
    region: "ner",
    level: "CRITICAL",
    levelColor: "#ef4444",
    type: "Debris Avalanche & Snow-Rockfall",
    highway: "NH-13",
    lsi: "89% Geotechnical Instability",
    center: { x: 686, y: 182 },
    polygons: {
      critical: "670,170 706,164 716,190 684,198 662,184",
      warning: "654,162 718,156 728,202 676,210 648,192"
    },
    evacuationRoad: "M 648,220 Q 670,195 690,180 T 725,160",
    secondaryRoad: "M 670,200 Q 695,190 715,175",
    villages: [
      { name: "Dirang Valley", pop: 210, color: "#fbbf24", x: 704, y: 168 },
      { name: "Jang Settlement", pop: 175, color: "#ef4444", x: 662, y: 198 },
      { name: "Sange Camp", pop: 95, color: "#4ade80", x: 712, y: 194 }
    ],
    rescueUnits: [
      { id: "RU-AR01", name: "BRO Beacon Heavy Clearing Unit", status: "Cutting Debris", eta: "On Site", x: 676, y: 174 },
      { id: "RU-AR02", name: "ITBP High Altitude QRT", status: "Patrol", eta: "05 min", x: 702, y: 182 }
    ],
    shelters: [
      { id: "SH-AR01", name: "Dirang Safe Base Center", capacity: 350, dist: "4.5 km", x: 700, y: 188 }
    ],
    blockedPoints: [
      { id: "BP-AR01", name: "Sela Pass West Slope Rockslide", road: "NH-13", x: 688, y: 180 }
    ],
    iotSensors: [
      { id: "IOT-AR01", name: "Infrasonic Rock-Crack Telemetry", sat: "91%", tilt: "6.2°", x: 680, y: 178 }
    ],
    details: {
      rainfall: "112 mm / 6h",
      soilSaturation: "91%",
      slopeAngle: "58°",
      exposed: 480,
      clearingEta: "22 min"
    }
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 4. NER: MEGHALAYA — CHERRAPUNJI / SHELLA (SH-5)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "cherrapunji_meghalaya",
    incidentId: 4,
    name: "Flash Flood Corridor Cherrapunji-Shella",
    subtitle: "Sohra Plateau Hyper-Precipitation Basin",
    state: "Meghalaya",
    region: "ner",
    level: "HIGH",
    levelColor: "#f97316",
    type: "Karst Flash Flood & Cliff Collapse",
    highway: "SH-5 / NH-206",
    lsi: "86% Flood-Slip Index",
    center: { x: 668, y: 308 },
    polygons: {
      critical: "654,298 684,292 692,316 664,324 648,312",
      warning: "642,290 694,284 704,326 658,334 636,320"
    },
    evacuationRoad: "M 640,285 Q 660,300 675,315 T 695,330",
    secondaryRoad: "M 655,305 Q 675,310 685,325",
    villages: [
      { name: "Sohra Khas", pop: 230, color: "#fbbf24", x: 684, y: 294 },
      { name: "Shella River Border", pop: 190, color: "#f97316", x: 652, y: 322 },
      { name: "Nongriat Hamlet", pop: 85, color: "#4ade80", x: 690, y: 320 }
    ],
    rescueUnits: [
      { id: "RU-ML01", name: "Meghalaya SDRF Unit 03", status: "Staged", eta: "10 min", x: 660, y: 302 }
    ],
    shelters: [
      { id: "SH-ML01", name: "Sohra Cyclone/Rain Multi-Shelter", capacity: 500, dist: "2.1 km", x: 680, y: 310 }
    ],
    blockedPoints: [
      { id: "BP-ML01", name: "Wahkaba Gorge Bridge Overflow", road: "SH-5", x: 670, y: 312 }
    ],
    iotSensors: [
      { id: "IOT-ML01", name: "Ultrasonic Pluviometer Sohra", sat: "97%", tilt: "164mm/h", x: 664, y: 306 }
    ],
    details: {
      rainfall: "245 mm / 12h",
      soilSaturation: "96%",
      slopeAngle: "38°",
      exposed: 505,
      clearingEta: "18 min"
    }
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 5. NER: NAGALAND — KOHIMA-DIMAPUR (NH-29 PAGLAPA HAR)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "nh29_nagaland",
    incidentId: 5,
    name: "Landslide Risk Zone NH-29",
    subtitle: "Paglapahar-Kohima Sinking Highway Zone",
    state: "Nagaland",
    region: "ner",
    level: "HIGH",
    levelColor: "#f97316",
    type: "Deep-Seated Slope Creep",
    highway: "NH-29",
    lsi: "84% Creep Probability",
    center: { x: 802, y: 288 },
    polygons: {
      critical: "788,278 818,272 826,296 798,304 782,292",
      warning: "776,270 828,264 838,306 792,314 770,300"
    },
    evacuationRoad: "M 765,265 Q 790,280 810,295 T 835,315",
    secondaryRoad: "M 780,285 Q 805,290 820,305",
    villages: [
      { name: "Chumukedima Hill", pop: 340, color: "#f97316", x: 818, y: 274 },
      { name: "Medziphema Town", pop: 215, color: "#fbbf24", x: 782, y: 302 },
      { name: "Sechu-Zubza", pop: 160, color: "#4ade80", x: 824, y: 300 }
    ],
    rescueUnits: [
      { id: "RU-NL01", name: "Assam Rifles Disaster Wing", status: "En Route", eta: "14 min", x: 794, y: 282 }
    ],
    shelters: [
      { id: "SH-NL01", name: "Dimapur Govt Transit Safe Hub", capacity: 400, dist: "6.2 km", x: 814, y: 292 }
    ],
    blockedPoints: [
      { id: "BP-NL01", name: "Paglapahar Heavy Boulder Slip", road: "NH-29", x: 804, y: 290 }
    ],
    iotSensors: [
      { id: "IOT-NL01", name: "Sub-surface Inclinometer NL-29", sat: "89%", tilt: "5.1°", x: 798, y: 284 }
    ],
    details: {
      rainfall: "98 mm / 6h",
      soilSaturation: "88%",
      slopeAngle: "42°",
      exposed: 715,
      clearingEta: "25 min"
    }
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 6. NER: MANIPUR — IMPHAL-JIRIBAM (NH-37 MAKRU BASIN)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "nh37_manipur",
    incidentId: 6,
    name: "Mudslide Risk Zone NH-37",
    subtitle: "Makru River Basin-Noney Hill Slip",
    state: "Manipur",
    region: "ner",
    level: "HIGH",
    levelColor: "#f97316",
    type: "Mudflow & Rail Bridge Threat",
    highway: "NH-37",
    lsi: "82% Failure Vulnerability",
    center: { x: 788, y: 352 },
    polygons: {
      critical: "774,342 804,336 812,360 784,368 768,356",
      warning: "762,334 814,328 824,370 778,378 756,364"
    },
    evacuationRoad: "M 750,340 Q 780,350 800,360 T 825,375",
    secondaryRoad: "M 770,350 Q 790,365 810,365",
    villages: [
      { name: "Noney Outpost", pop: 190, color: "#f97316", x: 804, y: 338 },
      { name: "Makru Valley", pop: 140, color: "#fbbf24", x: 768, y: 366 }
    ],
    rescueUnits: [
      { id: "RU-MN01", name: "NDRF 12th Battalion QRT", status: "Deployed", eta: "09 min", x: 780, y: 346 }
    ],
    shelters: [
      { id: "SH-MN01", name: "Noney District Safe Camp", capacity: 300, dist: "3.5 km", x: 800, y: 356 }
    ],
    blockedPoints: [
      { id: "BP-MN01", name: "Makru Bridge Approach Mudflow", road: "NH-37", x: 790, y: 354 }
    ],
    iotSensors: [
      { id: "IOT-MN01", name: "Seismic Ground Sensor MN-02", sat: "90%", tilt: "3.9°", x: 784, y: 348 }
    ],
    details: {
      rainfall: "115 mm / 8h",
      soilSaturation: "90%",
      slopeAngle: "44°",
      exposed: 330,
      clearingEta: "19 min"
    }
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 7. NER: MIZORAM — AIZAWL NORTH (NH-54 / BAWNGKAWN-SAIRANG)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "nh54_mizoram",
    incidentId: 7,
    name: "Slope Failure Zone NH-54",
    subtitle: "Aizawl North Hunthar Sinking Ridge",
    state: "Mizoram",
    region: "ner",
    level: "MEDIUM",
    levelColor: "#eab308",
    type: "Urban Slope Failure & Talus Slip",
    highway: "NH-54 / NH-306",
    lsi: "76% Urban Risk",
    center: { x: 752, y: 406 },
    polygons: {
      critical: "740,396 766,392 774,414 748,420 734,410",
      warning: "730,388 776,384 784,424 742,430 724,418"
    },
    evacuationRoad: "M 730,380 Q 750,400 760,415 T 770,435",
    secondaryRoad: "M 742,395 Q 762,408 768,420",
    villages: [
      { name: "Sairang River Side", pop: 180, color: "#eab308", x: 768, y: 394 },
      { name: "Durtlang Ridge", pop: 260, color: "#4ade80", x: 736, y: 418 }
    ],
    rescueUnits: [
      { id: "RU-MZ01", name: "Mizoram State Disaster Force", status: "Monitoring", eta: "15 min", x: 746, y: 400 }
    ],
    shelters: [
      { id: "SH-MZ01", name: "Sairang Community Safe Hall", capacity: 280, dist: "2.7 km", x: 762, y: 410 }
    ],
    blockedPoints: [
      { id: "BP-MZ01", name: "Hunthar Slip Point Warning", road: "NH-54", x: 754, y: 408 }
    ],
    iotSensors: [
      { id: "IOT-MZ01", name: "Piezometer Station MZ-01", sat: "82%", tilt: "2.8°", x: 748, y: 402 }
    ],
    details: {
      rainfall: "84 mm / 6h",
      soilSaturation: "82%",
      slopeAngle: "36°",
      exposed: 440,
      clearingEta: "30 min"
    }
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 8. NER: TRIPURA — GOMATI BASIN (NH-8)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "nh8_tripura",
    incidentId: 8,
    name: "Flood Risk Zone Gomati Basin",
    subtitle: "NH-8 Sonamura-Udaipur Dyke Overflow",
    state: "Tripura",
    region: "ner",
    level: "MEDIUM",
    levelColor: "#eab308",
    type: "Riverine Dyke Erosion",
    highway: "NH-8",
    lsi: "74% Flood Exposure",
    center: { x: 708, y: 364 },
    polygons: {
      critical: "696,354 722,350 728,372 704,378 690,368",
      warning: "686,346 732,342 738,382 698,388 680,376"
    },
    evacuationRoad: "M 685,340 Q 705,360 715,375 T 730,395",
    secondaryRoad: "M 700,355 Q 715,365 725,380",
    villages: [
      { name: "Sonamura Lowland", pop: 220, color: "#eab308", x: 722, y: 352 },
      { name: "Melaghar Ward", pop: 310, color: "#4ade80", x: 692, y: 376 }
    ],
    rescueUnits: [
      { id: "RU-TR01", name: "Tripura TSR Disaster Wing", status: "On Alert", eta: "11 min", x: 702, y: 358 }
    ],
    shelters: [
      { id: "SH-TR01", name: "Udaipur High School Camp", capacity: 420, dist: "3.0 km", x: 718, y: 368 }
    ],
    blockedPoints: [
      { id: "BP-TR01", name: "Gomati Embankment Breach", road: "NH-8", x: 710, y: 366 }
    ],
    iotSensors: [
      { id: "IOT-TR01", name: "River Stage Gauge TR-03", sat: "86%", tilt: "0.4m rise", x: 704, y: 360 }
    ],
    details: {
      rainfall: "92 mm / 12h",
      soilSaturation: "86%",
      slopeAngle: "10°",
      exposed: 530,
      clearingEta: "20 min"
    }
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 9. PAN-INDIA: UTTARAKHAND — JOSHIMATH / CHAMOLI (NH-7)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "nh7_joshimath",
    incidentId: 9,
    name: "Subsidence Risk Zone NH-7",
    subtitle: "Joshimath-Chamoli Deep Ground Sinking Corridor",
    state: "Uttarakhand",
    region: "himalayas",
    level: "CRITICAL",
    levelColor: "#ef4444",
    type: "Ground Subsidence & Rock Slope Sinking",
    highway: "NH-7",
    lsi: "93% Geotechnical Hazard",
    center: { x: 432, y: 154 },
    polygons: {
      critical: "418,144 448,138 456,162 426,170 412,158",
      warning: "408,136 458,130 466,172 418,180 398,166"
    },
    evacuationRoad: "M 400,180 Q 425,160 445,150 T 470,135",
    secondaryRoad: "M 420,165 Q 440,155 455,165",
    villages: [
      { name: "Sunil Ward", pop: 310, color: "#ef4444", x: 444, y: 140 },
      { name: "Marwari Lower", pop: 240, color: "#fbbf24", x: 416, y: 168 }
    ],
    rescueUnits: [
      { id: "RU-UK01", name: "SDRF Uttarakhand Alpine Unit", status: "Evacuation Ops", eta: "Live", x: 424, y: 148 }
    ],
    shelters: [
      { id: "SH-UK01", name: "Pipalkoti Safe Base Center", capacity: 600, dist: "8.5 km", x: 444, y: 158 }
    ],
    blockedPoints: [
      { id: "BP-UK01", name: "Helang-Joshimath Road Fissure", road: "NH-7", x: 434, y: 156 }
    ],
    iotSensors: [
      { id: "IOT-UK01", name: "Extensometer Crack Node J-01", sat: "92%", tilt: "7.8mm slip", x: 428, y: 152 }
    ],
    details: {
      rainfall: "88 mm / 4h",
      soilSaturation: "92%",
      slopeAngle: "52°",
      exposed: 550,
      clearingEta: "12 min"
    }
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 10. PAN-INDIA: HIMACHAL PRADESH — KINNAUR (NH-5 NIGULSARI)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "nh5_kinnaur",
    incidentId: 10,
    name: "Rockfall Risk Zone NH-5",
    subtitle: "Nigulsari-Kinnaur Scree Avalanche Belt",
    state: "Himachal Pradesh",
    region: "himalayas",
    level: "HIGH",
    levelColor: "#f97316",
    type: "High-Velocity Rockfall",
    highway: "NH-5",
    lsi: "87% Kinetic Slide Hazard",
    center: { x: 382, y: 122 },
    polygons: {
      critical: "368,114 396,108 404,130 376,138 362,126",
      warning: "358,106 406,100 414,140 368,148 350,134"
    },
    evacuationRoad: "M 350,145 Q 375,130 395,120 T 420,110",
    secondaryRoad: "M 370,132 Q 390,122 405,130",
    villages: [
      { name: "Nigulsari", pop: 140, color: "#f97316", x: 392, y: 110 },
      { name: "Tapri Station", pop: 220, color: "#4ade80", x: 366, y: 136 }
    ],
    rescueUnits: [
      { id: "RU-HP01", name: "HP SDRF Rampur Emergency", status: "En Route", eta: "16 min", x: 374, y: 116 }
    ],
    shelters: [
      { id: "SH-HP01", name: "Reckong Peo Complex", capacity: 350, dist: "11 km", x: 392, y: 126 }
    ],
    blockedPoints: [
      { id: "BP-HP01", name: "Nigulsari Shooting Stone Zone", road: "NH-5", x: 384, y: 124 }
    ],
    iotSensors: [
      { id: "IOT-HP01", name: "Radar Rockfall Sensor HP-05", sat: "84%", tilt: "Velocity 42m/s", x: 378, y: 120 }
    ],
    details: {
      rainfall: "76 mm / 3h",
      soilSaturation: "84%",
      slopeAngle: "64°",
      exposed: 360,
      clearingEta: "28 min"
    }
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 11. PAN-INDIA: JAMMU & KASHMIR — RAMBAN-BANIHAL (NH-44)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "nh44_ramban",
    incidentId: 11,
    name: "Landslide Risk Zone NH-44",
    subtitle: "Ramban-Banihal Strategic Lifeline Slip",
    state: "Jammu & Kashmir",
    region: "himalayas",
    level: "HIGH",
    levelColor: "#f97316",
    type: "Mudslide & Shooting Stones",
    highway: "NH-44",
    lsi: "85% Blockage Probability",
    center: { x: 326, y: 78 },
    polygons: {
      critical: "312,70 340,64 348,86 320,94 306,82",
      warning: "302,62 350,56 358,96 312,104 294,90"
    },
    evacuationRoad: "M 295,100 Q 320,85 335,75 T 360,65",
    secondaryRoad: "M 315,88 Q 330,80 345,86",
    villages: [
      { name: "Mehar Basti", pop: 210, color: "#f97316", x: 336, y: 66 },
      { name: "Panthyal Gorge", pop: 190, color: "#fbbf24", x: 310, y: 92 }
    ],
    rescueUnits: [
      { id: "RU-JK01", name: "Traffic Police QRT 01", status: "Controlling Flow", eta: "Live", x: 318, y: 72 }
    ],
    shelters: [
      { id: "SH-JK01", name: "Banihal Community Transit Shelter", capacity: 450, dist: "5.0 km", x: 336, y: 82 }
    ],
    blockedPoints: [
      { id: "BP-JK01", name: "Cafeteria Morh Shooting Stones", road: "NH-44", x: 328, y: 80 }
    ],
    iotSensors: [
      { id: "IOT-JK01", name: "Optical Debris Sensor JK-44", sat: "86%", tilt: "Active Slip", x: 322, y: 76 }
    ],
    details: {
      rainfall: "82 mm / 4h",
      soilSaturation: "86%",
      slopeAngle: "55°",
      exposed: 400,
      clearingEta: "14 min"
    }
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 12. PAN-INDIA: KERALA — WAYANAD (NH-766 / CHOORALMALA-MEPPADI)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "nh766_wayanad",
    incidentId: 12,
    name: "Debris Flow Risk Zone Wayanad",
    subtitle: "Chooralmala-Meppadi Western Ghats Catastrophe Corridor",
    state: "Kerala",
    region: "south",
    level: "CRITICAL",
    levelColor: "#ef4444",
    type: "Catastrophic Mud-Debris Flow",
    highway: "NH-766 / SH-59",
    lsi: "96% Debris Flow Danger",
    center: { x: 324, y: 568 },
    polygons: {
      critical: "310,558 340,552 348,576 318,584 304,572",
      warning: "300,550 350,544 358,586 310,594 292,580"
    },
    evacuationRoad: "M 290,590 Q 315,575 330,565 T 350,550",
    secondaryRoad: "M 312,576 Q 328,570 342,578",
    villages: [
      { name: "Chooralmala Settlement", pop: 450, color: "#ef4444", x: 338, y: 554 },
      { name: "Meppadi Ward", pop: 520, color: "#ef4444", x: 308, y: 582 },
      { name: "Mundakkai Hamlet", pop: 380, color: "#fbbf24", x: 342, y: 580 }
    ],
    rescueUnits: [
      { id: "RU-KL01", name: "Indian Army Madras Sappers", status: "Bridge Build Ops", eta: "Live", x: 316, y: 562 },
      { id: "RU-KL02", name: "NDRF 4th Battalion Rescue", status: "Air Evac", eta: "Live", x: 332, y: 566 }
    ],
    shelters: [
      { id: "SH-KL01", name: "Meppadi St. Joseph Relief Hub", capacity: 900, dist: "2.4 km", x: 334, y: 572 }
    ],
    blockedPoints: [
      { id: "BP-KL01", name: "Chooralmala Bailey Bridge Approach", road: "SH-59", x: 326, y: 570 }
    ],
    iotSensors: [
      { id: "IOT-KL01", name: "Deep Soil Moisture Gauge KL-01", sat: "99%", tilt: "Water Logged", x: 320, y: 564 }
    ],
    details: {
      rainfall: "210 mm / 12h",
      soilSaturation: "99%",
      slopeAngle: "48°",
      exposed: 1350,
      clearingEta: "06 min"
    }
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 13. PAN-INDIA: ODISHA — JAGATSINGHPUR / KENDRAPARA (NH-316)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "nh316_odisha",
    incidentId: 13,
    name: "Cyclone Surge Zone Bay of Bengal",
    subtitle: "Puri-Jagatsinghpur Coastal Inundation Belt",
    state: "Odisha",
    region: "east",
    level: "HIGH",
    levelColor: "#f97316",
    type: "Storm Surge & Tidal Inundation",
    highway: "NH-316 / NH-516A",
    lsi: "88% Surge Inundation",
    center: { x: 504, y: 418 },
    polygons: {
      critical: "490,408 520,402 528,426 498,434 484,422",
      warning: "480,400 530,394 538,436 490,444 472,430"
    },
    evacuationRoad: "M 470,440 Q 495,425 515,415 T 540,405",
    secondaryRoad: "M 492,426 Q 508,420 522,428",
    villages: [
      { name: "Erasama Coast", pop: 410, color: "#f97316", x: 518, y: 404 },
      { name: "Astaranga Belt", pop: 290, color: "#fbbf24", x: 488, y: 432 }
    ],
    rescueUnits: [
      { id: "RU-OD01", name: "ODRAF Coastal Unit 03", status: "Deploying Boats", eta: "08 min", x: 496, y: 412 }
    ],
    shelters: [
      { id: "SH-OD01", name: "Erasama Multipurpose Cyclone Shelter", capacity: 700, dist: "1.5 km", x: 514, y: 422 }
    ],
    blockedPoints: [
      { id: "BP-OD01", name: "Saline Embankment Breach NH-316", road: "NH-316", x: 506, y: 420 }
    ],
    iotSensors: [
      { id: "IOT-OD01", name: "INCOIS Wave Buoy Bay-04", sat: "95%", tilt: "4.8m Swell", x: 500, y: 414 }
    ],
    details: {
      rainfall: "135 mm / 8h",
      soilSaturation: "94%",
      slopeAngle: "5°",
      exposed: 700,
      clearingEta: "15 min"
    }
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 14. PAN-INDIA: WEST BENGAL — SUNDARBANS DELTA
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "sundarbans_wb",
    incidentId: 14,
    name: "Tidal Surge Zone Sundarbans Delta",
    subtitle: "Kakdwip-Gosaba Estuarine Breach Belt",
    state: "West Bengal",
    region: "east",
    level: "MEDIUM",
    levelColor: "#eab308",
    type: "Estuarine Tidal Surge & Bund Collapse",
    highway: "SH-1 / Waterway Corridors",
    lsi: "78% Bund Failure",
    center: { x: 566, y: 374 },
    polygons: {
      critical: "552,364 582,358 590,382 560,390 546,378",
      warning: "542,356 592,350 600,392 552,400 534,386"
    },
    evacuationRoad: "M 535,395 Q 555,380 575,370 T 595,360",
    secondaryRoad: "M 554,382 Q 570,375 582,384",
    villages: [
      { name: "Gosaba Island", pop: 380, color: "#eab308", x: 580, y: 360 },
      { name: "Bali Island Ward", pop: 240, color: "#4ade80", x: 550, y: 388 }
    ],
    rescueUnits: [
      { id: "RU-WB01", name: "WB Civil Defence Rescue Boat 01", status: "Patrolling", eta: "13 min", x: 558, y: 368 }
    ],
    shelters: [
      { id: "SH-WB01", name: "Gosaba Cyclone Relief Hub", capacity: 480, dist: "2.8 km", x: 576, y: 378 }
    ],
    blockedPoints: [
      { id: "BP-WB01", name: "Riverine Bund Collapse on Creek", road: "Waterway", x: 568, y: 376 }
    ],
    iotSensors: [
      { id: "IOT-WB01", name: "Tidal Pressure Sensor G-02", sat: "93%", tilt: "High Tide 3.9m", x: 562, y: 370 }
    ],
    details: {
      rainfall: "105 mm / 8h",
      soilSaturation: "93%",
      slopeAngle: "4°",
      exposed: 620,
      clearingEta: "20 min"
    }
  }
];
