import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  getFamilyMembers,
  addFamilyMember,
  toggleMemberSafety,
  removeFamilyMember,
  ACTIVE_DANGER_ZONES,
  DEFAULT_SHELTERS,
  checkMemberInDangerZone,
  findNearestSafeShelter,
  parseMemberCoordinates,
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

  // Disaster & Siren Buzzer States
  const [disasterTrackingActive, setDisasterTrackingActive] = useState(true);
  const [selectedDisasterId, setSelectedDisasterId] = useState("all");
  const [sirenPlaying, setSirenPlaying] = useState(false);
  const [sirenMuted, setSirenMuted] = useState(false);
  const [audioPromptNeeded, setAudioPromptNeeded] = useState(false);

  // Web Audio Refs for Siren Buzzer ("syrol")
  const audioCtxRef = useRef(null);
  const oscRef = useRef(null);
  const gainRef = useRef(null);
  const sirenIntervalRef = useRef(null);

  // Load family members on mount
  useEffect(() => {
    loadMembers();
    return () => {
      stopSiren();
    };
  }, []);

  // ── Web Audio Emergency Siren Buzzer ("syrol") ───────────────────────────
  const startSiren = () => {
    if (sirenMuted) return;
    try {
      if (oscRef.current) return; // already active

      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;

      const ctx = new AudioContext();
      if (ctx.state === "suspended") {
        setAudioPromptNeeded(true);
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(750, ctx.currentTime);
      gain.gain.setValueAtTime(0.18, ctx.currentTime);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();

      let high = true;
      const interval = setInterval(() => {
        if (!oscRef.current || ctx.state === "closed") return;
        const targetFreq = high ? 1180 : 680;
        try {
          osc.frequency.exponentialRampToValueAtTime(targetFreq, ctx.currentTime + 0.35);
        } catch {}
        high = !high;
      }, 420);

      audioCtxRef.current = ctx;
      oscRef.current = osc;
      gainRef.current = gain;
      sirenIntervalRef.current = interval;
      setSirenPlaying(true);
      setAudioPromptNeeded(false);

      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate([400, 150, 400, 150, 600]);
      }
    } catch (err) {
      console.warn("Unable to start siren buzzer automatically:", err);
      setAudioPromptNeeded(true);
    }
  };

  const stopSiren = () => {
    try {
      if (sirenIntervalRef.current) {
        clearInterval(sirenIntervalRef.current);
        sirenIntervalRef.current = null;
      }
      if (oscRef.current) {
        oscRef.current.stop();
        oscRef.current.disconnect();
        oscRef.current = null;
      }
      if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
        audioCtxRef.current.close().catch(() => {});
        audioCtxRef.current = null;
      }
    } catch (err) {}
    setSirenPlaying(false);
  };

  const toggleSirenMute = () => {
    if (sirenPlaying) {
      stopSiren();
      setSirenMuted(true);
    } else {
      setSirenMuted(false);
      startSiren();
    }
  };

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

  // Filter active danger zones
  const activeZones = selectedDisasterId === "all"
    ? ACTIVE_DANGER_ZONES
    : ACTIVE_DANGER_ZONES.filter((z) => z.id === selectedDisasterId);

  // ── Evaluate Members Against Active Danger Zones ─────────────────────────
  const evaluatedMembers = members.map((member) => {
    if (!disasterTrackingActive) {
      return {
        ...member,
        inDanger: false,
        dangerZone: null,
        nearestShelter: null,
        effectiveStatus: member.status,
      };
    }

    const evaluation = checkMemberInDangerZone(member, activeZones);
    const inDanger = evaluation.inDanger;
    const nearestShelter = inDanger
      ? findNearestSafeShelter(evaluation.memberCoords, DEFAULT_SHELTERS, evaluation.dangerZone)
      : null;

    return {
      ...member,
      inDanger,
      dangerZone: evaluation.dangerZone,
      distanceToEpicenterKm: evaluation.distanceToEpicenterKm,
      memberCoords: evaluation.memberCoords,
      nearestShelter,
      // Automatic change to UNSAFE when present in danger zone!
      effectiveStatus: inDanger ? "Unsafe" : member.status,
    };
  });

  const dangerCount = evaluatedMembers.filter((m) => m.inDanger).length;
  const safeCount = evaluatedMembers.filter((m) => !m.inDanger && m.effectiveStatus === "Safe").length;
  const alertCount = evaluatedMembers.filter((m) => m.inDanger || m.effectiveStatus === "Needs Help").length;

  // Automatically buzz siren when any member is detected in danger
  useEffect(() => {
    if (dangerCount > 0 && !sirenPlaying && !sirenMuted) {
      startSiren();
    } else if (dangerCount === 0 && sirenPlaying) {
      stopSiren();
    }
  }, [dangerCount, disasterTrackingActive, sirenMuted]);

  return (
    <div style={{ maxWidth: "1050px", margin: "0 auto", padding: "10px 0" }}>
      {/* ── HEADER ──────────────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: "16px",
          marginBottom: "20px",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "2.3rem" }}>👨‍👩‍👧‍👦</span>
            <div>
              <h1 style={{ fontSize: "1.9rem", fontWeight: "800", margin: 0, color: "#f8fafc" }}>
                Family Safety Tracker & Danger Radar
              </h1>
              <p style={{ color: "#94a3b8", marginTop: "4px", fontSize: "0.95rem" }}>
                Automated danger zone tracking, emergency buzzer siren alert, and nearest safe refuge routing.
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
          {/* Siren Buzzer Sound / Mute Button */}
          <button
            onClick={toggleSirenMute}
            style={{
              padding: "10px 18px",
              backgroundColor: sirenPlaying ? "#dc2626" : "#1e293b",
              border: `1.5px solid ${sirenPlaying ? "#f87171" : "#475569"}`,
              borderRadius: "10px",
              color: "#ffffff",
              fontWeight: "700",
              fontSize: "0.85rem",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              boxShadow: sirenPlaying ? "0 0 16px rgba(220, 38, 38, 0.7)" : "none",
              transition: "all 0.2s ease",
            }}
          >
            <span>{sirenPlaying ? "🔊" : "🔇"}</span>
            <span>{sirenPlaying ? "Mute Buzzer Siren" : "Test Audio Siren"}</span>
          </button>

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

      {/* ── BROADCAST MESSAGE ───────────────────────────────────────────── */}
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

      {/* ── AUDIO USER GESTURE PROMPT (If browser autoplay blocked) ──────── */}
      {audioPromptNeeded && (
        <div
          style={{
            backgroundColor: "#7f1d1d",
            border: "2px solid #ef4444",
            color: "#ffffff",
            padding: "12px 18px",
            borderRadius: "10px",
            marginBottom: "20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "10px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "1.4rem" }}>📢</span>
            <span style={{ fontSize: "0.9rem", fontWeight: "600" }}>
              Family member is inside an active disaster danger zone! Click to enable emergency audio buzzer.
            </span>
          </div>
          <button
            onClick={startSiren}
            style={{
              padding: "8px 16px",
              backgroundColor: "#ffffff",
              color: "#991b1b",
              fontWeight: "800",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            🔊 Enable Audio Buzzer
          </button>
        </div>
      )}

      {/* ── DANGER TRACKING & DISASTER SIMULATION CONTROL BAR ─────────────── */}
      <div
        style={{
          backgroundColor: dangerCount > 0 ? "rgba(127, 29, 29, 0.4)" : "#1e293b",
          border: `1.5px solid ${dangerCount > 0 ? "#ef4444" : "#334155"}`,
          borderRadius: "14px",
          padding: "18px 22px",
          marginBottom: "24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
          boxShadow: dangerCount > 0 ? "0 0 25px rgba(239, 68, 68, 0.3)" : "none",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap" }}>
          <div
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "50%",
              backgroundColor: dangerCount > 0 ? "#dc2626" : "#0284c7",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.4rem",
              animation: dangerCount > 0 ? "pulse 1.2s infinite" : "none",
            }}
          >
            {dangerCount > 0 ? "🚨" : "📡"}
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <strong style={{ color: dangerCount > 0 ? "#fca5a5" : "#f8fafc", fontSize: "1.05rem" }}>
                {dangerCount > 0
                  ? `🚨 CRITICAL ALERT: ${dangerCount} Member(s) Inside Disaster Danger Zone!`
                  : "🛡️ Automated Danger Tracking Radar: All Clear"}
              </strong>
              {sirenPlaying && (
                <span
                  style={{
                    backgroundColor: "#dc2626",
                    color: "#fff",
                    padding: "2px 8px",
                    borderRadius: "12px",
                    fontSize: "0.72rem",
                    fontWeight: "800",
                    letterSpacing: "1px",
                  }}
                >
                  SIREN BUZZING
                </span>
              )}
            </div>
            <p style={{ margin: "4px 0 0 0", fontSize: "0.83rem", color: "#94a3b8" }}>
              Tracking coordinates against active cyclone, flood, and landslide hazard perimeters.
            </p>
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>Hazard:</span>
            <select
              value={selectedDisasterId}
              onChange={(e) => setSelectedDisasterId(e.target.value)}
              style={{
                backgroundColor: "#0f172a",
                border: "1px solid #334155",
                color: "#ffffff",
                padding: "8px 12px",
                borderRadius: "8px",
                fontSize: "0.82rem",
                outline: "none",
              }}
            >
              <option value="all">All Active Hazard Zones ({ACTIVE_DANGER_ZONES.length})</option>
              {ACTIVE_DANGER_ZONES.map((z) => (
                <option key={z.id} value={z.id}>
                  {z.name} ({z.type})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => {
              const nextState = !disasterTrackingActive;
              setDisasterTrackingActive(nextState);
              if (!nextState) stopSiren();
            }}
            style={{
              padding: "8px 16px",
              backgroundColor: disasterTrackingActive ? "#7c2d12" : "#1e293b",
              border: `1.5px solid ${disasterTrackingActive ? "#f97316" : "#475569"}`,
              color: disasterTrackingActive ? "#fed7aa" : "#94a3b8",
              borderRadius: "8px",
              fontWeight: "700",
              fontSize: "0.82rem",
              cursor: "pointer",
            }}
          >
            {disasterTrackingActive ? "⚡ Disaster Radar: LIVE" : "⚪ Danger Radar: OFF"}
          </button>
        </div>
      </div>

      {/* ── SUMMARY STATS ───────────────────────────────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "16px",
          marginBottom: "28px",
        }}
      >
        <div style={{ backgroundColor: "#1e293b", padding: "18px", borderRadius: "12px", border: "1px solid #334155" }}>
          <span style={{ color: "#94a3b8", fontSize: "0.8rem", fontWeight: "600", textTransform: "uppercase" }}>
            Total Registered
          </span>
          <div style={{ fontSize: "1.8rem", fontWeight: "800", color: "#f8fafc", marginTop: "4px" }}>
            {members.length}
          </div>
          <div style={{ fontSize: "0.8rem", color: "#94a3b8", marginTop: "4px" }}>In Safety Network</div>
        </div>

        <div style={{ backgroundColor: "#1e293b", padding: "18px", borderRadius: "12px", border: "1px solid #334155" }}>
          <span style={{ color: "#94a3b8", fontSize: "0.8rem", fontWeight: "600", textTransform: "uppercase" }}>
            Confirmed Safe
          </span>
          <div style={{ fontSize: "1.8rem", fontWeight: "800", color: "#22c55e", marginTop: "4px" }}>
            {safeCount}
          </div>
          <div style={{ fontSize: "0.8rem", color: "#4ade80", marginTop: "4px" }}>Outside Danger Zones</div>
        </div>

        <div
          style={{
            backgroundColor: dangerCount > 0 ? "#3b0707" : "#1e293b",
            padding: "18px",
            borderRadius: "12px",
            border: `1.5px solid ${dangerCount > 0 ? "#ef4444" : "#334155"}`,
            boxShadow: dangerCount > 0 ? "0 0 15px rgba(239, 68, 68, 0.25)" : "none",
          }}
        >
          <span style={{ color: dangerCount > 0 ? "#fca5a5" : "#94a3b8", fontSize: "0.8rem", fontWeight: "600", textTransform: "uppercase" }}>
            In Danger Zone (Unsafe)
          </span>
          <div style={{ fontSize: "1.8rem", fontWeight: "800", color: dangerCount > 0 ? "#ef4444" : "#f8fafc", marginTop: "4px" }}>
            {dangerCount}
          </div>
          <div style={{ fontSize: "0.8rem", color: dangerCount > 0 ? "#f87171" : "#94a3b8", marginTop: "4px" }}>
            {dangerCount > 0 ? "⚠️ Auto-Flagged Unsafe" : "None in danger"}
          </div>
        </div>

        <div style={{ backgroundColor: "#1e293b", padding: "18px", borderRadius: "12px", border: "1px solid #334155" }}>
          <span style={{ color: "#94a3b8", fontSize: "0.8rem", fontWeight: "600", textTransform: "uppercase" }}>
            Radar Status
          </span>
          <div style={{ fontSize: "1.2rem", fontWeight: "800", color: dangerCount > 0 ? "#ef4444" : "#22c55e", marginTop: "8px" }}>
            {dangerCount > 0 ? "🚨 ALERT ACTIVE" : "🟢 ALL SECURE"}
          </div>
          <div style={{ fontSize: "0.8rem", color: "#94a3b8", marginTop: "4px" }}>Active GPS Perimeter</div>
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
        ) : evaluatedMembers.length === 0 ? (
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
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {evaluatedMembers.map((member) => {
              const inDanger = member.inDanger;
              const isSafe = !inDanger && member.effectiveStatus === "Safe";
              const coords = member.memberCoords || parseMemberCoordinates(member);

              // Evacuation Route to Nearest Safe Shelter Link
              const evacRouteUrl = member.nearestShelter && coords
                ? `/map?evac=1&originLat=${coords.lat}&originLng=${coords.lng}&destLat=${member.nearestShelter.lat}&destLng=${member.nearestShelter.lng}&shelterName=${encodeURIComponent(member.nearestShelter.name)}&hazard=${encodeURIComponent(member.dangerZone?.name || "Active Hazard Zone")}&name=${encodeURIComponent(member.name)}`
                : coords
                ? `/map?lat=${coords.lat}&lng=${coords.lng}&name=${encodeURIComponent(member.name)}`
                : `/map?name=${encodeURIComponent(member.location || member.name)}`;

              return (
                <div
                  key={member.id || member._id}
                  style={{
                    backgroundColor: inDanger ? "#2a0d0d" : "#1e293b",
                    borderRadius: "14px",
                    border: `2px solid ${inDanger ? "#ef4444" : isSafe ? "#166534" : "#f59e0b"}`,
                    padding: "20px 24px",
                    boxShadow: inDanger
                      ? "0 0 30px rgba(239, 68, 68, 0.35)"
                      : isSafe
                      ? "none"
                      : "0 4px 20px rgba(245, 158, 11, 0.2)",
                    transition: "all 0.3s ease",
                  }}
                >
                  {/* Top Bar inside Member Card */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: "14px",
                    }}
                  >
                    {/* Left: Member Name, Symbol Badge & Tags */}
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                      {/* Avatar / Danger Symbol */}
                      <div
                        style={{
                          width: "46px",
                          height: "46px",
                          borderRadius: "50%",
                          backgroundColor: inDanger ? "#ef4444" : isSafe ? "#166534" : "#b45309",
                          color: "#ffffff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "1.5rem",
                          border: "2px solid #ffffff",
                          boxShadow: inDanger ? "0 0 16px rgba(239, 68, 68, 0.8)" : "none",
                        }}
                      >
                        {inDanger ? "⚠️" : isSafe ? "👤" : "🆘"}
                      </div>

                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                          <span style={{ fontSize: "1.2rem", fontWeight: "800", color: "#f8fafc" }}>
                            {member.name}
                          </span>

                          {/* AUTOMATIC SYMBOL CHANGE: UNSAFE when in danger zone */}
                          {inDanger ? (
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "6px",
                                backgroundColor: "#7f1d1d",
                                border: "1.5px solid #ef4444",
                                color: "#fecaca",
                                padding: "4px 10px",
                                borderRadius: "20px",
                                fontSize: "0.78rem",
                                fontWeight: "900",
                                letterSpacing: "0.5px",
                                boxShadow: "0 0 12px rgba(239, 68, 68, 0.6)",
                              }}
                            >
                              <span>🚨</span>
                              <span>UNSAFE (IN DANGER ZONE)</span>
                            </span>
                          ) : (
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px",
                                backgroundColor: isSafe ? "#14532d" : "#78350f",
                                border: `1px solid ${isSafe ? "#22c55e" : "#f59e0b"}`,
                                color: isSafe ? "#86efac" : "#fde68a",
                                padding: "3px 10px",
                                borderRadius: "20px",
                                fontSize: "0.78rem",
                                fontWeight: "700",
                              }}
                            >
                              <span>{isSafe ? "✅" : "⚠️"}</span>
                              <span>{isSafe ? "CONFIRMED SAFE" : "NEEDS HELP"}</span>
                            </span>
                          )}

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
                            <span style={{ color: inDanger ? "#fca5a5" : "#e2e8f0", fontWeight: "600" }}>
                              {member.location || "Coordinates registered"}
                            </span>
                          </span>
                          {member.phone && (
                            <span>
                              📞 <strong>{member.phone}</strong>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right Action Buttons */}
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                      {/* Manual Status Toggle */}
                      <button
                        onClick={() => handleToggleStatus(member)}
                        style={{
                          padding: "8px 14px",
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

                  {/* ── DANGER ZONE ALERT & RESPONSE MAP CONNECT BAR ───────── */}
                  {inDanger && member.dangerZone && (
                    <div
                      style={{
                        marginTop: "16px",
                        padding: "16px",
                        backgroundColor: "rgba(153, 27, 27, 0.35)",
                        border: "1.5px solid #dc2626",
                        borderRadius: "10px",
                        boxShadow: "0 4px 18px rgba(220, 38, 38, 0.25)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          flexWrap: "wrap",
                          gap: "12px",
                          marginBottom: "10px",
                        }}
                      >
                        <div>
                          <div style={{ color: "#fecaca", fontWeight: "800", fontSize: "0.95rem", display: "flex", alignItems: "center", gap: "8px" }}>
                            <span>⚠️</span>
                            <span>IN DANGER ZONE: {member.dangerZone.name}</span>
                            <span
                              style={{
                                backgroundColor: "#ef4444",
                                color: "#ffffff",
                                padding: "2px 8px",
                                borderRadius: "4px",
                                fontSize: "0.72rem",
                                fontWeight: "800",
                              }}
                            >
                              {member.dangerZone.severity} {member.dangerZone.type}
                            </span>
                          </div>
                          <p style={{ margin: "4px 0 0 0", fontSize: "0.83rem", color: "#fca5a5" }}>
                            {member.dangerZone.description} • Approximate distance to hazard epicenter:{" "}
                            <strong>{member.distanceToEpicenterKm} km</strong> (Danger radius: {member.dangerZone.radiusKm} km)
                          </p>
                          <p style={{ margin: "4px 0 0 0", fontSize: "0.82rem", color: "#fdba74" }}>
                            📢 <strong>Advisory:</strong> {member.dangerZone.advisory}
                          </p>
                        </div>
                      </div>

                      {/* Nearest Safe Refuge & Direct Connect to Response Map Button */}
                      {member.nearestShelter && (
                        <div
                          style={{
                            marginTop: "12px",
                            paddingTop: "12px",
                            borderTop: "1px dashed rgba(239, 68, 68, 0.5)",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            flexWrap: "wrap",
                            gap: "12px",
                          }}
                        >
                          <div>
                            <div style={{ fontSize: "0.88rem", color: "#86efac", fontWeight: "700" }}>
                              🛡️ Nearest Safe Location: {member.nearestShelter.name}
                            </div>
                            <div style={{ fontSize: "0.8rem", color: "#cbd5e1", marginTop: "2px" }}>
                              📍 Distance: <strong>{member.nearestShelter.distToMember} km</strong> • Address: {member.nearestShelter.address} • Phone: {member.nearestShelter.phone}
                            </div>
                          </div>

                          <Link
                            to={evacRouteUrl}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "8px",
                              backgroundColor: "#dc2626",
                              color: "#ffffff",
                              padding: "10px 18px",
                              borderRadius: "8px",
                              textDecoration: "none",
                              fontWeight: "800",
                              fontSize: "0.85rem",
                              boxShadow: "0 0 20px rgba(220, 38, 38, 0.6)",
                              transition: "transform 0.15s, background-color 0.15s",
                            }}
                          >
                            <span>🗺️</span>
                            <span>Connect to Response Map →</span>
                          </Link>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}