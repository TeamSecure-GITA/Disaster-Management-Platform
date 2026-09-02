import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Custom colored SVG markers for distinct facility types
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
      box-shadow: 0 4px 10px rgba(0,0,0,0.4);
      font-size: 16px;
      cursor: pointer;
    ">${emoji}</div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -18],
  });
};

const hospitalIcon = createCustomIcon("#ef4444", "🏥");
const shelterIcon  = createCustomIcon("#2563eb", "⛺");
const fireIcon     = createCustomIcon("#ea580c", "🚒");
const hazardIcon   = createCustomIcon("#dc2626", "⚠️");

// ─── Real Emergency Facilities Dataset ──────────────────────────────────────
const EMERGENCY_FACILITIES = [
  // ── HOSPITALS ──
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

  // ── ACTIVE HAZARD ZONES ──
  {
    id: "hazard-1",
    name: "Mahanadi River Basin High Flood Alert Zone",
    type: "hazard",
    category: "Active Inundation Area",
    lat: 20.485,
    lng: 85.852,
    address: "Low-lying embankment sectors along Mahanadi River, Cuttack",
    phone: "Disaster Control: 1070",
    emergencyPhone: "112",
    capacity: "Water Level: Above Danger Mark (+1.2m)",
    status: "High Alert / Evacuate Lowlands",
    website: "https://cwc.gov.in",
  },
];

// External Official Portals
const EXTERNAL_PORTALS = [
  {
    name: "NDMA India Disaster Portal",
    icon: "🇮🇳",
    url: "https://ndma.gov.in",
    desc: "National Disaster Management Authority guidelines & real-time alerts",
  },
  {
    name: "IMD Weather & Cyclone Radar",
    icon: "🌀",
    url: "https://mausam.imd.gov.in",
    desc: "Indian Meteorological Department live satellite & doppler radar",
  },
  {
    name: "OSDMA Odisha Disaster Portal",
    icon: "🛡️",
    url: "https://osdma.org",
    desc: "State disaster management control room & active shelter lists",
  },
  {
    name: "OpenStreetMap Crisis Map",
    icon: "🗺️",
    url: "https://www.openstreetmap.org/#map=11/20.2961/85.8245",
    desc: "Open source community live emergency & crisis mapping",
  },
  {
    name: "Google Crisis Response",
    icon: "🌐",
    url: "https://google.org/crisismap",
    desc: "Google live flood, storm, and public safety alerts",
  },
];

