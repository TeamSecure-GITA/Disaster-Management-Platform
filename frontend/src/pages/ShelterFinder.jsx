import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchShelters } from "../services/disasterService";

function ShelterFinder() {
  const navigate = useNavigate();
  const [shelters, setShelters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("All");
  const [userCoords, setUserCoords] = useState(null);
  const [gpsLoading, setGpsLoading] = useState(false);

  useEffect(() => {
    loadData(userCoords);
  }, []);

  const loadData = async (coords = null) => {
    setLoading(true);
    try {
      const data = await fetchShelters(coords);
      setShelters(data);
    } finally {
      setLoading(false);
    }
  };

  const detectGPS = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = [pos.coords.latitude, pos.coords.longitude];
        setUserCoords(coords);
        setGpsLoading(false);
        loadData(coords);
      },
      () => {
        setGpsLoading(false);
        alert("Location access denied or unavailable.");
      },
      { timeout: 8000 }
    );
  };

  const filtered = shelters.filter((s) => {
    const matchSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.address && s.address.toLowerCase().includes(search.toLowerCase())) ||
      (s.city && s.city.toLowerCase().includes(search.toLowerCase()));

    const matchType =
      type === "All" ||
      (s.type && s.type.toLowerCase().includes(type.toLowerCase())) ||
      s.name.toLowerCase().includes(type.toLowerCase());

    return matchSearch && matchType;
  });

  const openDisasterMap = (shelter) => {
    const lat = shelter.lat || shelter.location?.coordinates?.[1] || 20.29;
    const lng = shelter.lng || shelter.location?.coordinates?.[0] || 85.82;
    navigate(`/map?lat=${lat}&lng=${lng}&name=${encodeURIComponent(shelter.name)}`);
  };

  return (
    <div className="shelter-page" style={{ maxWidth: "1100px", margin: "0 auto", padding: "10px 0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", marginBottom: "16px" }}>
        <div>
          <h1 style={{ fontSize: "1.8rem", fontWeight: "800", margin: 0 }}>📍 Rescue Center & Shelter Finder</h1>
          <p style={{ color: "#94a3b8", marginTop: "4px" }}>
            Search and locate emergency disaster shelters and relief centers with live occupancy and directions.
          </p>
        </div>

        <button
          onClick={detectGPS}
          disabled={gpsLoading}
          style={{
            padding: "9px 16px",
            backgroundColor: userCoords ? "#0369a1" : "#1e293b",
            border: "1px solid #0284c7",
            borderRadius: "8px",
            color: "#38bdf8",
            fontWeight: "600",
            fontSize: "0.85rem",
            cursor: gpsLoading ? "wait" : "pointer",
          }}
        >
          {gpsLoading ? "📡 Detecting..." : userCoords ? "📍 GPS Active" : "📍 Detect My Location"}
        </button>
      </div>

      <div className="shelter-search" style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap" }}>
        <input
          type="text"
          placeholder="🔍 Search location, city, or shelter name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: "220px", padding: "10px 14px", backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: "8px", color: "#fff" }}
        />
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          style={{ padding: "10px 14px", backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: "8px", color: "#fff" }}
        >
          <option value="All">All Types</option>
          <option value="Cyclone">Cyclone Shelter</option>
          <option value="Flood">Flood Relief Center</option>
          <option value="Camp">Relief Camp</option>
          <option value="Shelter">General Shelter</option>
        </select>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#60a5fa" }}>⏳ Loading emergency shelters...</div>
      ) : (
        <div className="shelter-list" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "16px" }}>
          {filtered.map((shelter) => {
            const capacity = shelter.capacity || 500;
            const occupancy = shelter.currentOccupancy || 0;
            const available = Math.max(0, capacity - occupancy);

            return (
              <div
                className="shelter-card"
                key={shelter.id || shelter._id}
                style={{ backgroundColor: "#1e293b", padding: "20px", borderRadius: "12px", border: "1px solid #334155" }}
              >
                <div className="shelter-card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                  <div>
                    <h2 style={{ fontSize: "1.1rem", fontWeight: "700", margin: 0, color: "#f8fafc" }}>
                      🏠 {shelter.name}
                    </h2>
                    <p style={{ color: "#94a3b8", fontSize: "0.85rem", marginTop: "4px" }}>
                      📍 {shelter.address}{shelter.city ? `, ${shelter.city}` : ""}
                    </p>
                  </div>
                  <span
                    style={{
                      padding: "2px 8px",
                      borderRadius: "6px",
                      fontSize: "0.75rem",
                      fontWeight: "700",
                      backgroundColor: available === 0 ? "#991b1b" : "#166534",
                      color: available === 0 ? "#fca5a5" : "#86efac",
                    }}
                  >
                    {available === 0 ? "Full" : "Available"}
                  </span>
                </div>

                <div className="shelter-info" style={{ fontSize: "0.85rem", color: "#cbd5e1", lineHeight: "1.6" }}>
                  {shelter.distanceKm != null && (
                    <p style={{ margin: "4px 0", color: "#38bdf8" }}>
                      <strong>📏 Distance:</strong> {shelter.distanceKm} km away
                    </p>
                  )}
                  <p style={{ margin: "4px 0" }}>
                    <strong>👥 Capacity:</strong> {capacity} total
                  </p>
                  <p style={{ margin: "4px 0" }}>
                    <strong>🟢 Available:</strong>{" "}
                    <span style={{ color: available === 0 ? "#ef4444" : "#4ade80", fontWeight: "700" }}>
                      {available === 0 ? "Full" : `${available} spots`}
                    </span>
                  </p>
                  <p style={{ margin: "4px 0" }}>
                    <strong>📞 Helpline:</strong> {shelter.phone || shelter.contactNumber || "112"}
                  </p>
                </div>

                {shelter.facilities && shelter.facilities.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", margin: "12px 0" }}>
                    {shelter.facilities.map((f, i) => (
                      <span
                        key={i}
                        style={{ backgroundColor: "#0f172a", padding: "2px 8px", borderRadius: "4px", fontSize: "0.72rem", color: "#94a3b8", border: "1px solid #334155" }}
                      >
                        ✓ {f}
                      </span>
                    ))}
                  </div>
                )}

                <div style={{ display: "flex", gap: "8px", marginTop: "14px" }}>
                  <button
                    onClick={() => openDisasterMap(shelter)}
                    style={{
                      flex: 1,
                      padding: "8px 12px",
                      backgroundColor: "#1d4ed8",
                      border: "none",
                      borderRadius: "8px",
                      color: "#fff",
                      fontWeight: "600",
                      fontSize: "0.85rem",
                      cursor: "pointer",
                    }}
                  >
                    🗺️ Disaster Map Route
                  </button>

                  <a
                    href={`tel:${shelter.phone || shelter.contactNumber || "112"}`}
                    style={{
                      padding: "8px 14px",
                      backgroundColor: "#059669",
                      borderRadius: "8px",
                      color: "#fff",
                      fontWeight: "600",
                      fontSize: "0.85rem",
                      textDecoration: "none",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    📞 Call
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: "40px", backgroundColor: "#1e293b", borderRadius: "10px", color: "#94a3b8" }}>
          🔍 No shelters found matching your search.
        </div>
      )}
    </div>
  );
}

export default ShelterFinder;