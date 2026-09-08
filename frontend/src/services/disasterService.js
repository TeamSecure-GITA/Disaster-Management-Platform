// ─────────────────────────────────────────────────────────────────────────────
// src/services/disasterService.js
// Centralized Service for Rescue Centers, Family Safety, & Evacuation Planning
// Supports both Backend API endpoints and offline resilient caching
// ─────────────────────────────────────────────────────────────────────────────

import { auth, db } from "../firebase";
import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  onSnapshot,
} from "firebase/firestore";

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

// ─── ACTIVE DISASTER HAZARD & DANGER ZONES ──────────────────────────────────
export const ACTIVE_DANGER_ZONES = [
  {
    id: "danger-flood-bhubaneswar",
    name: "Bhubaneswar Urban Cloudburst & Inundation Zone",
    type: "Flash Flood",
    category: "flood",
    severity: "High",
    lat: 20.3522,
    lng: 85.8193, // Patia / KIIT area
    radiusKm: 6.0,
    description: "Doppler radar cloudburst warning. Severe inundation across low-lying roads and societies.",
    advisory: "Evacuate low ground immediately. Seek refuge at Bhubaneswar Central Cyclone Shelter.",
  },
  {
    id: "danger-flood-cuttack",
    name: "Mahanadi River Delta Inundation Corridor",
    type: "Riverine Flood",
    category: "flood",
    severity: "Critical",
    lat: 20.485,
    lng: 85.852,
    radiusKm: 8.0,
    description: "River discharge crossing danger level +1.6m. Embankment overtopping active.",
    advisory: "Immediate evacuation ordered. High risk of waterlogging and rapid currents.",
  },
  {
    id: "danger-cyclone-coastal",
    name: "Bay of Bengal Coastal Cyclone Front (Puri)",
    type: "Severe Cyclone",
    category: "cyclone",
    severity: "Critical",
    lat: 19.820,
    lng: 85.920,
    radiusKm: 15.0,
    description: "Category 4 storm surge with 135 km/h sustained gusts and 3.2m sea tidal ingress.",
    advisory: "Relocate immediately inland to wind-resistant multi-purpose shelters.",
  },
  {
    id: "danger-landslide-daringbadi",
    name: "Daringbadi Ridge Mudslide Danger Zone",
    type: "Landslide",
    category: "landslide",
    severity: "High",
    lat: 19.900,
    lng: 84.130,
    radiusKm: 6.5,
    description: "Continuous mountain rainfall triggered active slope failure and highway rockfalls.",
    advisory: "Avoid mountain ghat paths; evacuate hillside dwellings immediately.",
  },
];

// Helper: Parse latitude and longitude from coordinate string or address
export function parseMemberCoordinates(member) {
  if (!member) return null;
  if (typeof member.coordinates === "string" && member.coordinates.includes(",")) {
    const parts = member.coordinates.split(",");
    const lat = parseFloat(parts[0].trim());
    const lng = parseFloat(parts[1].trim());
    if (!isNaN(lat) && !isNaN(lng)) return { lat, lng };
  }
  if (member.lat && member.lng) {
    const lat = parseFloat(member.lat);
    const lng = parseFloat(member.lng);
    if (!isNaN(lat) && !isNaN(lng)) return { lat, lng };
  }
  // Address matching fallback for standard regions
  const loc = (member.location || "").toLowerCase();
  if (loc.includes("patia") || loc.includes("bhubaneswar") || loc.includes("kiit")) {
    return { lat: 20.3522, lng: 85.8193 };
  }
  if (loc.includes("cuttack") || loc.includes("barabati") || loc.includes("mahanadi")) {
    return { lat: 20.4789, lng: 85.8647 };
  }
  if (loc.includes("puri")) {
    return { lat: 19.8135, lng: 85.8312 };
  }
  if (loc.includes("balasore")) {
    return { lat: 21.4934, lng: 86.9324 };
  }
  return null;
}

// Check if a family member is located inside an active disaster danger zone
export function checkMemberInDangerZone(member, dangerZones = ACTIVE_DANGER_ZONES) {
  const coords = parseMemberCoordinates(member);
  if (!coords) {
    return { inDanger: false, memberCoords: null, dangerZone: null };
  }

  for (const zone of dangerZones) {
    if (zone.active === false) continue;
    const distanceKm = calculateDistanceKm(coords.lat, coords.lng, zone.lat, zone.lng);
    if (distanceKm !== null && distanceKm <= (zone.radiusKm || 5.0)) {
      return {
        inDanger: true,
        memberCoords: coords,
        dangerZone: zone,
        distanceToEpicenterKm: distanceKm,
      };
    }
  }

  return { inDanger: false, memberCoords: coords, dangerZone: null };
}

