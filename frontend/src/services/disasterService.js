// ─────────────────────────────────────────────────────────────────────────────
// src/services/disasterService.js
// Centralized Service for Rescue Centers, Family Safety, & Evacuation Planning
// Supports both Backend API endpoints and offline resilient caching
// ─────────────────────────────────────────────────────────────────────────────

import { auth } from "../firebase";

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/+$/, "");

// ─── Realistic Pre-Configured Emergency Shelters & Rescue Centers ───────────
export const DEFAULT_SHELTERS = [
  {
    id: "shelter-1",
    _id: "shelter-1",
    name: "Bhubaneswar Central Multi-Purpose Cyclone Shelter",
    address: "Patia Kanungo Complex, Near KIIT Square",
    city: "Bhubaneswar",
    state: "Odisha",
    lat: 20.3522,
    lng: 85.8193,
    location: { coordinates: [85.8193, 20.3522] },
    capacity: 650,
    currentOccupancy: 180,
    contactNumber: "0674-2540200",
    phone: "0674-2540200",
    facilities: ["Drinking Water", "Medical Station", "Emergency Power", "Food Kitchen", "Sanitation", "Wheelchair Accessible"],
    accessibility: true,
    status: "open",
    type: "Cyclone Shelter",
  },
  {
    id: "shelter-2",
    _id: "shelter-2",
    name: "Cuttack Mahanadi Flood Relief Center",
    address: "Near Barabati Stadium, Cantonment Road",
    city: "Cuttack",
    state: "Odisha",
    lat: 20.4789,
    lng: 85.8647,
    location: { coordinates: [85.8647, 20.4789] },
    capacity: 500,
    currentOccupancy: 320,
    contactNumber: "0671-2301100",
    phone: "0671-2301100",
    facilities: ["Food Rations", "Purified Water", "First Aid", "Power Generator", "Blankets"],
    accessibility: true,
    status: "open",
    type: "Flood Relief Center",
  },
  {
    id: "shelter-3",
    _id: "shelter-3",
    name: "Puri Coastal High-Capacity Cyclone Shelter",
    address: "VIP Road, Near Marine Drive Beach",
    city: "Puri",
    state: "Odisha",
    lat: 19.8135,
    lng: 85.8312,
    location: { coordinates: [85.8312, 19.8135] },
    capacity: 900,
    currentOccupancy: 410,
    contactNumber: "06752-223400",
    phone: "06752-223400",
    facilities: ["Reinforced Storm Shield", "Emergency Water Plant", "Ambulance Station", "Maternity Care", "Solar Power"],
    accessibility: true,
    status: "open",
    type: "Cyclone Shelter",
  },
  {
    id: "shelter-4",
    _id: "shelter-4",
    name: "Balasore Disaster Relief & Evacuation Camp",
    address: "Near ITI Ground, Station Road",
    city: "Balasore",
    state: "Odisha",
    lat: 21.4934,
    lng: 86.9324,
    location: { coordinates: [86.9324, 21.4934] },
    capacity: 450,
    currentOccupancy: 110,
    contactNumber: "06782-262100",
    phone: "06782-262100",
    facilities: ["Hot Meals", "Medical Camp", "Rescue Boats", "Emergency Radio"],
    accessibility: true,
    status: "open",
    type: "Relief Camp",
  },
  {
    id: "shelter-5",
    _id: "shelter-5",
    name: "Kendrapara Coastal Cyclone & Flood Safe Haven",
    address: "Rajnagar Block, Near Bhitarkanika Entry",
    city: "Kendrapara",
    state: "Odisha",
    lat: 20.5010,
    lng: 86.4230,
    location: { coordinates: [86.4230, 20.5010] },
    capacity: 400,
    currentOccupancy: 85,
    contactNumber: "06727-220050",
    phone: "06727-220050",
    facilities: ["High-Elevation Plinth", "Clean Water Storage", "First Aid", "Wireless Ham Radio"],
    accessibility: true,
    status: "open",
    type: "Cyclone Shelter",
  },
  {
    id: "shelter-6",
    _id: "shelter-6",
    name: "Berhampur Ganjam Emergency Shelter Hub",
    address: "Engineering School Road, Ambapua",
    city: "Berhampur",
    state: "Odisha",
    lat: 19.3150,
    lng: 84.7941,
    location: { coordinates: [84.7941, 19.3150] },
    capacity: 550,
    currentOccupancy: 210,
    contactNumber: "0680-2220300",
    phone: "0680-2220300",
    facilities: ["Medical Supplies", "Community Kitchen", "Baby Care Pods", "Power Generator"],
    accessibility: true,
    status: "open",
    type: "Emergency Shelter",
  },
  {
    id: "shelter-7",
    _id: "shelter-7",
    name: "Khurda District Community Relief Shelter",
    address: "Collectorate Road, Khurda Town",
    city: "Khurda",
    state: "Odisha",
    lat: 20.1809,
    lng: 85.6256,
    location: { coordinates: [85.6256, 20.1809] },
    capacity: 350,
    currentOccupancy: 95,
    contactNumber: "06755-220400",
    phone: "06755-220400",
    facilities: ["Drinking Water", "Bedding & Blankets", "Medical Kit", "Food Packets"],
    accessibility: true,
    status: "open",
    type: "Community Shelter",
  },
  {
    id: "shelter-8",
    _id: "shelter-8",
    name: "Paradip Port Emergency Cyclone Refuge",
    address: "Near Badapadia, Jagatsinghpur",
    city: "Paradip",
    state: "Odisha",
    lat: 20.3164,
    lng: 86.6111,
    location: { coordinates: [86.6111, 20.3164] },
    capacity: 800,
    currentOccupancy: 390,
    contactNumber: "06722-222150",
    phone: "06722-222150",
    facilities: ["Storm Surge Protection", "Heavy Duty Generator", "Medical Tents", "Drinking Water Reservoir"],
    accessibility: true,
    status: "open",
    type: "Cyclone Refuge",
  }
];

