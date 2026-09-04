import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  getFamilyMembers,
  addFamilyMember,
  toggleMemberSafety,
  removeFamilyMember,
} from "../services/disasterService";

const RELATIONSHIPS = [
  "Father",
  "Mother",
  "Spouse",
  "Child",
  "Son",
  "Daughter",
  "Brother",
  "Sister",
  "Grandparent",
  "Relative",
  "Friend",
  "Neighbor",
];

const BLOOD_GROUPS = ["Unknown", "A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

export default function FamilySafety() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [name, setName] = useState("");
  const [relation, setRelation] = useState("Parent");
  const [phone, setPhone] = useState("");
  const [bloodGroup, setBloodGroup] = useState("Unknown");
  const [location, setLocation] = useState("");
  const [coordinates, setCoordinates] = useState("");
  const [gpsLoading, setGpsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [broadcastMsg, setBroadcastMsg] = useState("");

  // Load family members on mount
  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    setLoading(true);
    try {
      const data = await getFamilyMembers();
      setMembers(data);
    } catch (err) {
      console.error("Failed to load family members:", err);
    } finally {
      setLoading(false);
    }
  };

  // Get real GPS coordinates
  const detectGPS = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const coordsStr = `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
        setCoordinates(coordsStr);
        if (!location) {
          setLocation(`GPS: ${coordsStr}`);
        }
        setGpsLoading(false);
      },
      () => {
        alert("Unable to fetch GPS position. Please enter location manually.");
        setGpsLoading(false);
      },
      { timeout: 8000 }
    );
  };

  // Handle Add Member
  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    try {
      const updated = await addFamilyMember({
        name,
        relation,
        phone,
        bloodGroup,
        location: location || "Location not specified",
        coordinates,
        status: "Safe",
      });
      setMembers(updated);
      setName("");
      setPhone("");
      setLocation("");
      setCoordinates("");
      setBloodGroup("Unknown");
    } catch (err) {
      console.error("Error adding family member:", err);
      alert("Failed to save member. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle Safety Status
  const handleToggleStatus = async (member) => {
    const newStatus = member.status === "Safe" ? "Needs Help" : "Safe";
    try {
      const updated = await toggleMemberSafety(member.id || member._id, newStatus);
      setMembers(updated);
    } catch (err) {
      console.error("Error toggling safety:", err);
    }
  };

  // Delete Member
  const handleDelete = async (member) => {
    if (!window.confirm(`Are you sure you want to remove ${member.name} from Family Safety?`)) {
      return;
    }
    try {
      const updated = await removeFamilyMember(member.id || member._id);
      setMembers(updated);
    } catch (err) {
      console.error("Error deleting member:", err);
    }
  };

  // Mark all safe
  const markAllSafe = async () => {
    try {
      let current = [...members];
      for (const m of current) {
        if (m.status !== "Safe") {
          current = await toggleMemberSafety(m.id || m._id, "Safe");
        }
      }
      setMembers(current);
      setBroadcastMsg("✅ Entire family marked safe!");
      setTimeout(() => setBroadcastMsg(""), 4000);
    } catch (err) {
      console.error("Error marking all safe:", err);
    }
  };

  // Send WhatsApp Ping
  const sendWhatsAppPing = (member) => {
    const cleanPhone = (member.phone || "").replace(/\D/g, "");
    if (!cleanPhone) {
      alert("No phone number saved for this member.");
      return;
    }
    const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const msg = encodeURIComponent(
      `🚨 EMERGENCY DISASTER SAFETY CHECK:\nHi ${member.name}, I am checking on your safety during the current disaster alert. Please reply: Are you SAFE or do you NEED HELP? Current timestamp: ${new Date().toLocaleTimeString()}`
    );
    window.open(`https://wa.me/${formattedPhone}?text=${msg}`, "_blank");
  };

  const safeCount = members.filter((m) => m.status === "Safe").length;
  const alertCount = members.filter((m) => m.status === "Needs Help").length;
  const pendingCount = members.length - safeCount - alertCount;

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "10px 0" }}>
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
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "2rem" }}>👨‍👩‍👧‍👦</span>
            <h1 style={{ fontSize: "1.9rem", fontWeight: "800", margin: 0, color: "#f8fafc" }}>
              Family Safety Tracker
            </h1>
          </div>
          <p style={{ color: "#94a3b8", marginTop: "6px", fontSize: "0.95rem" }}>
            Monitor real-time safety status, locations, blood groups, and emergency contacts of your family.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button
            onClick={markAllSafe}
            style={{
              padding: "10px 18px",
              backgroundColor: "#166534",
              border: "1px solid #22c55e",
              borderRadius: "10px",
              color: "#86efac",
              fontWeight: "700",
              fontSize: "0.85rem",
              cursor: "pointer",
            }}
          >
            ✅ Mark All Safe
          </button>
        </div>
      </div>

      {broadcastMsg && (
        <div
          style={{
            backgroundColor: "#064e3b",
            border: "1px solid #10b981",
            color: "#6ee7b7",
            padding: "12px 18px",
            borderRadius: "10px",
            marginBottom: "20px",
            fontWeight: "600",
          }}
        >
          {broadcastMsg}
        </div>
      )}

      {/* ── SUMMARY STATS ───────────────────────────────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
          gap: "16px",
          marginBottom: "28px",
        }}
      >
        <div style={{ backgroundColor: "#1e293b", padding: "18px", borderRadius: "12px", border: "1px solid #334155" }}>
          <span style={{ color: "#94a3b8", fontSize: "0.8rem", fontWeight: "600", textTransform: "uppercase" }}>
            Total Members
          </span>
          <div style={{ fontSize: "1.8rem", fontWeight: "800", color: "#f8fafc", marginTop: "4px" }}>
            {members.length}
          </div>
          <div style={{ fontSize: "0.8rem", color: "#94a3b8", marginTop: "4px" }}>Registered in Network</div>
        </div>

        <div style={{ backgroundColor: "#1e293b", padding: "18px", borderRadius: "12px", border: "1px solid #334155" }}>
          <span style={{ color: "#94a3b8", fontSize: "0.8rem", fontWeight: "600", textTransform: "uppercase" }}>
            Confirmed Safe
          </span>
          <div style={{ fontSize: "1.8rem", fontWeight: "800", color: "#22c55e", marginTop: "4px" }}>
            {safeCount}
          </div>
          <div style={{ fontSize: "0.8rem", color: "#4ade80", marginTop: "4px" }}>Verified OK</div>
        </div>

        <div style={{ backgroundColor: "#1e293b", padding: "18px", borderRadius: "12px", border: "1px solid #334155" }}>
          <span style={{ color: "#94a3b8", fontSize: "0.8rem", fontWeight: "600", textTransform: "uppercase" }}>
            Needs Help / SOS
          </span>
          <div style={{ fontSize: "1.8rem", fontWeight: "800", color: alertCount > 0 ? "#ef4444" : "#f8fafc", marginTop: "4px" }}>
            {alertCount}
          </div>
          <div style={{ fontSize: "0.8rem", color: alertCount > 0 ? "#f87171" : "#94a3b8", marginTop: "4px" }}>
            {alertCount > 0 ? "⚠️ Immediate Attention" : "None in danger"}
          </div>
        </div>

        <div style={{ backgroundColor: "#1e293b", padding: "18px", borderRadius: "12px", border: "1px solid #334155" }}>
          <span style={{ color: "#94a3b8", fontSize: "0.8rem", fontWeight: "600", textTransform: "uppercase" }}>
            Status
          </span>
          <div style={{ fontSize: "1.2rem", fontWeight: "800", color: alertCount > 0 ? "#ef4444" : "#22c55e", marginTop: "8px" }}>
            {alertCount > 0 ? "🚨 SOS ACTIVE" : "🟢 ALL SECURE"}
          </div>
          <div style={{ fontSize: "0.8rem", color: "#94a3b8", marginTop: "4px" }}>Real-time sync</div>
        </div>
      </div>

      {/* ── ADD MEMBER FORM ─────────────────────────────────────────────── */}
      <div
        style={{
          backgroundColor: "#1e293b",
          padding: "24px",
          borderRadius: "14px",
          border: "1px solid #334155",
          marginBottom: "32px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
        }}
      >
        <h3 style={{ fontSize: "1.15rem", fontWeight: "700", margin: "0 0 16px 0", color: "#f8fafc", display: "flex", alignItems: "center", gap: "8px" }}>
          <span>➕</span>
          <span>Register Family Member</span>
        </h3>

        <form onSubmit={handleAddMember}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px", marginBottom: "14px" }}>
            <div>
              <label style={{ fontSize: "0.8rem", color: "#94a3b8", display: "block", marginBottom: "4px" }}>
                Full Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Ramesh Behera"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
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

            <div>
              <label style={{ fontSize: "0.8rem", color: "#94a3b8", display: "block", marginBottom: "4px" }}>
                Relationship
              </label>
              <select
                value={relation}
                onChange={(e) => setRelation(e.target.value)}
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
              >
                {RELATIONSHIPS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: "0.8rem", color: "#94a3b8", display: "block", marginBottom: "4px" }}>
                Mobile Number (for SOS & WhatsApp)
              </label>
              <input
                type="tel"
                placeholder="e.g. 9861012345"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
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

            <div>
              <label style={{ fontSize: "0.8rem", color: "#94a3b8", display: "block", marginBottom: "4px" }}>
                Blood Group (Medical Rescue)
              </label>
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
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
              >
                {BLOOD_GROUPS.map((bg) => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "12px", alignItems: "center", marginBottom: "16px" }}>
            <div>
              <label style={{ fontSize: "0.8rem", color: "#94a3b8", display: "block", marginBottom: "4px" }}>
                Current Known Location / Area
              </label>
              <input
                type="text"
                placeholder="e.g. KIIT Square, Patia, Bhubaneswar or use GPS"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
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

            <button
              type="button"
              onClick={detectGPS}
              disabled={gpsLoading}
              style={{
                marginTop: "20px",
                padding: "10px 16px",
                backgroundColor: "#0284c7",
                border: "none",
                borderRadius: "8px",
                color: "#fff",
                fontWeight: "600",
                fontSize: "0.85rem",
                cursor: gpsLoading ? "wait" : "pointer",
                whiteSpace: "nowrap",
              }}
            >
              {gpsLoading ? "📡 Locating..." : "📍 Auto GPS"}
            </button>
          </div>

          {coordinates && (
            <div style={{ fontSize: "0.8rem", color: "#4ade80", marginBottom: "12px" }}>
              ✓ GPS Lat/Long captured: {coordinates}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            style={{
              padding: "11px 24px",
              backgroundColor: "#2563eb",
              border: "none",
              borderRadius: "8px",
              color: "#fff",
              fontWeight: "700",
              fontSize: "0.92rem",
              cursor: submitting ? "wait" : "pointer",
            }}
          >
            {submitting ? "Saving..." : "➕ Add to Family Network"}
          </button>
        </form>
      </div>

      {/* ── FAMILY MEMBERS LIST ─────────────────────────────────────────── */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h3 style={{ fontSize: "1.25rem", fontWeight: "700", margin: 0, color: "#f8fafc" }}>
            👥 Tracked Family Members ({members.length})
          </h3>
          <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>
            Saved persistently & synced
          </span>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#60a5fa" }}>
            ⏳ Loading family tracking network...
          </div>
        ) : members.length === 0 ? (
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
            <div style={{ fontSize: "2.5rem", marginBottom: "8px" }}>👨‍👩‍👧</div>
            <h4>No family members registered yet</h4>
            <p style={{ fontSize: "0.9rem" }}>Use the form above to add your family for emergency tracking.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {members.map((member) => {
              const isSafe = member.status === "Safe";
              const coordParts = member.coordinates && member.coordinates.includes(",") ? member.coordinates.split(",") : null;
              const inAppMapUrl = coordParts && coordParts.length === 2
                ? `/map?lat=${coordParts[0].trim()}&lng=${coordParts[1].trim()}&name=${encodeURIComponent(member.name)}`
                : `/map?name=${encodeURIComponent(member.location || member.name)}`;

              return (
                <div
                  key={member.id || member._id}
                  style={{
                    backgroundColor: "#1e293b",
                    borderRadius: "12px",
                    border: `1.5px solid ${isSafe ? "#166534" : "#ef4444"}`,
                    padding: "18px 22px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "16px",
                    boxShadow: isSafe ? "none" : "0 4px 20px rgba(239,68,68,0.25)",
                    transition: "all 0.2s",
                  }}
                >
                  {/* Left info */}
                  <div style={{ flex: "1 1 280px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                      <span style={{ fontSize: "1.15rem", fontWeight: "700", color: "#f8fafc" }}>
                        {member.name}
                      </span>
                      <span
                        style={{
                          backgroundColor: "#0f172a",
                          border: "1px solid #334155",
                          color: "#93c5fd",
                          padding: "2px 8px",
                          borderRadius: "4px",
                          fontSize: "0.75rem",
                          fontWeight: "600",
                        }}
                      >
                        {member.relation || "Family"}
                      </span>
                      {member.bloodGroup && member.bloodGroup !== "Unknown" && (
                        <span
                          style={{
                            backgroundColor: "#881337",
                            color: "#fecdd3",
                            padding: "2px 8px",
                            borderRadius: "4px",
                            fontSize: "0.75rem",
                            fontWeight: "700",
                          }}
                        >
                          🩸 {member.bloodGroup}
                        </span>
                      )}
                    </div>

                    <div style={{ color: "#94a3b8", fontSize: "0.85rem", marginTop: "6px", display: "flex", flexWrap: "wrap", gap: "12px" }}>
                      <span>
                        📍 Location:{" "}
                        <Link
                          to={inAppMapUrl}
                          style={{ color: "#38bdf8", textDecoration: "underline", fontWeight: "600" }}
                        >
                          {member.location || "View on Disaster Map"}
                        </Link>
                      </span>
                      {member.phone && (
                        <span>
                          📞 <strong>{member.phone}</strong>
                        </span>
                      )}
                      {member.lastUpdated && (
                        <span style={{ color: "#64748b" }}>
                          ⏱️ {member.lastUpdated}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                    {/* Toggle Status */}
                    <button
                      onClick={() => handleToggleStatus(member)}
                      style={{
                        padding: "8px 16px",
                        borderRadius: "8px",
                        border: "none",
                        fontWeight: "700",
                        fontSize: "0.85rem",
                        cursor: "pointer",
                        backgroundColor: isSafe ? "#166534" : "#991b1b",
                        color: isSafe ? "#86efac" : "#fca5a5",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <span>{isSafe ? "✅" : "🆘"}</span>
                      <span>{isSafe ? "Marked Safe" : "Needs Help"}</span>
                    </button>

                    {/* WhatsApp Ping */}
                    {member.phone && (
                      <button
                        onClick={() => sendWhatsAppPing(member)}
                        title="Send WhatsApp Safety Check"
                        style={{
                          padding: "8px 12px",
                          borderRadius: "8px",
                          border: "none",
                          backgroundColor: "#25d366",
                          color: "#000",
                          fontWeight: "700",
                          fontSize: "0.85rem",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <span>💬</span>
                        <span>Check-In</span>
                      </button>
                    )}

                    {/* Call Direct */}
                    {member.phone && (
                      <a
                        href={`tel:${member.phone}`}
                        title="Call Member"
                        style={{
                          padding: "8px 12px",
                          borderRadius: "8px",
                          backgroundColor: "#0284c7",
                          color: "#fff",
                          fontWeight: "600",
                          fontSize: "0.85rem",
                          textDecoration: "none",
                          display: "inline-flex",
                          alignItems: "center",
                        }}
                      >
                        📞
                      </a>
                    )}

                    {/* Delete */}
                    <button
                      onClick={() => handleDelete(member)}
                      title="Remove Member"
                      style={{
                        background: "none",
                        border: "none",
                        color: "#64748b",
                        fontSize: "1.1rem",
                        cursor: "pointer",
                        padding: "6px",
                      }}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}