import React, { useState } from "react";

const SHELTERS = [
  {
    id: 1,
    name: "Community Emergency Shelter",
    location: "Bhubaneswar",
    lat: 20.2961,
    lng: 85.8245,
    distance: "2.4 km",
    capacity: 500,
    available: 180,
    type: "Shelter",
    facilities: ["Food", "Water", "Medical"],
    status: "Available",
    contact: "Emergency Desk",
    phone: "0674-2530100",
  },
  {
    id: 2,
    name: "Cyclone Relief Center",
    location: "Patia",
    lat: 20.3522,
    lng: 85.8193,
    distance: "4.1 km",
    capacity: 300,
    available: 75,
    type: "Cyclone Shelter",
    facilities: ["Food", "Water", "Power"],
    status: "Limited",
    contact: "Relief Center",
    phone: "0674-2540200",
  },
  {
    id: 3,
    name: "Government Relief Camp",
    location: "Cuttack Road",
    lat: 20.2700,
    lng: 85.8130,
    distance: "6.8 km",
    capacity: 800,
    available: 0,
    type: "Relief Camp",
    facilities: ["Food", "Medical", "Water"],
    status: "Full",
    contact: "Relief Office",
    phone: "0671-2301100",
  },
];

function ShelterFinder() {
  const [search, setSearch] = useState("");
  const [type, setType] = useState("All");

  const filtered = SHELTERS.filter((s) => {
    const matchSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.location.toLowerCase().includes(search.toLowerCase());
    const matchType = type === "All" || s.type === type;
    return matchSearch && matchType;
  });

  const openGoogleMaps = (shelter) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${shelter.lat},${shelter.lng}&travelmode=driving`;
    window.open(url, "_blank");
  };

  return (
    <div className="shelter-page">
      <h1>📍 Rescue Center & Shelter Finder</h1>
      <p>Find emergency shelters and relief centers available in your area.</p>

      <div className="shelter-search">
        <input
          type="text"
          placeholder="🔍 Search location or shelter..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option>All</option>
          <option>Shelter</option>
          <option>Cyclone Shelter</option>
          <option>Relief Camp</option>
        </select>
      </div>

      <div className="shelter-list">
        {filtered.map((shelter) => (
          <div className="shelter-card" key={shelter.id}>
            <div className="shelter-card-header">
              <div>
                <h2>🏠 {shelter.name}</h2>
                <p>📍 {shelter.location}</p>
              </div>
              <span className={`shelter-status ${shelter.status.toLowerCase().replace(" ", "-")}`}>
                {shelter.status}
              </span>
            </div>

            <div className="shelter-info">
              <p><strong>📏 Distance:</strong> {shelter.distance}</p>
              <p><strong>👥 Capacity:</strong> {shelter.capacity}</p>
              <p>
                <strong>🟢 Available:</strong>{" "}
                <span style={{ color: shelter.available === 0 ? "#ef4444" : shelter.available < 50 ? "#f59e0b" : "#4ade80" }}>
                  {shelter.available === 0 ? "Full" : `${shelter.available} spots`}
                </span>
              </p>
              <p><strong>📞 Contact:</strong> {shelter.contact}</p>
            </div>

            <div className="facility-list">
              {shelter.facilities.map((f) => (
                <span key={f}>✓ {f}</span>
              ))}
            </div>

            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "12px" }}>
              {/* View on Map — opens Google Maps with driving directions */}
              <button
                className="shelter-map-btn"
                onClick={() => openGoogleMaps(shelter)}
              >
                🗺️ Get Directions
              </button>

              {/* Call shelter */}
              <a
                href={`tel:${shelter.phone}`}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  backgroundColor: "#059669",
                  color: "white",
                  padding: "8px 16px",
                  borderRadius: "8px",
                  textDecoration: "none",
                  fontWeight: "600",
                  fontSize: "0.85rem",
                }}
              >
                📞 Call Shelter
              </a>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="empty-shelters">🔍 No shelters found.</div>
      )}
    </div>
  );
}

export default ShelterFinder;