// Helper: Haversine distance in km
export function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
}

// Helper: Retrieve JWT or Firebase token
export async function getAuthHeader() {
  try {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (token) {
      return { Authorization: `Bearer ${token}` };
    }
    if (auth?.currentUser) {
      const fbToken = await auth.currentUser.getIdToken(false);
      if (fbToken) return { Authorization: `Bearer ${fbToken}` };
    }
  } catch {}
  return {};
}

// ─── RESCUE CENTERS / SHELTERS ───────────────────────────────────────────────
export async function fetchShelters(userCoords = null) {
  let list = [];
  try {
    const res = await fetch(`${API_URL}/api/shelters`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.data) && data.data.length > 0) {
        list = data.data.map((s) => ({
          ...s,
          id: s._id || s.id,
          lat: s.location?.coordinates?.[1] || s.lat,
          lng: s.location?.coordinates?.[0] || s.lng,
          phone: s.contactNumber || s.phone || "112",
        }));
      }
    }
  } catch {
    // Backend unreachable, fallback to pre-seeded centers
  }

  if (list.length === 0) {
    list = [...DEFAULT_SHELTERS];
  }

  // Calculate distances if user coordinates provided
  if (userCoords && userCoords.lat && userCoords.lng) {
    list = list.map((s) => {
      const distance = calculateDistanceKm(userCoords.lat, userCoords.lng, s.lat, s.lng);
      return {
        ...s,
        distanceKm: distance,
        distanceStr: distance !== null ? `${distance} km` : "N/A",
      };
    });
    list.sort((a, b) => (a.distanceKm ?? 999) - (b.distanceKm ?? 999));
  } else {
    list = list.map((s) => ({
      ...s,
      distanceStr: s.distanceStr || "Location needed",
    }));
  }

  return list;
}

// ─── FAMILY SAFETY ───────────────────────────────────────────────────────────
const LOCAL_FAMILY_KEY = "family_safety_members_v2";

const INITIAL_FALLBACK_MEMBERS = [
  {
    id: "mem-1",
    _id: "mem-1",
    name: "Prafulla Kumar Behera",
    relation: "Father",
    phone: "9861012345",
    bloodGroup: "O+",
    status: "Safe",
    isSafe: true,
    location: "Patia, Bhubaneswar",
    coordinates: "20.3522, 85.8193",
    lastUpdated: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  },
  {
    id: "mem-2",
    _id: "mem-2",
    name: "Santilata Behera",
    relation: "Mother",
    phone: "9437098765",
    bloodGroup: "B+",
    status: "Safe",
    isSafe: true,
    location: "Patia, Bhubaneswar",
    coordinates: "20.3522, 85.8193",
    lastUpdated: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  },
];

