import React, { useState } from "react";

export default function FamilySafety() {
  const [members, setMembers] = useState([
    { id: 1, name: "Prafulla Kumar Behera", status: "Safe", location: "Home" },
    { id: 2, name: "Santilata Behera",       status: "Safe", location: "Home" }
  ]);
  const [newName, setNewName]         = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [gpsLoading, setGpsLoading]   = useState(false);

  // ── Get real GPS for new-member location ──────────────────────────────────
  const getGPSLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setNewLocation(`${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
        setGpsLoading(false);
      },
      () => {
        alert("Unable to get GPS location. Please enter it manually.");
        setGpsLoading(false);
      },
      { timeout: 8000 }
    );
  };

  const handleAddMember = (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setMembers([
      ...members,
      { id: Date.now(), name: newName, status: "Safe", location: newLocation || "Unknown" }
    ]);
    setNewName("");
    setNewLocation("");
  };

  const toggleStatus = (id) => {
    setMembers(members.map((m) =>
      m.id === id ? { ...m, status: m.status === "Safe" ? "Needs Help" : "Safe" } : m
    ));
  };

  const safeCount  = members.filter((m) => m.status === "Safe").length;
  const alertCount = members.filter((m) => m.status === "Needs Help").length;

  return (
    <div style={{ maxWidth: "900px" }}>
      <h1 style={{ fontSize: "1.8rem", fontWeight: "bold", marginBottom: "0.25rem" }}>
        👨‍👩‍👧 Family Safety
      </h1>
      <p style={{ color: "#94a3b8", marginBottom: "1.5rem" }}>
        Keep track of family members during emergencies.
      </p>

      {/* ── Summary Cards ─────────────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "2rem" }}>
        {[
          { label: "Family Members", value: members.length, color: "#f8fafc" },
          { label: "Safe Members",   value: safeCount,      color: "#22c55e" },
          { label: "Needs Help",     value: alertCount,     color: alertCount > 0 ? "#ef4444" : "#f8fafc" },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ backgroundColor: "#1e293b", padding: "16px", borderRadius: "10px", border: "1px solid #334155" }}>
            <span style={{ color: "#94a3b8", fontSize: "0.875rem" }}>{label}</span>
            <h2 style={{ fontSize: "1.8rem", fontWeight: "bold", color, marginTop: "4px" }}>{value}</h2>
          </div>
        ))}
      </div>

      {/* ── Add Member Form ───────────────────────────────────────────────── */}
      <div style={{ backgroundColor: "#1e293b", padding: "20px", borderRadius: "10px", border: "1px solid #334155", marginBottom: "2rem" }}>
        <h3 style={{ fontSize: "1.1rem", fontWeight: "600", marginBottom: "1rem" }}>
          ➕ Add Family Member
        </h3>
        <form onSubmit={handleAddMember}>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "10px" }}>
            <input
              type="text"
              placeholder="Member Name *"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              required
              style={{ flex: "1 1 180px", padding: "10px 14px", backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: "8px", color: "#fff" }}
            />
            <input
              type="text"
              placeholder="Current Location (or use GPS ↓)"
              value={newLocation}
              onChange={(e) => setNewLocation(e.target.value)}
              style={{ flex: "2 1 240px", padding: "10px 14px", backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: "8px", color: "#fff" }}
            />
          </div>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {/* GPS auto-fill button */}
            <button
              type="button"
              onClick={getGPSLocation}
              disabled={gpsLoading}
              style={{ padding: "10px 18px", backgroundColor: "#0284c7", border: "none", borderRadius: "8px", color: "#fff", fontWeight: "600", cursor: gpsLoading ? "wait" : "pointer", opacity: gpsLoading ? 0.7 : 1 }}
            >
              {gpsLoading ? "📡 Getting GPS..." : "📍 Use My GPS Location"}
            </button>
            <button
              type="submit"
              style={{ padding: "10px 20px", backgroundColor: "#2563eb", border: "none", borderRadius: "8px", color: "#fff", fontWeight: "600", cursor: "pointer" }}
            >
              ➕ Add Member
            </button>
          </div>
          {newLocation && (
            <p style={{ fontSize: "0.8rem", color: "#4ade80", marginTop: "8px" }}>
              📍 Location set: {newLocation}
            </p>
          )}
        </form>
      </div>

      {/* ── Family Tracking List ──────────────────────────────────────────── */}
      <h3 style={{ fontSize: "1.2rem", fontWeight: "600", marginBottom: "1rem" }}>
        👁️ Family Tracking
      </h3>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {members.map((member) => (
          <div
            key={member.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              backgroundColor: "#1e293b",
              padding: "14px 18px",
              borderRadius: "10px",
              border: `1px solid ${member.status === "Safe" ? "#166534" : "#991b1b"}`,
            }}
          >
            <div>
              <div style={{ fontWeight: "600", fontSize: "1rem" }}>{member.name}</div>
              <div style={{ color: "#94a3b8", fontSize: "0.85rem" }}>
                📍 {member.location.includes(",")
                  ? (
                    <a
                      href={`https://maps.google.com/?q=${member.location}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "#38bdf8", textDecoration: "underline" }}
                    >
                      {member.location} (View on Map)
                    </a>
                  )
                  : member.location}
              </div>
            </div>
            <button
              onClick={() => toggleStatus(member.id)}
              style={{
                padding: "6px 14px",
                borderRadius: "20px",
                border: "none",
                fontWeight: "600",
                fontSize: "0.85rem",
                cursor: "pointer",
                backgroundColor: member.status === "Safe" ? "#166534" : "#991b1b",
                color:           member.status === "Safe" ? "#4ade80"  : "#fca5a5",
              }}
            >
              {member.status === "Safe" ? "✅ Safe" : "🆘 Needs Help"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}