// Find the closest safe shelter to a family member (preferably outside the disaster perimeter)
export function findNearestSafeShelter(memberCoords, shelters = DEFAULT_SHELTERS, activeDangerZone = null) {
  if (!memberCoords || memberCoords.lat == null || memberCoords.lng == null) return null;

  const candidates = shelters.map((s) => {
    const distToMember = calculateDistanceKm(memberCoords.lat, memberCoords.lng, s.lat, s.lng);
    let isInsideHazard = false;
    if (activeDangerZone) {
      const distToHazard = calculateDistanceKm(s.lat, s.lng, activeDangerZone.lat, activeDangerZone.lng);
      isInsideHazard = distToHazard != null && distToHazard <= (activeDangerZone.radiusKm || 5.0);
    }
    return {
      ...s,
      distToMember: distToMember !== null ? distToMember : 9999,
      isInsideHazard,
    };
  });

  // Prefer shelters outside the active danger zone; if none available, take closest shelter
  const safeRefuges = candidates.filter((s) => !s.isInsideHazard);
  const pool = safeRefuges.length > 0 ? safeRefuges : candidates;
  pool.sort((a, b) => a.distToMember - b.distToMember);

  return pool[0] || null;
}

// ─── FAMILY SAFETY ───────────────────────────────────────────────────────────
const LOCAL_FAMILY_KEY = "family_safety_members_v2";
// Tracks whether we have already seeded fallback members at least once.
// Once set, an empty list means the user deleted all members intentionally.
const FAMILY_INITIALIZED_KEY = "family_safety_initialized_v2";

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

// ─── Real-Time Permanent Cloud Sync for Family Safety Network ─────────────────
const FIRESTORE_FAMILY_COLLECTION = "shared_family_safety";

/**
 * Subscribes to real-time changes in the global family safety network.
 * When ANY user adds, removes, or modifies a name or details, the callback
 * fires immediately for all connected users.
 */
export function subscribeToFamilyMembers(callback) {
  if (!db) {
    getFamilyMembers().then(callback);
    return () => {};
  }

  try {
    const colRef = collection(db, FIRESTORE_FAMILY_COLLECTION);
    const unsubscribe = onSnapshot(
      colRef,
      (snapshot) => {
        if (!snapshot.empty) {
          const members = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            members.push({
              ...data,
              id: docSnap.id,
              _id: docSnap.id,
            });
          });
          // Sort by createdAtMs descending (newest first)
          members.sort((a, b) => (b.createdAtMs || 0) - (a.createdAtMs || 0));
          localStorage.setItem(FAMILY_INITIALIZED_KEY, "true");
          localStorage.setItem(LOCAL_FAMILY_KEY, JSON.stringify(members));
          callback(members);
        } else {
          // If Firestore collection is empty, seed defaults into cloud so it's permanently stored
          seedInitialFirestoreMembers().then(callback);
        }
      },
      (error) => {
        console.warn("Firestore subscription notice (using resilient fallback):", error);
        getFamilyMembers().then(callback);
      }
    );

    return unsubscribe;
  } catch (err) {
    console.warn("Failed to subscribe to Firestore family members:", err);
    getFamilyMembers().then(callback);
    return () => {};
  }
}

async function seedInitialFirestoreMembers() {
  if (db) {
    try {
      for (const m of INITIAL_FALLBACK_MEMBERS) {
        await setDoc(doc(db, FIRESTORE_FAMILY_COLLECTION, m.id), {
          ...m,
          createdAtMs: Date.now(),
        });
      }
    } catch {}
  }
  return INITIAL_FALLBACK_MEMBERS;
}

export async function getFamilyMembers() {
  // 1. Try Cloud Firestore (Primary shared real-time database)
  if (db) {
    try {
      const colRef = collection(db, FIRESTORE_FAMILY_COLLECTION);
      const snapshot = await getDocs(colRef);
      if (!snapshot.empty) {
        const members = [];
        snapshot.forEach((docSnap) => {
          members.push({
            ...docSnap.data(),
            id: docSnap.id,
            _id: docSnap.id,
          });
        });
        members.sort((a, b) => (b.createdAtMs || 0) - (a.createdAtMs || 0));
        localStorage.setItem(FAMILY_INITIALIZED_KEY, "true");
        localStorage.setItem(LOCAL_FAMILY_KEY, JSON.stringify(members));
        return members;
      }
    } catch (err) {
      console.warn("Firestore fetch error, trying backend API:", err);
    }
  }

  // 2. Try Backend Shared API (MongoDB Atlas)
  try {
    const res = await fetch(`${API_URL}/api/family/shared`);
    if (res.ok) {
      const json = await res.json();
      const apiMembers = json.data;
      if (Array.isArray(apiMembers) && apiMembers.length > 0) {
        const mapped = apiMembers.map((m) => ({
          ...m,
          id: m.id || m._id,
          _id: m._id || m.id,
        }));
        localStorage.setItem(FAMILY_INITIALIZED_KEY, "true");
        localStorage.setItem(LOCAL_FAMILY_KEY, JSON.stringify(mapped));
        return mapped;
      }
    }
  } catch {}

  // 3. Fallback to local storage cache
  let localMembers = [];
  try {
    const raw = localStorage.getItem(LOCAL_FAMILY_KEY);
    if (raw) {
      localMembers = JSON.parse(raw);
    }
  } catch {}

  const hasInitialized = localStorage.getItem(FAMILY_INITIALIZED_KEY);
  if (localMembers.length === 0 && !hasInitialized) {
    localMembers = INITIAL_FALLBACK_MEMBERS;
    localStorage.setItem(FAMILY_INITIALIZED_KEY, "true");
    localStorage.setItem(LOCAL_FAMILY_KEY, JSON.stringify(localMembers));
  }

  return localMembers;
}