export async function getFamilyMembers() {
  // 1. Read local storage first
  let localMembers = [];
  try {
    const raw = localStorage.getItem(LOCAL_FAMILY_KEY);
    if (raw) {
      localMembers = JSON.parse(raw);
    }
  } catch {}

  // 2. Try fetching from Backend if user is logged in
  try {
    const headers = await getAuthHeader();
    if (headers.Authorization) {
      const res = await fetch(`${API_URL}/api/family`, { headers });
      if (res.ok) {
        const json = await res.json();
        const apiMembers = json.data?.members;
        if (Array.isArray(apiMembers) && apiMembers.length > 0) {
          const mapped = apiMembers.map((m) => ({
            id: m._id,
            _id: m._id,
            name: m.name,
            relation: m.relation || "Family",
            phone: m.phone || "",
            bloodGroup: m.bloodGroup || "",
            status: m.isSafe ? "Safe" : "Needs Help",
            isSafe: Boolean(m.isSafe),
            location: m.location?.address || "Registered Address",
            coordinates:
              m.location?.latitude && m.location?.longitude
                ? `${m.location.latitude}, ${m.location.longitude}`
                : "",
            lastUpdated: new Date(m.updatedAt || Date.now()).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          }));
          localStorage.setItem(LOCAL_FAMILY_KEY, JSON.stringify(mapped));
          return mapped;
        }
      }
    }
  } catch {}

  if (localMembers.length === 0) {
    localMembers = INITIAL_FALLBACK_MEMBERS;
    localStorage.setItem(LOCAL_FAMILY_KEY, JSON.stringify(localMembers));
  }

  return localMembers;
}

