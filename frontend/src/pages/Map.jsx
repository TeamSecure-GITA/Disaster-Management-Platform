import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import {
  Layers,
  CloudRain,
  Wind,
  Droplets,
  Mountain,
  Waves,
  Flame,
  AlertTriangle,
  Navigation,
  Compass,
  CheckCircle2,
  Wifi,
  WifiOff,
  Filter,
  Eye,
  Info,
  X,
  Crosshair,
} from "lucide-react";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Helper: Calculate distance in km between two lat/lng points (Haversine formula)
function getDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return (R * c).toFixed(1);
}

// Helper: Get compass bearing description
function getBearing(lat1, lon1, lat2, lon2) {
  const y = Math.sin(((lon2 - lon1) * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180);
  const x =
    Math.cos((lat1 * Math.PI) / 180) * Math.sin((lat2 * Math.PI) / 180) -
    Math.sin((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.cos(((lon2 - lon1) * Math.PI) / 180);
  const brng = ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
  const points = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  return points[Math.round(brng / 22.5) % 16];
}

// Custom colored SVG markers for distinct facility & risk types
const createCustomIcon = (color, emoji) => {
  return L.divIcon({
    className: "custom-leaflet-marker",
    html: `<div style="
      background-color: ${color};
      width: 34px;
      height: 34px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2.5px solid #ffffff;
      box-shadow: 0 4px 12px rgba(0,0,0,0.5);
      font-size: 16px;
      cursor: pointer;
    ">${emoji}</div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -18],
  });
};

const createRiskBadgeIcon = (riskPercent, color) => {
  return L.divIcon({
    className: "risk-badge-marker",
    html: `<div style="
      background-color: ${color};
      color: #ffffff;
      padding: 3px 7px;
      border-radius: 20px;
      font-weight: 800;
      font-size: 11px;
      border: 2px solid #ffffff;
      box-shadow: 0 3px 10px rgba(0,0,0,0.6);
      display: flex;
      align-items: center;
      gap: 3px;
      white-space: nowrap;
      cursor: pointer;
    ">
      <span>⚠️</span>
      <span>${riskPercent}%</span>
    </div>`,
    iconSize: [52, 24],
    iconAnchor: [26, 12],
    popupAnchor: [0, -14],
  });
};

const hospitalIcon = createCustomIcon("#ef4444", "🏥");
const shelterIcon  = createCustomIcon("#2563eb", "⛺");
const fireIcon     = createCustomIcon("#ea580c", "🚒");
const hazardIcon   = createCustomIcon("#dc2626", "⚠️");

// Component to dynamically pan and zoom the map
function MapController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom || 13, { duration: 1.2 });
    }
  }, [center, zoom, map]);
  return null;
}

// ─── Real Emergency Facilities Dataset ──────────────────────────────────────
const EMERGENCY_FACILITIES = [
  {
    id: "hosp-1",
    name: "AIIMS Super Specialty Hospital",
    type: "hospital",
    category: "Hospital & Trauma Center",
    lat: 20.2312,
    lng: 85.7765,
    address: "Sijua, Patrapada, Bhubaneswar, Odisha 751019",
    phone: "+91 674 2476789",
    emergencyPhone: "108 / 112",
    capacity: "850 Emergency Beds • 24/7 ICU & Trauma",
    status: "Open 24/7",
    website: "https://aiimsbhubaneswar.nic.in",
  },
  {
    id: "hosp-2",
    name: "Capital Hospital & Disaster Emergency Ward",
    type: "hospital",
    category: "Government Hospital",
    lat: 20.2644,
    lng: 85.8281,
    address: "Unit 6, Ganga Nagar, Bhubaneswar, Odisha 751001",
    phone: "+91 674 2391983",
    emergencyPhone: "108",
    capacity: "600 Beds • Blood Bank Available",
    status: "Open 24/7",
    website: "https://capitalhospital.nic.in",
  },
  {
    id: "hosp-3",
    name: "KIMS Medical College & Hospital",
    type: "hospital",
    category: "Super Specialty Hospital",
    lat: 20.3533,
    lng: 85.8189,
    address: "KIIT Road, Patia, Bhubaneswar, Odisha 751024",
    phone: "+91 674 2725472",
    emergencyPhone: "+91 674 2725473",
    capacity: "1200 Beds • Advanced Burn & Trauma Units",
    status: "Open 24/7",
    website: "https://kims.kiit.ac.in",
  },
  {
    id: "hosp-4",
    name: "SCB Medical College & Hospital",
    type: "hospital",
    category: "Premier Emergency Medical College",
    lat: 20.4625,
    lng: 85.8928,
    address: "Mangalabag, Cuttack, Odisha 753007",
    phone: "+91 671 2414080",
    emergencyPhone: "108 / +91 671 2414147",
    capacity: "1800 Beds • Apex Trauma & Cyclone Response Facility",
    status: "Open 24/7",
    website: "https://scbmch.in",
  },
  {
    id: "hosp-5",
    name: "Apollo Hospitals Emergency Center",
    type: "hospital",
    category: "Private Super Specialty",
    lat: 20.3089,
    lng: 85.8338,
    address: "Plot No. 251, Sainik School Rd, Unit 15, Bhubaneswar 751005",
    phone: "+91 674 6661016",
    emergencyPhone: "1066",
    capacity: "350 Beds • Emergency Cath Lab & Helipad",
    status: "Open 24/7",
    website: "https://bhubaneswar.apollohospitals.com",
  },
  {
    id: "hosp-6",
    name: "District Headquarters Hospital Puri",
    type: "hospital",
    category: "Coastal District Hospital",
    lat: 19.8135,
    lng: 85.8312,
    address: "Grand Road, Puri, Odisha 752001",
    phone: "+91 6752 222034",
    emergencyPhone: "108",
    capacity: "400 Beds • Coastal Disaster Ready",
    status: "Open 24/7",
    website: "https://puri.nic.in/health",
  },
  {
    id: "hosp-7",
    name: "Balasore District Emergency Hospital",
    type: "hospital",
    category: "District Emergency Hospital",
    lat: 21.4934,
    lng: 86.9337,
    address: "Hospital Road, Balasore, Odisha 756001",
    phone: "+91 6782 262018",
    emergencyPhone: "108",
    capacity: "450 Beds • Flood & Storm Care",
    status: "Open 24/7",
    website: "https://balasore.nic.in",
  },

  // ── RESCUE CENTERS & CYCLONE SHELTERS ──
  {
    id: "shelter-1",
    name: "Bhubaneswar Central Disaster Relief Camp",
    type: "shelter",
    category: "Multi-Purpose Rescue Center",
    lat: 20.2961,
    lng: 85.8245,
    address: "Unit 1, Master Canteen Area, Bhubaneswar 751009",
    phone: "+91 674 2301234",
    emergencyPhone: "1077 (District Control)",
    capacity: "1,200 Persons • Drinking Water & Food Station",
    status: "Active / Available",
    website: "https://bhubaneswar.me",
  },
  {
    id: "shelter-2",
    name: "Puri Coastal Multi-Purpose Cyclone Shelter",
    type: "shelter",
    category: "ODRAP Cyclone Shelter",
    lat: 19.7983,
    lng: 85.8195,
    address: "Chakratirtha Road, Marine Drive, Puri, Odisha 752002",
    phone: "+91 6752 230012",
    emergencyPhone: "1070 (SDMA Helpline)",
    capacity: "2,000 Persons • Wind Resistant (Category 5)",
    status: "Active / Available",
    website: "https://osdma.org",
  },
  {
    id: "shelter-3",
    name: "Cuttack Mahanadi Flood Relief Center",
    type: "shelter",
    category: "Flood Evacuation Shelter",
    lat: 20.4728,
    lng: 85.8753,
    address: "Ring Road, Barabati Stadium Compound, Cuttack 753001",
    phone: "+91 671 2305544",
    emergencyPhone: "1077",
    capacity: "1,500 Persons • Boat Rescue Unit On-Site",
    status: "Active / Available",
    website: "https://cuttack.nic.in",
  },
  {
    id: "shelter-4",
    name: "Balasore Coastal Evacuation Shelter",
    type: "shelter",
    category: "Cyclone & Storm Shelter",
    lat: 21.5034,
    lng: 86.9212,
    address: "Station Road, Balasore, Odisha 756001",
    phone: "+91 6782 250100",
    emergencyPhone: "1070",
    capacity: "900 Persons • Generator & Medical Supplies",
    status: "Active / Available",
    website: "https://osdma.org",
  },
  {
    id: "shelter-5",
    name: "Paradip Port Marine Rescue Base",
    type: "shelter",
    category: "Marine & Coastal Rescue Camp",
    lat: 20.2647,
    lng: 86.6853,
    address: "Port Trust Compound, Paradip, Jagatsinghpur 754142",
    phone: "+91 6722 222155",
    emergencyPhone: "1554 (Coast Guard)",
    capacity: "1,000 Persons • Coast Guard Heli-Base",
    status: "Active / Available",
    website: "https://paradipport.gov.in",
  },

  // ── FIRE & RAPID RESCUE STATIONS ──
  {
    id: "fire-1",
    name: "ODRAF & NDRF Rapid Action Rescue Base",
    type: "fire",
    category: "Rapid Action Disaster Response Force",
    lat: 20.3175,
    lng: 85.8012,
    address: "Baramunda, Bhubaneswar, Odisha 751003",
    phone: "+91 674 2354101",
    emergencyPhone: "101 / 112",
    capacity: "Inflatable Boats, Cutters, Hazmat Gear",
    status: "Ready for Deployment",
    website: "https://odishafireservices.gov.in",
  },
  {
    id: "fire-2",
    name: "Cuttack Central Emergency Fire Station",
    type: "fire",
    category: "Fire & River Rescue Base",
    lat: 20.4611,
    lng: 85.8694,
    address: "Buxi Bazaar, Cuttack, Odisha 753001",
    phone: "+91 671 2415101",
    emergencyPhone: "101",
    capacity: "High Pressure Pumps, Snorkel Cranes",
    status: "Ready for Deployment",
    website: "https://odishafireservices.gov.in",
  },
];

// ─── SATELLITE WEATHER DETECTION & GROUND HAZARD ZONES ────────────────────────
// Color coded like Google Weather / Crisis Maps by category and risk %
const SATELLITE_WEATHER_RISK_ZONES = [
  // ── FLOOD INUNDATION ──
  {
    id: "risk-flood-1",
    name: "Mahanadi River Basin Inundation Sector",
    category: "flood",
    categoryLabel: "🌊 Flood Inundation",
    riskPercent: 88,
    color: "#0284c7", // Deep Cyan / Blue
    lat: 20.485,
    lng: 85.852,
    radius: 5400,
    weather: { rainfall: "82 mm/h", waterLevel: "+1.6m Above Danger", wind: "48 km/h", soilSaturation: "94%" },
    advisory: "Severe river overflow. Lowland settlements instructed to evacuate to Cuttack Flood Shelter.",
    action: "Evacuate embankments immediately.",
  },
  {
    id: "risk-flood-2",
    name: "Brahmani River Lower Delta Plains",
    category: "flood",
    categoryLabel: "🌊 Flood Inundation",
    riskPercent: 74,
    color: "#0284c7",
    lat: 20.850,
    lng: 86.320,
    radius: 4800,
    weather: { rainfall: "58 mm/h", waterLevel: "+0.9m Above Warning", wind: "42 km/h", soilSaturation: "88%" },
    advisory: "Heavy agricultural waterlogging. Relief powerboats stationed on standby.",
    action: "Move livestock and supplies to higher elevation.",
  },

  // ── CYCLONE & HIGH WIND ──
  {
    id: "risk-cyclone-1",
    name: "Bay of Bengal Coastal Cyclone Front (Puri Corridor)",
    category: "cyclone",
    categoryLabel: "🌀 Cyclone & High Wind",
    riskPercent: 94,
    color: "#9333ea", // Magenta / Deep Violet
    lat: 19.820,
    lng: 85.920,
    radius: 7200,
    weather: { wind: "135 km/h Gusts", pressure: "968 hPa", tidalSurge: "3.2m", cloudCover: "100%" },
    advisory: "Category 4 tropical storm vortex detected on radar. Total fishing ban and coastal evacuation in effect.",
    action: "Relocate to ODRAP Wind-Resistant Shelters immediately.",
  },
  {
    id: "risk-cyclone-2",
    name: "Paradip Marine Cyclone Surge Sector",
    category: "cyclone",
    categoryLabel: "🌀 Cyclone & High Wind",
    riskPercent: 86,
    color: "#9333ea",
    lat: 20.280,
    lng: 86.710,
    radius: 6500,
    weather: { wind: "115 km/h", pressure: "974 hPa", tidalSurge: "2.5m", cloudCover: "95%" },
    advisory: "Heavy maritime swell and storm tides threatening harbour structures.",
    action: "Anchor marine craft and evacuate harbour periphery.",
  },

  // ── HEAVY RAIN & CLOUDBURST ──
  {
    id: "risk-rain-1",
    name: "Bhubaneswar Urban Cloudburst & Flash Flood Sector",
    category: "heavy_rain",
    categoryLabel: "🌧️ Heavy Rain & Cloudburst",
    riskPercent: 81,
    color: "#4f46e5", // Indigo / Electric Blue
    lat: 20.320,
    lng: 85.780,
    radius: 4200,
    weather: { rainfall: "95 mm/h Flash Precip", visibility: "400m", humidity: "98%", temp: "24°C" },
    advisory: "Extreme cloudburst detected on Doppler radar. Waterlogging across major transit roads.",
    action: "Avoid underpasses and low-lying transit routes.",
  },
  {
    id: "risk-rain-2",
    name: "Balasore Upstream Monsoon Deluge",
    category: "heavy_rain",
    categoryLabel: "🌧️ Heavy Rain & Cloudburst",
    riskPercent: 68,
    color: "#4f46e5",
    lat: 21.460,
    lng: 86.880,
    radius: 4000,
    weather: { rainfall: "52 mm/h", visibility: "1.2 km", humidity: "94%", temp: "26°C" },
    advisory: "Persistent high-volume precipitation causing local canal overflows.",
    action: "Maintain drainage channels clear of blockages.",
  },

  // ── LANDSLIDE & SLOPE INSTABILITY ──
  {
    id: "risk-landslide-1",
    name: "Eastern Ghats Escarpment Landslide Vulnerability",
    category: "landslide",
    categoryLabel: "⛰️ Landslide & Slope Instability",
    riskPercent: 87,
    color: "#dc2626", // Crimson / Red-Orange
    lat: 19.450,
    lng: 84.450,
    radius: 5000,
    weather: { shearStrain: "Critical High", soilMoisture: "96%", rockfallAlert: "Active", slopeAngle: "42°" },
    advisory: "Satellite InSAR sensor reports 65mm slope displacement. Hill highways blocked by boulders.",
    action: "Do not travel along mountain ghat roads; seek flat bedrock shelters.",
  },
  {
    id: "risk-landslide-2",
    name: "Daringbadi Ridge Mudslide Danger Zone",
    category: "landslide",
    categoryLabel: "⛰️ Landslide & Slope Instability",
    riskPercent: 76,
    color: "#dc2626",
    lat: 19.900,
    lng: 84.130,
    radius: 4200,
    weather: { shearStrain: "High", soilMoisture: "91%", rainfall: "74 mm/h", slopeAngle: "38°" },
    advisory: "Excess ground saturation triggered shallow mudslides along village access trails.",
    action: "Evacuate hillside dwellings to designated safe base camps.",
  },

  // ── NER LANDSLIDE & MOUNTAIN CORRIDORS (NORTH EASTERN REGION) ──
  {
    id: "risk-ner-landslide-1",
    name: "NH-10 Teesta Valley Corridor (29th Mile / Birik Dara, Sikkim)",
    category: "landslide",
    categoryLabel: "⛰️ Landslide & Slope Instability (NER)",
    riskPercent: 94,
    color: "#dc2626",
    lat: 27.0654,
    lng: 88.4612,
    radius: 7500,
    weather: { shearStrain: "Extreme Structural Failure", soilMoisture: "94%", rainfall: "164 mm/24h", slopeAngle: "54°" },
    advisory: "NH-10 Severed at 29th Mile. Massive debris accumulation. High-risk rockfall active across Teesta gorge.",
    action: "BRO clearance active. Light vehicles routed via Lava-Algarah-Gorubathan. Seek bedrock shelters.",
  },
  {
    id: "risk-ner-landslide-2",
    name: "NH-29 Dzüdza & Phesama Mudslide Sector (Kohima-Dimapur, Nagaland)",
    category: "landslide",
    categoryLabel: "⛰️ Landslide & Slope Instability (NER)",
    riskPercent: 88,
    color: "#dc2626",
    lat: 25.6741,
    lng: 94.0256,
    radius: 6000,
    weather: { shearStrain: "Critical Creep", soilMoisture: "88%", rainfall: "98 mm/24h", slopeAngle: "48°" },
    advisory: "Active slope deformation & mud runoff. NH-29 single-lane alternating movement with severe hazard.",
    action: "Strictly avoid nighttime transit. Standby emergency vehicles pre-positioned at Phesama checkpost.",
  },
  {
    id: "risk-ner-landslide-3",
    name: "NH-6 Sonapur Tunnel Mudslide Zone (East Jaintia Hills, Meghalaya)",
    category: "landslide",
    categoryLabel: "⛰️ Landslide & Slope Instability (NER)",
    riskPercent: 91,
    color: "#dc2626",
    lat: 25.1120,
    lng: 92.3680,
    radius: 6500,
    weather: { shearStrain: "Torrential Surcharge", soilMoisture: "96%", rainfall: "212 mm/24h", slopeAngle: "42°" },
    advisory: "Heavy siltation and mudslide plume spilling over Sonapur tunnel approach. Barak Valley lifeline imperiled.",
    action: "Convoy movement restricted to daytime with heavy machinery escorts. Follow Meghalaya SDRF advisories.",
  },
  {
    id: "risk-ner-landslide-4",
    name: "Jatinga Railway Bypass & Slope Failure (Dima Hasao, Assam)",
    category: "landslide",
    categoryLabel: "⛰️ Landslide & Slope Instability (NER)",
    riskPercent: 82,
    color: "#dc2626",
    lat: 25.1321,
    lng: 92.9867,
    radius: 5500,
    weather: { shearStrain: "High Infiltration", soilMoisture: "86%", rainfall: "128 mm/24h", slopeAngle: "38°" },
    advisory: "Continuous hill track slippage and embankment erosion reported along Lumding-Badarpur hill railway.",
    action: "Rail patrolling teams deployed. Road vehicles follow diversion via Umrangso.",
  },

  // ── SOIL MOISTURE SATURATION ──
  {
    id: "risk-moisture-1",
    name: "Chilika Coastal Fringe Hyper-Hydrated Wetland",
    category: "soil_moisture",
    categoryLabel: "🌱 Soil Moisture Saturation",
    riskPercent: 92,
    color: "#059669", // Emerald / Teal
    lat: 19.720,
    lng: 85.320,
    radius: 6200,
    weather: { soilSaturation: "98% (Super-Saturated)", groundTable: "0.1m", percolation: "Zero", temp: "27°C" },
    advisory: "Water table has reached ground surface level. Structural ground liquefaction hazard.",
    action: "Heavy machinery and rescue vehicles must avoid soft unpaved tracks.",
  },
  {
    id: "risk-moisture-2",
    name: "Mahanadi Delta Alluvial Saturated Silt Plains",
    category: "soil_moisture",
    categoryLabel: "🌱 Soil Moisture Saturation",
    riskPercent: 80,
    color: "#059669",
    lat: 20.380,
    lng: 86.150,
    radius: 5100,
    weather: { soilSaturation: "89%", groundTable: "0.3m", percolation: "Minimal", temp: "26°C" },
    advisory: "Saturated topsoil inability to absorb further precipitation, creating high surface runoff.",
    action: "Reinforce sandbag perimeter barriers.",
  },

  // ── SOIL EROSION & RIVERBANK DEPLETION ──
  {
    id: "risk-erosion-1",
    name: "Subarnarekha River Estuary Coastal Erosion Belt",
    category: "erosion",
    categoryLabel: "🏜️ Soil Erosion & Riverbank Risk",
    riskPercent: 79,
    color: "#d97706", // Golden Amber / Tawny
    lat: 21.580,
    lng: 87.320,
    radius: 4600,
    weather: { erosionRate: "14 cm/day", tidalScour: "High", bankSlumping: "Active", waveHeight: "2.8m" },
    advisory: "Severe tidal scour scouring away agricultural embankments and rural roadways.",
    action: "Avoid standing on undercut river edges or earthen dykes.",
  },
  {
    id: "risk-erosion-2",
    name: "Devi River Mouth Erosion & Shoreline Retreat",
    category: "erosion",
    categoryLabel: "🏜️ Soil Erosion & Riverbank Risk",
    riskPercent: 72,
    color: "#d97706",
    lat: 19.980,
    lng: 86.400,
    radius: 4100,
    weather: { erosionRate: "9 cm/day", tidalScour: "Moderate", bankSlumping: "Localized", waveHeight: "2.2m" },
    advisory: "Coastal sandspit erosion accelerating toward human habitations.",
    action: "Deploy geo-synthetic bags along exposed shoreline sectors.",
  },
];

export default function Map() {
  const [searchParams] = useSearchParams();

  // Map state
  const [baseLayer, setBaseLayer] = useState("satellite"); // "satellite" | "streets" | "dark"
  const [filter, setFilter] = useState("all"); // "all" | "hospital" | "shelter" | "fire" | "risks"
  const [riskCategoryFilter, setRiskCategoryFilter] = useState("all"); // "all" | "flood" | "cyclone" | "heavy_rain" | "landslide" | "soil_moisture" | "erosion"
  const [minRiskPercent, setMinRiskPercent] = useState(30);
  const [showSatelliteRadar, setShowSatelliteRadar] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [userLocation, setUserLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState([20.2961, 85.8245]); // Default Bhubaneswar
  const [mapZoom, setMapZoom] = useState(11);

  // In-app navigation state (No external Google Maps redirect)
  const [activeRouteTarget, setActiveRouteTarget] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Online / offline detector
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Check URL search parameters (e.g. ?lat=20.2312&lng=85.7765&name=Hospital)
  useEffect(() => {
    const paramLat = searchParams.get("lat");
    const paramLng = searchParams.get("lng");
    const paramName = searchParams.get("name");

    if (paramLat && paramLng) {
      const lat = parseFloat(paramLat);
      const lng = parseFloat(paramLng);
      if (!isNaN(lat) && !isNaN(lng)) {
        setMapCenter([lat, lng]);
        setMapZoom(14);
        setActiveRouteTarget({
          name: paramName || "Selected Destination",
          lat,
          lng,
          category: "Direct Map Location",
        });
      }
    }
  }, [searchParams]);

  // Request user GPS
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = [pos.coords.latitude, pos.coords.longitude];
        setUserLocation(coords);
        setMapCenter(coords);
        setMapZoom(13);
      },
      (err) => {
        alert(`Location access denied or unavailable: ${err.message}`);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Start in-app navigation
  const handleStartInAppNavigation = (target) => {
    setActiveRouteTarget(target);
    setMapCenter([target.lat, target.lng]);
    setMapZoom(13);

    // If user has not yet located themselves, ask for GPS
    if (!userLocation && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation([pos.coords.latitude, pos.coords.longitude]);
        },
        () => {},
        { enableHighAccuracy: true }
      );
    }
  };

  // Filter facilities
  const filteredFacilities = EMERGENCY_FACILITIES.filter((fac) => {
    const matchesType = filter === "all" || fac.type === filter;
    const matchesSearch =
      fac.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fac.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fac.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  // Filter satellite weather risk zones
  const filteredRiskZones = SATELLITE_WEATHER_RISK_ZONES.filter((zone) => {
    const matchesCat = riskCategoryFilter === "all" || zone.category === riskCategoryFilter;
    const matchesRisk = zone.riskPercent >= minRiskPercent;
    const matchesSearch =
      zone.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      zone.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      zone.advisory.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesRisk && matchesSearch;
  });

  // Distance & Bearing calculations for active route
  const routeDistance =
    userLocation && activeRouteTarget
      ? getDistanceKm(userLocation[0], userLocation[1], activeRouteTarget.lat, activeRouteTarget.lng)
      : null;

  const routeBearing =
    userLocation && activeRouteTarget
      ? getBearing(userLocation[0], userLocation[1], activeRouteTarget.lat, activeRouteTarget.lng)
      : null;

  const estimatedDriveMin = routeDistance ? Math.round((parseFloat(routeDistance) / 45) * 60) : null;
  const estimatedWalkMin = routeDistance ? Math.round((parseFloat(routeDistance) / 4.5) * 60) : null;

  return (
    <div style={{ color: "#fff", minHeight: "100vh", boxSizing: "border-box" }}>
      {/* ── Page Header ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px", marginBottom: "18px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <h1 style={{ margin: 0, fontSize: "1.65rem", fontWeight: "800", color: "#f8fafc", letterSpacing: "-0.01em" }}>
              🗺️ Disaster Response Map
            </h1>
            <span style={{ backgroundColor: "#2563eb", color: "#fff", fontSize: "0.75rem", padding: "3px 10px", borderRadius: "999px", fontWeight: "700" }}>
              Satellite Weather Detection
            </span>
            {isOnline ? (
              <span style={{ backgroundColor: "rgba(16, 185, 129, 0.2)", color: "#34d399", border: "1px solid #10b981", fontSize: "0.72rem", padding: "2px 8px", borderRadius: "10px", fontWeight: "700" }}>
                Live Radar Online
              </span>
            ) : (
              <span style={{ backgroundColor: "rgba(239, 68, 68, 0.2)", color: "#fca5a5", border: "1px solid #ef4444", fontSize: "0.72rem", padding: "2px 8px", borderRadius: "10px", fontWeight: "700" }}>
                Offline PWA Mode (In-App Map Only)
              </span>
            )}
          </div>
          <p style={{ margin: "6px 0 0 0", color: "#94a3b8", fontSize: "0.88rem", maxWidth: "840px" }}>
            High-precision emergency operations map highlighting ground & atmospheric risk areas by category (Landslide, Soil Moisture, Soil Erosion, Flood, Cyclone, Heavy Rain) with color-coded risk percentages and in-app navigation.
          </p>
        </div>

        {/* GPS Controls */}
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={handleLocateMe}
            style={{
              padding: "9px 15px",
              backgroundColor: "#16a34a",
              color: "#ffffff",
              border: "none",
              borderRadius: "10px",
              fontWeight: "700",
              fontSize: "0.84rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              boxShadow: "0 2px 10px rgba(22, 163, 74, 0.4)",
            }}
          >
            <Crosshair size={16} /> 📍 Locate My GPS
          </button>
        </div>
      </div>

      {/* ── Toolbar: Base Layer Switcher + Risk Category Filters + Weather Legend ── */}
      <div
        style={{
          backgroundColor: "#0f172a",
          border: "1px solid #334155",
          borderRadius: "14px",
          padding: "14px 16px",
          marginBottom: "16px",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        {/* Row 1: Search & Base Layer Switcher */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <input
            type="text"
            placeholder="🔍 Search hospital, cyclone shelter, flood basin, landslide slope, district..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              minWidth: "260px",
              padding: "9px 14px",
              borderRadius: "10px",
              border: "1px solid #334155",
              backgroundColor: "#1e293b",
              color: "#ffffff",
              fontSize: "0.88rem",
              outline: "none",
            }}
          />

          {/* Layer Selector */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px", backgroundColor: "#1e293b", padding: "4px", borderRadius: "10px" }}>
            <span style={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: "700", padding: "0 6px" }}>
              MAP VIEW:
            </span>
            {[
              { id: "satellite", label: "🛰️ Satellite Imagery" },
              { id: "streets", label: "🗺️ Street Map" },
              { id: "dark", label: "🌙 Dark Tactical" },
            ].map((lyr) => (
              <button
                key={lyr.id}
                type="button"
                onClick={() => setBaseLayer(lyr.id)}
                style={{
                  padding: "6px 12px",
                  borderRadius: "8px",
                  border: "none",
                  fontSize: "0.78rem",
                  fontWeight: "700",
                  cursor: "pointer",
                  backgroundColor: baseLayer === lyr.id ? "#2563eb" : "transparent",
                  color: baseLayer === lyr.id ? "#ffffff" : "#cbd5e1",
                  transition: "all 0.15s",
                }}
              >
                {lyr.label}
              </button>
            ))}
          </div>
        </div>

        {/* Row 2: Category Filter Pills (Google Weather style) */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <span style={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: "700" }}>
            WEATHER & HAZARD RISKS:
          </span>
          {[
            { id: "all", label: "All Hazards" },
            { id: "flood", label: "🌊 Flood", color: "#0284c7" },
            { id: "cyclone", label: "🌀 Cyclone", color: "#9333ea" },
            { id: "heavy_rain", label: "🌧️ Heavy Rain", color: "#4f46e5" },
            { id: "landslide", label: "⛰️ Landslide", color: "#dc2626" },
            { id: "soil_moisture", label: "🌱 Soil Moisture", color: "#059669" },
            { id: "erosion", label: "🏜️ Soil Erosion", color: "#d97706" },
          ].map((cat) => {
            const active = riskCategoryFilter === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setRiskCategoryFilter(cat.id)}
                style={{
                  padding: "5px 12px",
                  borderRadius: "20px",
                  border: active ? `1.5px solid ${cat.color || "#38bdf8"}` : "1px solid #334155",
                  backgroundColor: active ? (cat.color ? `${cat.color}28` : "#1e3a8a") : "#1e293b",
                  color: active ? (cat.color || "#60a5fa") : "#94a3b8",
                  fontSize: "0.78rem",
                  fontWeight: "700",
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                {cat.label}
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => {
              setRiskCategoryFilter("landslide");
              setMapCenter([26.2006, 92.9376]);
              setMapZoom(7);
            }}
            style={{
              padding: "5px 12px",
              borderRadius: "20px",
              border: "1.5px solid #ef4444",
              backgroundColor: "rgba(239, 68, 68, 0.25)",
              color: "#fca5a5",
              fontSize: "0.78rem",
              fontWeight: "700",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              boxShadow: "0 2px 8px rgba(239, 68, 68, 0.3)"
            }}
          >
            ⛰️ Focus NER Landslides
          </button>

          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: "700" }}>MIN RISK:</span>
            {[
              { val: 0, label: "All" },
              { val: 50, label: "&gt;50%" },
              { val: 75, label: "&gt;75% High" },
              { val: 85, label: "🚨 Critical Only" },
            ].map((th) => (
              <button
                key={th.val}
                type="button"
                onClick={() => setMinRiskPercent(th.val)}
                style={{
                  padding: "3px 8px",
                  borderRadius: "6px",
                  border: "none",
                  fontSize: "0.72rem",
                  fontWeight: "700",
                  cursor: "pointer",
                  backgroundColor: minRiskPercent === th.val ? "#ef4444" : "#1e293b",
                  color: minRiskPercent === th.val ? "#fff" : "#94a3b8",
                }}
              >
                {th.label}
              </button>
            ))}
          </div>
        </div>

        {/* Row 3: Facilities Filter Tabs */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", borderTop: "1px solid #1e293b", paddingTop: "8px" }}>
          <span style={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: "700" }}>EMERGENCY FACILITIES:</span>
          {[
            { id: "all", label: `All Facilities (${EMERGENCY_FACILITIES.length})` },
            { id: "hospital", label: "🏥 Hospitals (7)" },
            { id: "shelter", label: "⛺ Cyclone Shelters (5)" },
            { id: "fire", label: "🚒 Fire & ODRAF (2)" },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setFilter(cat.id)}
              style={{
                padding: "4px 10px",
                borderRadius: "6px",
                border: "none",
                fontWeight: "600",
                fontSize: "0.76rem",
                cursor: "pointer",
                backgroundColor: filter === cat.id ? "#334155" : "transparent",
                color: filter === cat.id ? "#38bdf8" : "#94a3b8",
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Map Container ── */}
      <div
        style={{
          position: "relative",
          borderRadius: "16px",
          overflow: "hidden",
          border: "1px solid #334155",
          boxShadow: "0 10px 30px rgba(0,0,0,0.6)",
          marginBottom: "20px",
        }}
      >
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          scrollWheelZoom={true}
          style={{ height: "620px", width: "100%" }}
        >
          <MapController center={mapCenter} zoom={mapZoom} />

          {/* BASE TILE LAYERS */}
          {baseLayer === "satellite" && (
            <TileLayer
              attribution="Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              maxZoom={19}
            />
          )}

          {baseLayer === "streets" && (
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              maxZoom={19}
            />
          )}

          {baseLayer === "dark" && (
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              maxZoom={19}
            />
          )}

          {/* User Location Marker */}
          {userLocation && (
            <>
              <Marker
                position={userLocation}
                icon={createCustomIcon("#10b981", "👤")}
              >
                <Popup>
                  <div style={{ color: "#0f172a", textAlign: "center" }}>
                    <strong>📍 Your Current Location</strong>
                    <div style={{ fontSize: "0.8rem", color: "#64748b" }}>
                      GPS: {userLocation[0].toFixed(4)}, {userLocation[1].toFixed(4)}
                    </div>
                  </div>
                </Popup>
              </Marker>
              <Circle
                center={userLocation}
                radius={2500}
                pathOptions={{ color: "#10b981", fillColor: "#10b981", fillOpacity: 0.12 }}
              />
            </>
          )}

          {/* IN-APP EVACUATION ROUTE LINE (NO REDIRECT TO GOOGLE MAPS) */}
          {userLocation && activeRouteTarget && (
            <>
              <Polyline
                positions={[
                  userLocation,
                  [activeRouteTarget.lat, activeRouteTarget.lng],
                ]}
                pathOptions={{
                  color: "#38bdf8",
                  weight: 4,
                  dashArray: "10, 10",
                }}
              />
            </>
          )}

          {/* SATELLITE WEATHER DETECTION RISK ZONES (Circles + Badges with colors & %) */}
          {filteredRiskZones.map((zone) => (
            <React.Fragment key={zone.id}>
              {/* Highlight Area Circle */}
              <Circle
                center={[zone.lat, zone.lng]}
                radius={zone.radius}
                pathOptions={{
                  color: zone.color,
                  fillColor: zone.color,
                  fillOpacity: zone.riskPercent > 80 ? 0.45 : 0.32,
                  weight: zone.riskPercent > 80 ? 3 : 2,
                }}
              />

              {/* Marker Badge with Risk % */}
              <Marker
                position={[zone.lat, zone.lng]}
                icon={createRiskBadgeIcon(zone.riskPercent, zone.color)}
              >
                <Popup>
                  <div style={{ color: "#0f172a", maxWidth: "300px", padding: "2px", lineHeight: "1.4" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                      <span style={{ fontSize: "0.8rem", fontWeight: "800", color: zone.color, textTransform: "uppercase" }}>
                        {zone.categoryLabel}
                      </span>
                      <span
                        style={{
                          backgroundColor: zone.color,
                          color: "#fff",
                          fontSize: "0.72rem",
                          fontWeight: "800",
                          padding: "2px 7px",
                          borderRadius: "10px",
                        }}
                      >
                        {zone.riskPercent}% Risk
                      </span>
                    </div>

                    <strong style={{ fontSize: "0.95rem", color: "#0f172a", display: "block", marginBottom: "4px" }}>
                      {zone.name}
                    </strong>

                    <p style={{ fontSize: "0.78rem", color: "#475569", margin: "4px 0 8px 0" }}>
                      {zone.advisory}
                    </p>

                    {/* Sensor Telemetry Box */}
                    <div
                      style={{
                        backgroundColor: "#f1f5f9",
                        padding: "8px",
                        borderRadius: "8px",
                        fontSize: "0.75rem",
                        color: "#334155",
                        marginBottom: "10px",
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "4px",
                      }}
                    >
                      {Object.entries(zone.weather).map(([k, v]) => (
                        <div key={k}>
                          <span style={{ textTransform: "capitalize", color: "#64748b" }}>{k}: </span>
                          <strong>{v}</strong>
                        </div>
                      ))}
                    </div>

                    <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", padding: "6px 8px", borderRadius: "6px", fontSize: "0.75rem", color: "#b91c1c", marginBottom: "10px" }}>
                      <strong>🚨 Action:</strong> {zone.action}
                    </div>

                    {/* IN-APP ROUTING ACTION */}
                    <button
                      type="button"
                      onClick={() => handleStartInAppNavigation(zone)}
                      style={{
                        width: "100%",
                        padding: "8px",
                        backgroundColor: "#2563eb",
                        color: "#fff",
                        border: "none",
                        borderRadius: "6px",
                        fontWeight: "700",
                        fontSize: "0.8rem",
                        cursor: "pointer",
                      }}
                    >
                      📍 Navigate to Safe Perimeter Inside App
                    </button>
                  </div>
                </Popup>
              </Marker>
            </React.Fragment>
          ))}

          {/* EMERGENCY FACILITIES MARKERS */}
          {filteredFacilities.map((facility) => {
            const facIcon =
              facility.type === "hospital"
                ? hospitalIcon
                : facility.type === "shelter"
                ? shelterIcon
                : fireIcon;

            return (
              <Marker
                key={facility.id}
                position={[facility.lat, facility.lng]}
                icon={facIcon}
              >
                <Popup>
                  <div style={{ color: "#0f172a", maxWidth: "290px", padding: "2px", lineHeight: "1.4" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                      <span style={{ fontSize: "1.1rem" }}>
                        {facility.type === "hospital" ? "🏥" : facility.type === "shelter" ? "⛺" : "🚒"}
                      </span>
                      <strong style={{ fontSize: "0.95rem", color: "#0f172a" }}>{facility.name}</strong>
                    </div>

                    <div style={{ fontSize: "0.75rem", color: "#1d4ed8", fontWeight: "700", marginBottom: "4px" }}>
                      {facility.category} • <span style={{ color: "#16a34a" }}>{facility.status}</span>
                    </div>

                    <div style={{ fontSize: "0.78rem", color: "#475569", marginBottom: "4px" }}>
                      📍 {facility.address}
                    </div>

                    <div style={{ fontSize: "0.78rem", color: "#334155", marginBottom: "6px" }}>
                      👥 <strong>Capacity:</strong> {facility.capacity}
                    </div>

                    <div style={{ fontSize: "0.8rem", color: "#b91c1c", fontWeight: "700", marginBottom: "10px" }}>
                      📞 <strong>Helpline:</strong>{" "}
                      <a href={`tel:${facility.emergencyPhone.replace(/[^0-9]/g, "")}`} style={{ color: "#dc2626", textDecoration: "underline" }}>
                        {facility.emergencyPhone}
                      </a>
                    </div>

                    {/* IN-APP NAVIGATION (PRIMARY - NO EXTERNAL REDIRECT) */}
                    <button
                      type="button"
                      onClick={() => handleStartInAppNavigation(facility)}
                      style={{
                        width: "100%",
                        padding: "8px 10px",
                        backgroundColor: "#16a34a",
                        color: "#ffffff",
                        border: "none",
                        borderRadius: "6px",
                        fontSize: "0.82rem",
                        fontWeight: "700",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                        marginBottom: "6px",
                      }}
                    >
                      <Navigation size={14} /> Navigate on Live Disaster Map (In-App)
                    </button>

                    {/* Only if online, provide external google maps as secondary optional link */}
                    {isOnline ? (
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${facility.lat},${facility.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: "block",
                          textAlign: "center",
                          fontSize: "0.72rem",
                          color: "#64748b",
                          textDecoration: "underline",
                          padding: "2px",
                        }}
                      >
                        External Google Maps Link (Online Optional)
                      </a>
                    ) : (
                      <div style={{ fontSize: "0.7rem", color: "#94a3b8", textAlign: "center", fontStyle: "italic" }}>
                        Offline PWA Mode: In-app routing active
                      </div>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>

        {/* ── FLOATING IN-MAP ROUTE HUD (WHEN A DESTINATION IS SELECTED) ── */}
        {activeRouteTarget && (
          <div
            style={{
              position: "absolute",
              bottom: "20px",
              left: "20px",
              zIndex: 1000,
              backgroundColor: "rgba(15, 23, 42, 0.94)",
              border: "1.5px solid #38bdf8",
              borderRadius: "14px",
              padding: "16px 20px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.6)",
              color: "#fff",
              maxWidth: "380px",
              backdropFilter: "blur(8px)",
              animation: "slideIn 0.2s ease-out",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", marginBottom: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Navigation size={18} color="#38bdf8" />
                <strong style={{ fontSize: "0.95rem", color: "#f8fafc" }}>
                  In-App Disaster Route HUD
                </strong>
              </div>
              <button
                type="button"
                onClick={() => setActiveRouteTarget(null)}
                style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", padding: "2px" }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ fontSize: "0.85rem", color: "#38bdf8", fontWeight: "700", marginBottom: "4px" }}>
              🎯 {activeRouteTarget.name}
            </div>

            {userLocation ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "8px", fontSize: "0.82rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", color: "#cbd5e1" }}>
                  <span>Direct GPS Distance:</span>
                  <strong style={{ color: "#34d399", fontSize: "0.92rem" }}>{routeDistance} km</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", color: "#cbd5e1" }}>
                  <span>Compass Bearing:</span>
                  <strong>{routeBearing} Heading</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", color: "#cbd5e1" }}>
                  <span>Est. Evacuation Transit:</span>
                  <strong>~{estimatedDriveMin} min drive / ~{estimatedWalkMin} min walk</strong>
                </div>
                <div style={{ fontSize: "0.72rem", color: "#94a3b8", marginTop: "4px", backgroundColor: "#1e293b", padding: "6px 8px", borderRadius: "6px" }}>
                  ℹ️ Dashed cyan line on the map indicates direct bearing to destination. No external redirect required.
                </div>
              </div>
            ) : (
              <div style={{ fontSize: "0.8rem", color: "#fca5a5", marginTop: "8px" }}>
                GPS position pending. Click "Locate My GPS" at top right to calculate distance and bearing.
              </div>
            )}
          </div>
        )}

        {/* ── GOOGLE WEATHER MAP STYLE COLOR SCALE LEGEND ── */}
        <div
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            zIndex: 1000,
            backgroundColor: "rgba(15, 23, 42, 0.9)",
            border: "1px solid #334155",
            borderRadius: "12px",
            padding: "12px 14px",
            boxShadow: "0 6px 20px rgba(0,0,0,0.5)",
            backdropFilter: "blur(6px)",
            fontSize: "0.75rem",
            maxWidth: "220px",
          }}
        >
          <div style={{ fontWeight: "800", color: "#f1f5f9", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
            <CloudRain size={14} color="#38bdf8" /> Weather Risk Scale
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ width: "12px", height: "12px", borderRadius: "3px", backgroundColor: "#dc2626" }} />
              <span style={{ color: "#f87171", fontWeight: "700" }}>80% - 100% Severe Alert</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ width: "12px", height: "12px", borderRadius: "3px", backgroundColor: "#ea580c" }} />
              <span style={{ color: "#fb923c", fontWeight: "700" }}>60% - 79% High Hazard</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ width: "12px", height: "12px", borderRadius: "3px", backgroundColor: "#eab308" }} />
              <span style={{ color: "#fde047", fontWeight: "700" }}>40% - 59% Moderate Risk</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ width: "12px", height: "12px", borderRadius: "3px", backgroundColor: "#10b981" }} />
              <span style={{ color: "#34d399", fontWeight: "700" }}>0% - 39% Low / Monitored</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom Section: Active Satellite Hazards Directory ── */}
      <div style={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: "16px", padding: "20px" }}>
        <h2 style={{ fontSize: "1.15rem", fontWeight: "700", color: "#f8fafc", margin: "0 0 14px 0", display: "flex", alignItems: "center", gap: "8px" }}>
          📡 Satellite Weather & Ground Hazard Telemetry ({filteredRiskZones.length} Sectors Detected)
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "14px" }}>
          {filteredRiskZones.map((zone) => (
            <div
              key={zone.id}
              style={{
                backgroundColor: "#1e293b",
                borderRadius: "12px",
                border: `1.5px solid ${zone.color}44`,
                padding: "16px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: "10px",
                transition: "transform 0.15s, border-color 0.15s",
              }}
            >
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                  <span style={{ fontSize: "0.78rem", fontWeight: "800", color: zone.color, textTransform: "uppercase" }}>
                    {zone.categoryLabel}
                  </span>
                  <span
                    style={{
                      backgroundColor: `${zone.color}22`,
                      color: zone.color,
                      border: `1px solid ${zone.color}`,
                      fontSize: "0.72rem",
                      fontWeight: "800",
                      padding: "2px 8px",
                      borderRadius: "12px",
                    }}
                  >
                    {zone.riskPercent}% RISK
                  </span>
                </div>

                <div style={{ fontWeight: "700", fontSize: "0.92rem", color: "#f8fafc", marginBottom: "4px" }}>
                  {zone.name}
                </div>

                <div style={{ fontSize: "0.78rem", color: "#94a3b8", lineHeight: "1.4" }}>
                  {zone.advisory}
                </div>
              </div>

              <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                <button
                  type="button"
                  onClick={() => handleStartInAppNavigation(zone)}
                  style={{
                    flex: 1,
                    padding: "8px",
                    backgroundColor: "#2563eb",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: "700",
                    fontSize: "0.8rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                  }}
                >
                  <Crosshair size={14} /> Focus on Map
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}