export async function addFamilyMember(memberData) {
  const memberId = memberData.id || `mem-${Date.now()}`;
  const nowStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const newMember = {
    id: memberId,
    _id: memberId,
    name: memberData.name.trim(),
    relation: memberData.relation || "Family",
    phone: memberData.phone || "",
    bloodGroup: memberData.bloodGroup || "Unknown",
    status: memberData.status || "Safe",
    isSafe: memberData.status !== "Needs Help",
    location: memberData.location || "Current Location",
    coordinates: memberData.coordinates || "",
    createdAtMs: Date.now(),
    createdAt: new Date().toISOString(),
    lastUpdated: nowStr,
  };

  // 1. Save to Cloud Firestore permanently for every user
  if (db) {
    try {
      const docRef = doc(db, FIRESTORE_FAMILY_COLLECTION, memberId);
      await setDoc(docRef, newMember);
    } catch (err) {
      console.warn("Firestore add member error:", err);
    }
  }

  // 2. Save to Backend Shared API (MongoDB Atlas)
  try {
    await fetch(`${API_URL}/api/family/shared`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newMember),
    });
  } catch {}

  // 3. Update local cache
  let existing = [];
  try {
    const raw = localStorage.getItem(LOCAL_FAMILY_KEY);
    if (raw) existing = JSON.parse(raw);
  } catch {}

  const updated = [newMember, ...existing.filter((m) => m.id !== memberId && m._id !== memberId)];
  localStorage.setItem(FAMILY_INITIALIZED_KEY, "true");
  localStorage.setItem(LOCAL_FAMILY_KEY, JSON.stringify(updated));

  return updated;
}

/**
 * Modifies any family member's details (especially Name, relation, phone, location)
 * permanently so that EVERY user across the platform sees the change immediately.
 */
export async function updateFamilyMember(memberId, updatedFields) {
  const cleanId = String(memberId);
  const nowStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const payload = {
    ...updatedFields,
    lastUpdated: nowStr,
    updatedAt: new Date().toISOString(),
  };

  if (payload.name) {
    payload.name = payload.name.trim();
  }

  // 1. Update Cloud Firestore permanently for all users
  if (db) {
    try {
      const docRef = doc(db, FIRESTORE_FAMILY_COLLECTION, cleanId);
      await setDoc(docRef, payload, { merge: true });
    } catch (err) {
      console.warn("Firestore update member error:", err);
    }
  }

  // 2. Update Backend Shared API (MongoDB Atlas)
  try {
    await fetch(`${API_URL}/api/family/shared/${cleanId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {}

  // 3. Update local cache
  let existing = [];
  try {
    const raw = localStorage.getItem(LOCAL_FAMILY_KEY);
    if (raw) existing = JSON.parse(raw);
  } catch {}

  const updatedList = existing.map((m) =>
    (m.id === cleanId || m._id === cleanId) ? { ...m, ...payload } : m
  );
  localStorage.setItem(LOCAL_FAMILY_KEY, JSON.stringify(updatedList));

  return updatedList;
}

export async function toggleMemberSafety(memberId, newStatus) {
  const isSafe = newStatus === "Safe";
  return updateFamilyMember(memberId, {
    status: newStatus,
    isSafe,
  });
}

export async function removeFamilyMember(memberId) {
  const cleanId = String(memberId);

  // 1. Delete from Cloud Firestore permanently for all users
  if (db) {
    try {
      const docRef = doc(db, FIRESTORE_FAMILY_COLLECTION, cleanId);
      await deleteDoc(docRef);
    } catch (err) {
      console.warn("Firestore delete member error:", err);
    }
  }

  // 2. Delete from Backend Shared API (MongoDB Atlas)
  try {
    await fetch(`${API_URL}/api/family/shared/${cleanId}`, {
      method: "DELETE",
    });
  } catch {}

  // 3. Update local cache
  let existing = [];
  try {
    const raw = localStorage.getItem(LOCAL_FAMILY_KEY);
    if (raw) existing = JSON.parse(raw);
  } catch {}

  const updated = existing.filter((m) => m.id !== cleanId && m._id !== cleanId);
  localStorage.setItem(FAMILY_INITIALIZED_KEY, "true");
  localStorage.setItem(LOCAL_FAMILY_KEY, JSON.stringify(updated));

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
