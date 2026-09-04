import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { fetchShelters } from "../services/disasterService";

export default function Rescue() {
  const navigate = useNavigate();

  const [shelters, setShelters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCity, setSelectedCity] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedFacility, setSelectedFacility] = useState("All");
  const [userCoords, setUserCoords] = useState(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [activeModalCenter, setActiveModalCenter] = useState(null);

  // Load shelters on mount
  useEffect(() => {
    loadShelters(userCoords);
  }, []);

  const loadShelters = async (coords = null) => {
    setLoading(true);
    try {
      const data = await fetchShelters(coords);
      setShelters(data);
    } catch (err) {
      console.error("Error loading rescue centers:", err);
    } finally {
      setLoading(false);
    }
  };

  // Detect user GPS
  const detectLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserCoords(coords);
        loadShelters(coords);
        setGpsLoading(false);
      },
      (err) => {
        console.warn("GPS error:", err);
        alert("Could not detect GPS location. Please check browser permissions.");
        setGpsLoading(false);
      },
      { timeout: 8000 }
    );
  };

  // Cities extracted dynamically
  const cities = ["All", ...new Set(shelters.map((s) => s.city).filter(Boolean))];

  // Facilities list
  const allFacilities = [
    "All",
    "Medical Station",
    "Drinking Water",
    "Emergency Power",
    "Food Kitchen",
    "Wheelchair Accessible",
  ];

  // Filtering
  const filteredShelters = shelters.filter((s) => {
    const q = search.toLowerCase();
    const matchSearch =
      !search ||
      s.name.toLowerCase().includes(q) ||
      s.address.toLowerCase().includes(q) ||
      (s.city && s.city.toLowerCase().includes(q));

    const matchCity = selectedCity === "All" || s.city === selectedCity;
    const matchStatus =
      selectedStatus === "All" ||
      s.status.toLowerCase() === selectedStatus.toLowerCase();

    const matchFacility =
      selectedFacility === "All" ||
      (s.facilities &&
        s.facilities.some((f) =>
          f.toLowerCase().includes(selectedFacility.toLowerCase())
        ));

    return matchSearch && matchCity && matchStatus && matchFacility;
  });

  // Summary counts
  const totalCapacity = shelters.reduce((acc, s) => acc + (s.capacity || 0), 0);
  const totalOccupancy = shelters.reduce((acc, s) => acc + (s.currentOccupancy || 0), 0);
  const availableBeds = Math.max(0, totalCapacity - totalOccupancy);
  const nearestDistance =
    userCoords && filteredShelters[0]?.distanceKm != null
      ? `${filteredShelters[0].distanceKm} km`
      : "Tap GPS";

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "10px 0" }}>
      {/* ── HEADER ──────────────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "2rem" }}>📍</span>
            <h1 style={{ fontSize: "1.9rem", fontWeight: "800", margin: 0, color: "#f8fafc" }}>
              Rescue Centers & Shelters
            </h1>
          </div>
          <p style={{ color: "#94a3b8", marginTop: "6px", fontSize: "0.95rem" }}>
            Live verified cyclone safe shelters, flood relief hubs, and medical rescue camps in your region.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button
            onClick={detectLocation}
            disabled={gpsLoading}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 18px",
              borderRadius: "10px",
              border: "1px solid #0284c7",
              backgroundColor: userCoords ? "#0369a1" : "#0f172a",
              color: "#38bdf8",
              fontWeight: "600",
              fontSize: "0.9rem",
              cursor: gpsLoading ? "wait" : "pointer",
              transition: "all 0.2s",
            }}
          >
            <span>📡</span>
            <span>{gpsLoading ? "Detecting GPS..." : userCoords ? "📍 GPS Active (Sorted)" : "Sort by Nearest GPS"}</span>
          </button>

          <button
            onClick={() => navigate("/evacuation-planner")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 20px",
              borderRadius: "10px",
              border: "none",
              background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
              color: "#ffffff",
              fontWeight: "700",
              fontSize: "0.9rem",
              cursor: "pointer",
              boxShadow: "0 4px 15px rgba(37,99,235,0.3)",
            }}
          >
            <span>🧭</span>
            <span>Evacuation Planner</span>
          </button>
        </div>
      </div>

      {/* ── STATS ROW ───────────────────────────────────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <div style={{ backgroundColor: "#1e293b", padding: "18px", borderRadius: "12px", border: "1px solid #334155" }}>
          <span style={{ color: "#94a3b8", fontSize: "0.82rem", fontWeight: "600", textTransform: "uppercase" }}>
            Total Centers
          </span>
          <div style={{ fontSize: "1.8rem", fontWeight: "800", color: "#f8fafc", marginTop: "4px" }}>
            {shelters.length}
          </div>
          <div style={{ fontSize: "0.8rem", color: "#4ade80", marginTop: "4px" }}>
            ● Active Disaster Network
          </div>
        </div>

        <div style={{ backgroundColor: "#1e293b", padding: "18px", borderRadius: "12px", border: "1px solid #334155" }}>
          <span style={{ color: "#94a3b8", fontSize: "0.82rem", fontWeight: "600", textTransform: "uppercase" }}>
            Total Capacity
          </span>
          <div style={{ fontSize: "1.8rem", fontWeight: "800", color: "#60a5fa", marginTop: "4px" }}>
            {totalCapacity.toLocaleString()} <span style={{ fontSize: "0.9rem", color: "#94a3b8" }}>people</span>
          </div>
          <div style={{ fontSize: "0.8rem", color: "#94a3b8", marginTop: "4px" }}>
            Across all shelters
          </div>
        </div>

        <div style={{ backgroundColor: "#1e293b", padding: "18px", borderRadius: "12px", border: "1px solid #334155" }}>
          <span style={{ color: "#94a3b8", fontSize: "0.82rem", fontWeight: "600", textTransform: "uppercase" }}>
            Available Spaces
          </span>
          <div style={{ fontSize: "1.8rem", fontWeight: "800", color: availableBeds > 100 ? "#22c55e" : "#f59e0b", marginTop: "4px" }}>
            {availableBeds.toLocaleString()} <span style={{ fontSize: "0.9rem", color: "#94a3b8" }}>spots</span>
          </div>
          <div style={{ fontSize: "0.8rem", color: "#4ade80", marginTop: "4px" }}>
            Ready for immediate intake
          </div>
        </div>

        <div style={{ backgroundColor: "#1e293b", padding: "18px", borderRadius: "12px", border: "1px solid #334155" }}>
          <span style={{ color: "#94a3b8", fontSize: "0.82rem", fontWeight: "600", textTransform: "uppercase" }}>
            Nearest Center
          </span>
          <div style={{ fontSize: "1.8rem", fontWeight: "800", color: "#38bdf8", marginTop: "4px" }}>
            {nearestDistance}
          </div>
          <div style={{ fontSize: "0.8rem", color: "#94a3b8", marginTop: "4px" }}>
            {userCoords ? "Calculated via GPS" : "Click GPS to calculate"}
          </div>
        </div>
      </div>

      {/* ── FILTERS BAR ─────────────────────────────────────────────────── */}
      <div
        style={{
          backgroundColor: "#1e293b",
          padding: "16px 20px",
          borderRadius: "12px",
          border: "1px solid #334155",
          marginBottom: "24px",
          display: "flex",
          flexWrap: "wrap",
          gap: "14px",
          alignItems: "center",
        }}
      >
        <div style={{ flex: "1 1 240px", minWidth: "220px" }}>
          <input
            type="text"
            placeholder="🔍 Search shelter by name, city, address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 14px",
              backgroundColor: "#0f172a",
              border: "1px solid #334155",
              borderRadius: "8px",
              color: "#fff",
              fontSize: "0.9rem",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
          <div>
            <label style={{ fontSize: "0.75rem", color: "#94a3b8", display: "block", marginBottom: "4px" }}>
              District / City
            </label>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              style={{
                padding: "9px 12px",
                backgroundColor: "#0f172a",
                border: "1px solid #334155",
                borderRadius: "8px",
                color: "#fff",
                fontSize: "0.85rem",
                outline: "none",
              }}
            >
              {cities.map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: "0.75rem", color: "#94a3b8", display: "block", marginBottom: "4px" }}>
              Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              style={{
                padding: "9px 12px",
                backgroundColor: "#0f172a",
                border: "1px solid #334155",
                borderRadius: "8px",
                color: "#fff",
                fontSize: "0.85rem",
                outline: "none",
              }}
            >
              <option value="All">All Statuses</option>
              <option value="open">Open / Available</option>
              <option value="limited">Limited</option>
              <option value="full">Full</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: "0.75rem", color: "#94a3b8", display: "block", marginBottom: "4px" }}>
              Facility Filter
            </label>
            <select
              value={selectedFacility}
              onChange={(e) => setSelectedFacility(e.target.value)}
              style={{
                padding: "9px 12px",
                backgroundColor: "#0f172a",
                border: "1px solid #334155",
                borderRadius: "8px",
                color: "#fff",
                fontSize: "0.85rem",
                outline: "none",
              }}
            >
              {allFacilities.map((fac) => (
                <option key={fac} value={fac}>{fac}</option>
              ))}
            </select>
          </div>

          {(search || selectedCity !== "All" || selectedStatus !== "All" || selectedFacility !== "All") && (
            <button
              onClick={() => {
                setSearch("");
                setSelectedCity("All");
                setSelectedStatus("All");
                setSelectedFacility("All");
              }}
              style={{
                marginTop: "18px",
                padding: "8px 12px",
                backgroundColor: "transparent",
                border: "1px solid #475569",
                borderRadius: "8px",
                color: "#94a3b8",
                fontSize: "0.8rem",
                cursor: "pointer",
              }}
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* ── SHELTERS GRID ───────────────────────────────────────────────── */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "#60a5fa" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "12px" }}>⏳</div>
          <p>Loading active rescue centers and shelters...</p>
        </div>
      ) : filteredShelters.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "50px 20px",
            backgroundColor: "#1e293b",
            borderRadius: "12px",
            border: "1px solid #334155",
            color: "#94a3b8",
          }}
        >
          <div style={{ fontSize: "2.5rem", marginBottom: "8px" }}>🔍</div>
          <h3>No rescue centers found matching your filters</h3>
          <p style={{ fontSize: "0.9rem" }}>Try changing your district or facility search filter.</p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
            gap: "20px",
          }}
        >
          {filteredShelters.map((center) => {
            const capacity = center.capacity || 500;
            const occupancy = center.currentOccupancy || 0;
            const freeSpots = Math.max(0, capacity - occupancy);
            const occupancyPercent = Math.min(100, Math.round((occupancy / capacity) * 100));

            const isFull = freeSpots === 0;
            const isLimited = freeSpots > 0 && freeSpots < 100;

            const lat = center.lat || center.location?.coordinates?.[1] || 20.3;
            const lng = center.lng || center.location?.coordinates?.[0] || 85.8;
            const mapUrl = `/map?lat=${lat}&lng=${lng}&name=${encodeURIComponent(center.name || "Rescue Center")}`;
            const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;

            return (
              <div
                key={center.id || center._id}
                style={{
                  backgroundColor: "#1e293b",
                  borderRadius: "14px",
                  border: "1px solid #334155",
                  padding: "22px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
                  transition: "transform 0.15s, border-color 0.15s",
                }}
              >
                <div>
                  {/* Card Header */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px" }}>
                    <div>
                      <span
                        style={{
                          fontSize: "0.72rem",
                          fontWeight: "700",
                          backgroundColor: "#0284c7",
                          color: "#fff",
                          padding: "2px 8px",
                          borderRadius: "4px",
                          textTransform: "uppercase",
                        }}
                      >
                        {center.type || "Rescue Center"}
                      </span>
                      <h2
                        style={{
                          fontSize: "1.15rem",
                          fontWeight: "700",
                          color: "#f8fafc",
                          margin: "8px 0 4px 0",
                          lineHeight: "1.4",
                        }}
                      >
                        {center.name}
                      </h2>
                    </div>

                    <span
                      style={{
                        padding: "3px 10px",
                        borderRadius: "999px",
                        fontSize: "0.75rem",
                        fontWeight: "700",
                        whiteSpace: "nowrap",
                        backgroundColor: isFull ? "#991b1b" : isLimited ? "#854d0e" : "#166534",
                        color: isFull ? "#fca5a5" : isLimited ? "#fef08a" : "#86efac",
                        border: `1px solid ${isFull ? "#ef4444" : isLimited ? "#eab308" : "#22c55e"}`,
                      }}
                    >
                      ● {isFull ? "Full" : isLimited ? "Limited Space" : "Open / Available"}
                    </span>
                  </div>

                  {/* Address & Distance */}
                  <p style={{ color: "#94a3b8", fontSize: "0.85rem", margin: "8px 0 12px 0", display: "flex", alignItems: "center", gap: "6px" }}>
                    <span>📍</span>
                    <span>{center.address}{center.city ? `, ${center.city}` : ""}</span>
                  </p>

                  {center.distanceKm != null && (
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        backgroundColor: "#0f172a",
                        border: "1px solid #0284c7",
                        borderRadius: "6px",
                        padding: "3px 8px",
                        fontSize: "0.75rem",
                        color: "#38bdf8",
                        marginBottom: "12px",
                        fontWeight: "600",
                      }}
                    >
                      <span>📏</span> {center.distanceKm} km away from your location
                    </div>
                  )}

                  {/* Occupancy Progress Bar */}
                  <div style={{ margin: "12px 0" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem", marginBottom: "5px" }}>
                      <span style={{ color: "#94a3b8" }}>
                        Capacity: <strong>{capacity}</strong> beds
                      </span>
                      <span style={{ color: isFull ? "#ef4444" : "#4ade80", fontWeight: "600" }}>
                        {freeSpots} spots available ({occupancyPercent}% full)
                      </span>
                    </div>

                    <div
                      style={{
                        height: "8px",
                        backgroundColor: "#0f172a",
                        borderRadius: "999px",
                        overflow: "hidden",
                        border: "1px solid #334155",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${occupancyPercent}%`,
                          backgroundColor:
                            occupancyPercent > 90
                              ? "#ef4444"
                              : occupancyPercent > 65
                              ? "#f59e0b"
                              : "#22c55e",
                          transition: "width 0.3s ease",
                        }}
                      />
                    </div>
                  </div>

                  {/* Facility Chips */}
                  {center.facilities && center.facilities.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", margin: "14px 0" }}>
                      {center.facilities.slice(0, 4).map((f, i) => (
                        <span
                          key={i}
                          style={{
                            backgroundColor: "#0f172a",
                            border: "1px solid #334155",
                            color: "#cbd5e1",
                            padding: "3px 8px",
                            borderRadius: "6px",
                            fontSize: "0.72rem",
                          }}
                        >
                          ✓ {f}
                        </span>
                      ))}
                      {center.facilities.length > 4 && (
                        <span
                          style={{
                            backgroundColor: "#0f172a",
                            color: "#94a3b8",
                            padding: "3px 8px",
                            borderRadius: "6px",
                            fontSize: "0.72rem",
                          }}
                        >
                          +{center.facilities.length - 4} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Card Action Buttons */}
                <div style={{ borderTop: "1px solid #334155", paddingTop: "16px", marginTop: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <Link
                      to={mapUrl}
                      style={{
                        flex: 1,
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                        backgroundColor: "#1d4ed8",
                        color: "#fff",
                        padding: "9px 12px",
                        borderRadius: "8px",
                        textDecoration: "none",
                        fontWeight: "600",
                        fontSize: "0.85rem",
                        textAlign: "center",
                      }}
                    >
                      <span>🗺️</span>
                      <span>Disaster Map Route</span>
                    </Link>

                    <a
                      href={`tel:${center.phone || center.contactNumber || "112"}`}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                        backgroundColor: "#059669",
                        color: "#fff",
                        padding: "9px 14px",
                        borderRadius: "8px",
                        textDecoration: "none",
                        fontWeight: "600",
                        fontSize: "0.85rem",
                      }}
                    >
                      <span>📞</span>
                      <span>Call</span>
                    </a>
                  </div>

                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      onClick={() => setActiveModalCenter(center)}
                      style={{
                        flex: 1,
                        padding: "7px 10px",
                        backgroundColor: "#0f172a",
                        border: "1px solid #334155",
                        borderRadius: "6px",
                        color: "#94a3b8",
                        fontSize: "0.8rem",
                        cursor: "pointer",
                      }}
                    >
                      ℹ️ Details & Facilities
                    </button>

                    <button
                      onClick={() =>
                        navigate(`/evacuation-planner?shelterId=${center.id || center._id}&name=${encodeURIComponent(center.name)}`)
                      }
                      style={{
                        flex: 1,
                        padding: "7px 10px",
                        backgroundColor: "#0f172a",
                        border: "1px solid #0284c7",
                        borderRadius: "6px",
                        color: "#38bdf8",
                        fontSize: "0.8rem",
                        fontWeight: "600",
                        cursor: "pointer",
                      }}
                    >
                      🧭 Evacuate Here
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── DETAIL MODAL ────────────────────────────────────────────────── */}
      {activeModalCenter && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.75)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "16px",
          }}
          onClick={() => setActiveModalCenter(null)}
        >
          <div
            style={{
              backgroundColor: "#0f172a",
              border: "1px solid #334155",
              borderRadius: "16px",
              padding: "24px",
              maxWidth: "540px",
              width: "100%",
              boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
              color: "#fff",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <span
                  style={{
                    backgroundColor: "#0284c7",
                    color: "#fff",
                    fontSize: "0.72rem",
                    padding: "2px 8px",
                    borderRadius: "4px",
                    fontWeight: "700",
                    textTransform: "uppercase",
                  }}
                >
                  {activeModalCenter.type || "Rescue Center"}
                </span>
                <h2 style={{ fontSize: "1.25rem", fontWeight: "700", marginTop: "6px", marginBottom: "4px" }}>
                  {activeModalCenter.name}
                </h2>
              </div>
              <button
                onClick={() => setActiveModalCenter(null)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#94a3b8",
                  fontSize: "1.3rem",
                  cursor: "pointer",
                }}
              >
                ✕
              </button>
            </div>

            <p style={{ color: "#94a3b8", fontSize: "0.85rem", marginTop: "4px" }}>
              📍 {activeModalCenter.address}, {activeModalCenter.city}, {activeModalCenter.state}
            </p>

            <div
              style={{
                backgroundColor: "#1e293b",
                padding: "14px",
                borderRadius: "10px",
                margin: "16px 0",
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
                fontSize: "0.85rem",
              }}
            >
              <div>
                <div style={{ color: "#94a3b8" }}>Total Bed Capacity:</div>
                <div style={{ fontWeight: "700", fontSize: "1.1rem" }}>{activeModalCenter.capacity}</div>
              </div>
              <div>
                <div style={{ color: "#94a3b8" }}>Current Occupancy:</div>
                <div style={{ fontWeight: "700", fontSize: "1.1rem", color: "#38bdf8" }}>
                  {activeModalCenter.currentOccupancy || 0}
                </div>
              </div>
              <div>
                <div style={{ color: "#94a3b8" }}>Contact Helpline:</div>
                <div style={{ fontWeight: "700" }}>{activeModalCenter.phone || activeModalCenter.contactNumber}</div>
              </div>
              <div>
                <div style={{ color: "#94a3b8" }}>Wheelchair Access:</div>
                <div style={{ fontWeight: "700", color: "#4ade80" }}>
                  {activeModalCenter.accessibility !== false ? "✓ Certified Accessible" : "Limited"}
                </div>
              </div>
            </div>

            <h4 style={{ fontSize: "0.95rem", fontWeight: "600", marginBottom: "8px", color: "#38bdf8" }}>
              Verified Facilities & Provisions:
            </h4>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "20px" }}>
              {(activeModalCenter.facilities || []).map((f, i) => (
                <span
                  key={i}
                  style={{
                    backgroundColor: "#1e293b",
                    border: "1px solid #334155",
                    padding: "4px 10px",
                    borderRadius: "6px",
                    fontSize: "0.8rem",
                    color: "#e2e8f0",
                  }}
                >
                  ✓ {f}
                </span>
              ))}
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <Link
                to={`/map?lat=${activeModalCenter.lat}&lng=${activeModalCenter.lng}&name=${encodeURIComponent(activeModalCenter.name || "Rescue Center")}`}
                style={{
                  flex: 1,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  backgroundColor: "#2563eb",
                  color: "#fff",
                  padding: "10px",
                  borderRadius: "8px",
                  fontWeight: "600",
                  fontSize: "0.9rem",
                  textDecoration: "none",
                }}
              >
                🗺️ Navigate on Disaster Map
              </Link>
              <button
                onClick={() => {
                  const c = activeModalCenter;
                  setActiveModalCenter(null);
                  navigate(`/evacuation-planner?shelterId=${c.id || c._id}&name=${encodeURIComponent(c.name)}`);
                }}
                style={{
                  flex: 1,
                  padding: "10px",
                  backgroundColor: "#059669",
                  border: "none",
                  borderRadius: "8px",
                  color: "#fff",
                  fontWeight: "600",
                  fontSize: "0.9rem",
                  cursor: "pointer",
                }}
              >
                🧭 Create Evacuation Plan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}