export async function addFamilyMember(memberData) {
  const newMember = {
    id: `mem-${Date.now()}`,
    name: memberData.name.trim(),
    relation: memberData.relation || "Family",
    phone: memberData.phone || "",
    bloodGroup: memberData.bloodGroup || "",
    status: memberData.status || "Safe",
    isSafe: memberData.status === "Safe",
    location: memberData.location || "Current Location",
    coordinates: memberData.coordinates || "",
    lastUpdated: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  };

  // 1. Update local storage
  const existing = await getFamilyMembers();
  const updated = [newMember, ...existing];
  localStorage.setItem(LOCAL_FAMILY_KEY, JSON.stringify(updated));

  // 2. Sync with Backend
  try {
    const headers = await getAuthHeader();
    if (headers.Authorization) {
      let lat = undefined;
      let lng = undefined;
      if (newMember.coordinates && newMember.coordinates.includes(",")) {
        const parts = newMember.coordinates.split(",");
        lat = parseFloat(parts[0]);
        lng = parseFloat(parts[1]);
      }
      await fetch(`${API_URL}/api/family/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...headers },
        body: JSON.stringify({
          name: newMember.name,
          relation: newMember.relation,
          phone: newMember.phone,
          bloodGroup: newMember.bloodGroup,
          isSafe: newMember.isSafe,
          location: {
            address: newMember.location,
            latitude: isNaN(lat) ? undefined : lat,
            longitude: isNaN(lng) ? undefined : lng,
          },
        }),
      });
    }
  } catch {}

  return updated;
}

export async function toggleMemberSafety(memberId, newStatus) {
  const existing = await getFamilyMembers();
  const isSafe = newStatus === "Safe";
  const updated = existing.map((m) =>
    (m.id === memberId || m._id === memberId)
      ? {
          ...m,
          status: newStatus,
          isSafe,
          lastUpdated: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        }
      : m
  );
  localStorage.setItem(LOCAL_FAMILY_KEY, JSON.stringify(updated));

  // Sync to Backend
  try {
    const headers = await getAuthHeader();
    if (headers.Authorization && !String(memberId).startsWith("mem-")) {
      await fetch(`${API_URL}/api/family/members/${memberId}/safety`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...headers },
        body: JSON.stringify({ isSafe }),
      });
    }
  } catch {}

  return updated;
}

export async function removeFamilyMember(memberId) {
  const existing = await getFamilyMembers();
  const updated = existing.filter((m) => m.id !== memberId && m._id !== memberId);
  localStorage.setItem(LOCAL_FAMILY_KEY, JSON.stringify(updated));

  // Sync to Backend
  try {
    const headers = await getAuthHeader();
    if (headers.Authorization && !String(memberId).startsWith("mem-")) {
      await fetch(`${API_URL}/api/family/members/${memberId}`, {
        method: "DELETE",
        headers,
      });
    }
  } catch {}

  return updated;
}

// ─── EVACUATION PLANNER ──────────────────────────────────────────────────────
export async function createEvacuationPlan({
  currentLocation,
  disasterType = "Flood",
  transportMode = "driving",
}) {
  // 1. Try Backend API
  try {
    const headers = await getAuthHeader();
    const res = await fetch(`${API_URL}/api/evacuation/plan`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify({
        currentLocation,
        disasterType,
        transportMode,
      }),
    });

    if (res.ok) {
      const json = await res.json();
      if (json.data) {
        return json.data;
      }
    }
  } catch {}

  // 2. Client-side Offline Fallback Plan Generator
  let userLat = 20.2961;
  let userLng = 85.8245;

  if (typeof currentLocation === "string" && currentLocation.includes(",")) {
    const parts = currentLocation.split(",").map((p) => parseFloat(p.trim()));
    if (!isNaN(parts[0]) && !isNaN(parts[1])) {
      userLat = parts[0];
      userLng = parts[1];
    }
  }

  // Find nearest shelter
  const sheltersWithDist = DEFAULT_SHELTERS.map((s) => ({
    ...s,
    distanceKm: calculateDistanceKm(userLat, userLng, s.lat, s.lng) || 4.2,
  })).sort((a, b) => a.distanceKm - b.distanceKm);

  const nearest = sheltersWithDist[0];
  const distKm = nearest.distanceKm || 3.5;
  const walkMinutes = Math.round((distKm / 4.5) * 60);
  const driveMinutes = Math.max(4, Math.round((distKm / 25) * 60));

  const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${userLat},${userLng}&destination=${nearest.lat},${nearest.lng}&travelmode=${transportMode === "walking" ? "walking" : "driving"}`;

  return {
    disasterType,
    startLocation: currentLocation,
    destination: {
      id: nearest.id,
      name: nearest.name,
      address: nearest.address,
      city: nearest.city,
      contactNumber: nearest.contactNumber,
      capacity: nearest.capacity,
      currentOccupancy: nearest.currentOccupancy,
      availableSpots: nearest.capacity - nearest.currentOccupancy,
      latitude: nearest.lat,
      longitude: nearest.lng,
      distanceKm: distKm,
    },
    alternateShelters: sheltersWithDist.slice(1, 4).map((s) => ({
      id: s.id,
      name: s.name,
      address: s.address,
      contactNumber: s.contactNumber,
      distanceKm: s.distanceKm,
      latitude: s.lat,
      longitude: s.lng,
    })),
    estimatedTime: {
      drivingMinutes: driveMinutes,
      walkingMinutes: walkMinutes,
      distanceKm: distKm,
    },
    mapsUrl,
    hazardWarning:
      disasterType === "Flood"
        ? "Rapid inundation and flash currents. Avoid culverts, submerged bridges, and low floodplains."
        : disasterType === "Cyclone"
        ? "Destructive wind gusts and flying debris. Relocate to reinforced pucca shelter before landfall."
        : "Severe structural hazards and aftershocks. Stay in wide open grounds away from towers.",
    routePriority:
      disasterType === "Flood"
        ? "Move immediately towards high elevation ground. Do NOT drive or walk through flood waters."
        : "Move along main arterial roadways directly into designated shelter corridors.",
    evacuationPhases: [
      {
        phase: 1,
        title: "Immediate Readiness (0 - 10 min)",
        actions: [
          "Pack Grab-and-Go Survival Bag with 3-day water, dry food, and power bank",
          "Switch off main power MCB and household gas cylinder valves",
          "Secure waterproof pouch containing family Aadhaar / ID documents and prescriptions",
        ],
      },
      {
        phase: 2,
        title: "En-Route Movement & Avoidance",
        actions: [
          `Proceed along safe corridor towards ${nearest.name}`,
          "Keep car windows closed and headlights on in storm conditions",
          "Tune in to local All India Radio emergency updates on phone",
        ],
      },
      {
        phase: 3,
        title: "Shelter Arrival & Check-In",
        actions: [
          `Report to registration desk at ${nearest.name}`,
          "Submit family count and register for relief rations and medical triage",
          "Mark 'Safe' in Family Safety Tracker to notify relatives",
        ],
      },
    ],
    checklist: [
      "Drinking water (3L per person)",
      "Flashlight with spare batteries",
      "First-aid bandages, antiseptic, and essential medicines",
      "Power bank and emergency whistle",
      "Waterproof bag with IDs, cash, and documents",
    ],
    emergencyHotlines: [
      { name: "National Emergency Helpline", number: "112" },
      { name: "Medical & Ambulance", number: "108" },
      { name: "State Disaster Authority (SDMA)", number: "1070" },
      { name: "District Disaster Control Room", number: "1077" },
    ],
    generatedAt: new Date().toISOString(),
  };
}