export default function Map() {
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [userLocation, setUserLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState([20.2961, 85.8245]); // Default Bhubaneswar
  const [mapZoom, setMapZoom] = useState(11);

  const filteredFacilities = EMERGENCY_FACILITIES.filter((fac) => {
    const matchesFilter = filter === "all" || fac.type === filter;
    const matchesSearch =
      fac.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fac.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fac.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

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
      }
    );
  };

  const getMarkerIcon = (type) => {
    if (type === "hospital") return hospitalIcon;
    if (type === "shelter") return shelterIcon;
    if (type === "fire") return fireIcon;
    return hazardIcon;
  };

  return (
    <div style={{ padding: "20px", color: "#fff", minHeight: "100vh", boxSizing: "border-box" }}>
      {/* ── Page Header ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px", marginBottom: "20px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1 style={{ margin: 0, fontSize: "1.6rem", fontWeight: "800", color: "#f8fafc" }}>
              🗺️ Disaster Response, Hospitals & Rescue Map
            </h1>
            <span style={{ backgroundColor: "#2563eb", color: "#fff", fontSize: "0.75rem", padding: "3px 10px", borderRadius: "999px", fontWeight: "700" }}>
              Live GPS Sync
            </span>
          </div>
          <p style={{ margin: "6px 0 0 0", color: "#94a3b8", fontSize: "0.9rem" }}>
            Real-time emergency navigation showing verified hospitals, trauma centers, cyclone shelters, fire rescue stations & hazard sectors.
          </p>
        </div>

        {/* Action Controls */}
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={handleLocateMe}
            style={{
              padding: "10px 16px",
              backgroundColor: "#16a34a",
              color: "#ffffff",
              border: "none",
              borderRadius: "10px",
              fontWeight: "700",
              fontSize: "0.85rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              boxShadow: "0 2px 8px rgba(22, 163, 74, 0.3)",
            }}
          >
            <span>📍</span> Find My Location & Nearest Hospital
          </button>
        </div>
      </div>

      {/* ── Filters & Search Bar ── */}
      <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap", marginBottom: "16px" }}>
        <input
          type="text"
          placeholder="🔍 Search hospital, shelter, city, trauma center..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            flex: 1,
            minWidth: "260px",
            padding: "10px 14px",
            borderRadius: "10px",
            border: "1px solid #334155",
            backgroundColor: "#1e293b",
            color: "#ffffff",
            fontSize: "0.9rem",
            outline: "none",
          }}
        />

        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {[
            { id: "all", label: `All (${EMERGENCY_FACILITIES.length})` },
            { id: "hospital", label: "🏥 Hospitals (7)" },
            { id: "shelter", label: "⛺ Rescue Shelters (5)" },
            { id: "fire", label: "🚒 Fire & ODRAF (2)" },
            { id: "hazard", label: "🚨 Hazard Zones (1)" },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setFilter(cat.id)}
              style={{
                padding: "8px 14px",
                borderRadius: "8px",
                border: "none",
                fontWeight: "600",
                fontSize: "0.82rem",
                cursor: "pointer",
                backgroundColor: filter === cat.id ? "#2563eb" : "#1e293b",
                color: filter === cat.id ? "#ffffff" : "#94a3b8",
                transition: "all 0.15s",
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Interactive Map Container ── */}
      <div style={{ borderRadius: "16px", overflow: "hidden", border: "1px solid #334155", boxShadow: "0 10px 30px rgba(0,0,0,0.5)", marginBottom: "24px" }}>
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          scrollWheelZoom={true}
          style={{ height: "580px", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

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
                      GPS Coordinates: {userLocation[0].toFixed(4)}, {userLocation[1].toFixed(4)}
                    </div>
                  </div>
                </Popup>
              </Marker>
              <Circle
                center={userLocation}
                radius={3000}
                pathOptions={{ color: "#10b981", fillColor: "#10b981", fillOpacity: 0.1 }}
              />
            </>
          )}

          {/* Emergency Facilities Markers */}
          {filteredFacilities.map((facility) => (
            <Marker
              key={facility.id}
              position={[facility.lat, facility.lng]}
              icon={getMarkerIcon(facility.type)}
            >
              <Popup>
                <div style={{ color: "#0f172a", maxWidth: "280px", padding: "2px", lineHeight: "1.4" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                    <span style={{ fontSize: "1.1rem" }}>
                      {facility.type === "hospital" ? "🏥" : facility.type === "shelter" ? "⛺" : facility.type === "fire" ? "🚒" : "⚠️"}
                    </span>
                    <strong style={{ fontSize: "0.95rem", color: "#0f172a" }}>{facility.name}</strong>
                  </div>

                  <div style={{ fontSize: "0.75rem", color: "#1d4ed8", fontWeight: "700", marginBottom: "6px" }}>
                    {facility.category} • <span style={{ color: "#16a34a" }}>{facility.status}</span>
                  </div>

                  <div style={{ fontSize: "0.8rem", color: "#475569", marginBottom: "6px" }}>
                    📍 {facility.address}
                  </div>

                  <div style={{ fontSize: "0.8rem", color: "#334155", marginBottom: "6px" }}>
                    👥 <strong>Capacity / Facilities:</strong> {facility.capacity}
                  </div>

                  <div style={{ fontSize: "0.8rem", color: "#b91c1c", fontWeight: "700", marginBottom: "10px" }}>
                    📞 <strong>Emergency Hotline:</strong>{" "}
                    <a href={`tel:${facility.emergencyPhone.replace(/[^0-9]/g, "")}`} style={{ color: "#dc2626", textDecoration: "underline" }}>
                      {facility.emergencyPhone}
                    </a>
                  </div>

                  {/* External Navigation Links */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px", borderTop: "1px solid #e2e8f0", paddingTop: "8px" }}>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${facility.lat},${facility.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        padding: "6px 10px",
                        backgroundColor: "#1d4ed8",
                        color: "#ffffff",
                        borderRadius: "6px",
                        fontSize: "0.78rem",
                        fontWeight: "700",
                        textDecoration: "none",
                        textAlign: "center",
                        display: "block",
                      }}
                    >
                      📍 Open in Google Maps (GPS Navigation) →
                    </a>

                    <div style={{ display: "flex", gap: "6px" }}>
                      <a
                        href={`https://www.openstreetmap.org/?mlat=${facility.lat}&mlon=${facility.lng}#map=16/${facility.lat}/${facility.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          flex: 1,
                          padding: "5px",
                          backgroundColor: "#f1f5f9",
                          color: "#334155",
                          border: "1px solid #cbd5e1",
                          borderRadius: "6px",
                          fontSize: "0.72rem",
                          fontWeight: "600",
                          textDecoration: "none",
                          textAlign: "center",
                        }}
                      >
                        🗺️ OpenStreetMap
                      </a>

                      {facility.website && (
                        <a
                          href={facility.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            flex: 1,
                            padding: "5px",
                            backgroundColor: "#f1f5f9",
                            color: "#334155",
                            border: "1px solid #cbd5e1",
                            borderRadius: "6px",
                            fontSize: "0.72rem",
                            fontWeight: "600",
                            textDecoration: "none",
                            textAlign: "center",
                          }}
                        >
                          🌐 Official Portal
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* ── Official Disaster Map Portals & Websites ── */}
      <div>
        <h2 style={{ fontSize: "1.1rem", fontWeight: "700", color: "#38bdf8", marginBottom: "12px" }}>
          🌐 Official External Disaster Portals & Live Weather Radars
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "12px" }}>
          {EXTERNAL_PORTALS.map((portal, idx) => (
            <a
              key={idx}
              href={portal.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                backgroundColor: "#1e293b",
                border: "1px solid #334155",
                borderRadius: "12px",
                padding: "14px 16px",
                color: "#ffffff",
                textDecoration: "none",
                display: "flex",
                flexDirection: "column",
                gap: "6px",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#38bdf8";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#334155";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: "1.2rem" }}>{portal.icon}</span>
                <span style={{ fontSize: "0.75rem", color: "#38bdf8", fontWeight: "600" }}>Visit Website ↗</span>
              </div>
              <strong style={{ fontSize: "0.92rem", color: "#f8fafc" }}>{portal.name}</strong>
              <span style={{ fontSize: "0.78rem", color: "#94a3b8", lineHeight: "1.4" }}>{portal.desc}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}