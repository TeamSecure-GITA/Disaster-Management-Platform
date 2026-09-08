import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  getLocalFamilyMembers,
  getFamilyMembers,
  subscribeToFamilyMembers,
  addFamilyMember,
  updateFamilyMember,
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
  const [members, setMembers] = useState(() => getLocalFamilyMembers());
  const [loading, setLoading] = useState(false);

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

  // Edit Member Modal States (Permanent sync across all users)
  const [editingMember, setEditingMember] = useState(null);
  const [editName, setEditName] = useState("");
  const [editRelation, setEditRelation] = useState("Parent");
  const [editPhone, setEditPhone] = useState("");
  const [editBloodGroup, setEditBloodGroup] = useState("Unknown");
  const [editLocation, setEditLocation] = useState("");
  const [editCoordinates, setEditCoordinates] = useState("");
  const [editSaving, setEditSaving] = useState(false);

  // Disaster Alert & Siren Buzzer States
  // By default, disaster tracking alert is standby (FALSE) so the siren does NOT buzz by default!
  const [disasterAlertActive, setDisasterAlertActive] = useState(false);
  const [selectedDisasterId, setSelectedDisasterId] = useState("danger-flood-bhubaneswar");
  const [sirenPlaying, setSirenPlaying] = useState(false);
  const [sirenMuted, setSirenMuted] = useState(false);
  const [sirenSoundType, setSirenSoundType] = useState("wail"); // 'wail' | 'yelp' | 'hilo' | 'klaxon'

  // Web Audio Refs for Siren Buzzer
  const audioCtxRef = useRef(null);
  const osc1Ref = useRef(null);
  const osc2Ref = useRef(null);
  const lfoRef = useRef(null);
  const masterGainRef = useRef(null);
  const pulseTimerRef = useRef(null);
  const isTestingRef = useRef(false);

  // Real-Time Permanent Cloud Sync for all users:
  // When ANY user adds, removes, or modifies a name, it updates live for every user!
  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToFamilyMembers((updatedMembers) => {
      setMembers(updatedMembers);
      setLoading(false);
    });

    return () => {
      unsubscribe();
      stopSiren();
    };
  }, []);

  // ── High-Fidelity Emergency Siren & Alarm Synthesizer ─────────────────────
  // Features 4 authentic emergency sound profiles using Web Audio LFO modulation:
  // 1. 'wail': Authentic Civil Defense / Disaster Warning Siren (rising & falling horn)
  // 2. 'yelp': Rapid Emergency Response Yelp (Fast high-urgency sweep)
  // 3. 'hilo': European Two-Tone Emergency Vehicle Horn (960Hz <-> 720Hz)
  // 4. 'klaxon': Pulsed Evacuation Klaxon Alarm
  const startSiren = (soundType = sirenSoundType) => {
    if (sirenMuted) return;
    try {
      stopSiren();

      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;

      const ctx = new AudioContextClass();
      if (ctx.state === "suspended") {
        ctx.resume().catch(() => {});
        const unlockAudio = () => {
          if (ctx.state === "suspended") {
            ctx.resume().catch(() => {});
          }
          window.removeEventListener("click", unlockAudio);
          window.removeEventListener("touchstart", unlockAudio);
          window.removeEventListener("keydown", unlockAudio);
        };
        window.addEventListener("click", unlockAudio, { once: true });
        window.addEventListener("touchstart", unlockAudio, { once: true });
        window.addEventListener("keydown", unlockAudio, { once: true });
      }

      // Master output gain with smooth exponential attack
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.01, ctx.currentTime);
      masterGain.gain.exponentialRampToValueAtTime(0.28, ctx.currentTime + 0.15);

      // Outdoor megaphone / acoustic horn resonance filter
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(2600, ctx.currentTime);
      filter.Q.setValueAtTime(3.0, ctx.currentTime);

      filter.connect(masterGain);
      masterGain.connect(ctx.destination);

      let carrier = null;
      let carrier2 = null;
      let lfo = null;
      let lfoGain = null;

      if (soundType === "wail") {
        // Civil Defense Disaster Siren (Smooth 480Hz <-> 1220Hz continuous sweep)
        carrier = ctx.createOscillator();
        carrier.type = "sawtooth";
        carrier.frequency.setValueAtTime(850, ctx.currentTime);

        carrier2 = ctx.createOscillator();
        carrier2.type = "triangle";
        carrier2.frequency.setValueAtTime(425, ctx.currentTime); // Sub-octave warmth

        lfo = ctx.createOscillator();
        lfo.type = "triangle";
        lfo.frequency.setValueAtTime(0.36, ctx.currentTime); // ~2.8s emergency cycle

        lfoGain = ctx.createGain();
        lfoGain.gain.setValueAtTime(370, ctx.currentTime); // 850 +/- 370 = 480Hz to 1220Hz

        const lfoGain2 = ctx.createGain();
        lfoGain2.gain.setValueAtTime(185, ctx.currentTime);

        lfo.connect(lfoGain);
        lfoGain.connect(carrier.frequency);

        lfo.connect(lfoGain2);
        lfoGain2.connect(carrier2.frequency);

        carrier.connect(filter);
        carrier2.connect(filter);

        lfo.start();
        carrier.start();
        carrier2.start();
      } else if (soundType === "yelp") {
        // High-Urgency Rapid Rescue Yelp (Fast 3.6 Hz sweep from 600Hz to 1550Hz)
        carrier = ctx.createOscillator();
        carrier.type = "sawtooth";
        carrier.frequency.setValueAtTime(1050, ctx.currentTime);

        lfo = ctx.createOscillator();
        lfo.type = "sawtooth";
        lfo.frequency.setValueAtTime(3.6, ctx.currentTime);

        lfoGain = ctx.createGain();
        lfoGain.gain.setValueAtTime(480, ctx.currentTime);

        lfo.connect(lfoGain);
        lfoGain.connect(carrier.frequency);
        carrier.connect(filter);

        lfo.start();
        carrier.start();
      } else if (soundType === "hilo") {
        // European Two-Tone Emergency Horn (960Hz <-> 720Hz)
        carrier = ctx.createOscillator();
        carrier.type = "sawtooth";
        carrier.frequency.setValueAtTime(840, ctx.currentTime);

        carrier2 = ctx.createOscillator();
        carrier2.type = "square";
        carrier2.frequency.setValueAtTime(840, ctx.currentTime);
        const c2Gain = ctx.createGain();
        c2Gain.gain.setValueAtTime(0.12, ctx.currentTime);
        carrier2.connect(c2Gain);
        c2Gain.connect(filter);

        lfo = ctx.createOscillator();
        lfo.type = "square";
        lfo.frequency.setValueAtTime(1.15, ctx.currentTime); // 435ms alternating step

        lfoGain = ctx.createGain();
        lfoGain.gain.setValueAtTime(120, ctx.currentTime); // 840 +/- 120 = 960Hz and 720Hz

        lfo.connect(lfoGain);
        lfoGain.connect(carrier.frequency);
        lfoGain.connect(carrier2.frequency);
        carrier.connect(filter);

        lfo.start();
        carrier.start();
        carrier2.start();
      } else {
        // Pulsed Disaster Evacuation Klaxon (880Hz / 587Hz pulse)
        carrier = ctx.createOscillator();
        carrier.type = "sawtooth";
        carrier.frequency.setValueAtTime(880, ctx.currentTime);

        carrier2 = ctx.createOscillator();
        carrier2.type = "triangle";
        carrier2.frequency.setValueAtTime(587, ctx.currentTime);

        const pulseGain = ctx.createGain();
        pulseGain.gain.setValueAtTime(0.8, ctx.currentTime);

        carrier.connect(pulseGain);
        carrier2.connect(pulseGain);
        pulseGain.connect(filter);

        // Modulate amplitude at 4Hz
        lfo = ctx.createOscillator();
        lfo.type = "square";
        lfo.frequency.setValueAtTime(3.8, ctx.currentTime);
        lfo.connect(pulseGain.gain);

        lfo.start();
        carrier.start();
        carrier2.start();
      }

      audioCtxRef.current = ctx;
      osc1Ref.current = carrier;
      osc2Ref.current = carrier2;
      lfoRef.current = lfo;
      masterGainRef.current = masterGain;
      setSirenPlaying(true);

      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate([350, 120, 350, 120, 600]);
      }
    } catch (err) {
      console.warn("Unable to start emergency siren buzzer:", err);
    }
  };

  const stopSiren = () => {
    try {
      if (pulseTimerRef.current) {
        clearInterval(pulseTimerRef.current);
        pulseTimerRef.current = null;
      }
      const ctxToClose = audioCtxRef.current;
      const osc1ToClose = osc1Ref.current;
      const osc2ToClose = osc2Ref.current;
      const lfoToClose = lfoRef.current;
      const gainToFade = masterGainRef.current;

      audioCtxRef.current = null;
      osc1Ref.current = null;
      osc2Ref.current = null;
      lfoRef.current = null;
      masterGainRef.current = null;

      if (gainToFade && ctxToClose && ctxToClose.state !== "closed") {
        try {
          const now = ctxToClose.currentTime;
          gainToFade.gain.cancelScheduledValues(now);
          gainToFade.gain.setValueAtTime(gainToFade.gain.value, now);
          gainToFade.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);
        } catch {}
      }

      setTimeout(() => {
        try { if (osc1ToClose) { osc1ToClose.stop(); osc1ToClose.disconnect(); } } catch {}
        try { if (osc2ToClose) { osc2ToClose.stop(); osc2ToClose.disconnect(); } } catch {}
        try { if (lfoToClose) { lfoToClose.stop(); lfoToClose.disconnect(); } } catch {}
        try { if (ctxToClose && ctxToClose.state !== "closed") { ctxToClose.close(); } } catch {}
      }, 90);
    } catch (err) {}
    setSirenPlaying(false);
  };

  const toggleSirenMute = () => {
    if (sirenPlaying) {
      stopSiren();
      setSirenMuted(true);
    } else {
      setSirenMuted(false);
      if (unsafeCount > 0) {
        startSiren();
      } else {
        // When all members are safe, preview siren for 2.5s and then automatically stop
        isTestingRef.current = true;
        startSiren();
        setTimeout(() => {
          isTestingRef.current = false;
          stopSiren();
        }, 2500);
      }
    }
  };

  // Filter active danger zones
  const activeZones = selectedDisasterId === "all"
    ? ACTIVE_DANGER_ZONES
    : ACTIVE_DANGER_ZONES.filter((z) => z.id === selectedDisasterId);

  // ── Evaluate Members Against Active Danger Zones ─────────────────────────
  const evaluatedMembers = members.map((member) => {
    // Member's manual status (unsafe if Needs Help, Unsafe, or not marked safe)
    const isManuallyUnsafe =
      member.status === "Needs Help" ||
      member.status === "Unsafe" ||
      member.status === "Danger" ||
      member.isSafe === false;

    // Danger zone evaluation (only active when disaster alert is triggered)
    const evaluation = disasterAlertActive
      ? checkMemberInDangerZone(member, activeZones)
      : { inDanger: false, memberCoords: null, dangerZone: null };

    const inDanger = evaluation.inDanger;
    // An individual is considered unsafe if they are inside an active danger zone OR manually marked Needs Help/Unsafe
    const isUnsafe = inDanger || isManuallyUnsafe;

    const coords = evaluation.memberCoords || parseMemberCoordinates(member);
    const nearestShelter = isUnsafe && coords
      ? findNearestSafeShelter(coords, DEFAULT_SHELTERS, evaluation.dangerZone)
      : null;

    return {
      ...member,
      inDanger,
      isUnsafe,
      dangerZone: evaluation.dangerZone,
      distanceToEpicenterKm: evaluation.distanceToEpicenterKm,
      memberCoords: coords,
      nearestShelter,
      effectiveStatus: isUnsafe ? "Unsafe" : "Safe",
    };
  });

  const unsafeCount = evaluatedMembers.filter((m) => m.isUnsafe).length;
  const safeCount = evaluatedMembers.filter((m) => !m.isUnsafe).length;

  // ── AUTOMATIC SIREN BUZZER CONTROLLER ─────────────────────────────────────
  // CORE REQUIREMENT:
  // 1. If AT LEAST ANY family member is unsafe (unsafeCount > 0):
  //    Buzz the siren automatically!
  // 2. If ALL family members are safe (unsafeCount === 0):
  //    Do NOT buzz the siren (silence / stop buzzer immediately).
  useEffect(() => {
    if (loading) return;

    if (unsafeCount > 0) {
      // At least one family member is unsafe -> buzz siren automatically!
      if (!sirenMuted && !sirenPlaying) {
        startSiren(sirenSoundType);
      }
    } else {
      // All family members are safe -> do NOT buzz the siren!
      if (sirenPlaying && !isTestingRef.current) {
        stopSiren();
      }
    }
  }, [unsafeCount, loading, sirenMuted, sirenPlaying, sirenSoundType]);

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
      setBroadcastMsg("✅ Family member registered into safety network.");
      setTimeout(() => setBroadcastMsg(""), 3500);
    } catch (err) {
      console.error("Error adding family member:", err);
      alert("Failed to save member. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle Safety Status: If toggled to unsafe, it will buzz the siren automatically!
  const handleToggleStatus = async (member) => {
    const willBeUnsafe = !member.isUnsafe;
    const nextStatus = willBeUnsafe ? "Needs Help" : "Safe";
    try {
      if (willBeUnsafe) {
        setSirenMuted(false); // Unmute so siren buzzes automatically
      }
      const updated = await toggleMemberSafety(member.id || member._id, nextStatus);
      setMembers(updated);
    } catch (err) {
      console.error("Error toggling safety:", err);
    }
  };

  // Delete Member (Permanently for all users)
  const handleDelete = async (member) => {
    if (!window.confirm(`Are you sure you want to remove ${member.name} permanently for all users?`)) {
      return;
    }
    try {
      const updated = await removeFamilyMember(member.id || member._id);
      setMembers(updated);
      setBroadcastMsg(`🗑️ Removed "${member.name}" permanently from safety network.`);
      setTimeout(() => setBroadcastMsg(""), 4000);
    } catch (err) {
      console.error("Error deleting member:", err);
    }
  };

  // Open Edit Modal (To change name or other info)
  const handleOpenEdit = (member) => {
    setEditingMember(member);
    setEditName(member.name || "");
    setEditRelation(member.relation || "Family");
    setEditPhone(member.phone || "");
    setEditBloodGroup(member.bloodGroup || "Unknown");
    setEditLocation(member.location || "");
    setEditCoordinates(member.coordinates || "");
  };

  const handleCloseEdit = () => {
    setEditingMember(null);
  };

  // Save Edit Changes (Permanently syncs for every user)
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editName.trim() || !editingMember) return;
    setEditSaving(true);
    try {
      const targetId = editingMember.id || editingMember._id;
      const updated = await updateFamilyMember(targetId, {
        name: editName.trim(),
        relation: editRelation,
        phone: editPhone,
        bloodGroup: editBloodGroup,
        location: editLocation || "Registered Address",
        coordinates: editCoordinates,
      });
      setMembers(updated);
      setBroadcastMsg(`✅ Permanently updated "${editName.trim()}" for every user.`);
      setTimeout(() => setBroadcastMsg(""), 4000);
      handleCloseEdit();
    } catch (err) {
      console.error("Error saving member edit:", err);
      alert("Failed to save changes. Please try again.");
    } finally {
      setEditSaving(false);
    }
  };

  // Mark all safe
  const markAllSafe = async () => {
    try {
      stopSiren();
      setDisasterAlertActive(false);
      let current = [...members];
      for (const m of current) {
        if (m.status !== "Safe") {
          current = await toggleMemberSafety(m.id || m._id, "Safe");
        }
      }
      setMembers(current);
      setBroadcastMsg("✅ Entire family confirmed safe. Siren disarmed.");
      setTimeout(() => setBroadcastMsg(""), 4000);
    } catch (err) {
      console.error("Error marking all safe:", err);
    }
  };

  // Trigger Incoming Disaster Alert in Area
  const triggerIncomingDisaster = () => {
    const nextState = !disasterAlertActive;
    setDisasterAlertActive(nextState);
    if (nextState) {
      setBroadcastMsg("🚨 Active disaster alert triggered! Tracking family coordinates against danger zone.");
      setTimeout(() => setBroadcastMsg(""), 5000);
    } else {
      stopSiren();
      setBroadcastMsg("🟢 Disaster alert cleared. Family area status normal.");
      setTimeout(() => setBroadcastMsg(""), 4000);
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
      `🚨 EMERGENCY DISASTER SAFETY CHECK:\nHi ${member.name}, I am tracking disaster alerts in your area. Please reply immediately: Are you SAFE or do you NEED RESCUE? Current timestamp: ${new Date().toLocaleTimeString()}`
    );
    window.open(`https://wa.me/${formattedPhone}?text=${msg}`, "_blank");
  };

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
                Automatic danger zone tracking, emergency siren buzzer alert, and nearest safe refuge routing.
              </p>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", marginTop: "4px", backgroundColor: "rgba(16, 185, 129, 0.12)", border: "1px solid #10b981", padding: "3px 10px", borderRadius: "20px", fontSize: "0.78rem", color: "#6ee7b7", fontWeight: "700" }}>
                <span>☁️</span>
                <span>Permanent Cloud Sync Active (All edits sync live across every user)</span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
          {/* Siren Tone Selector */}
          <select
            value={sirenSoundType}
            onChange={(e) => {
              const newType = e.target.value;
              setSirenSoundType(newType);
              if (sirenPlaying) startSiren(newType);
            }}
            title="Choose Emergency Siren Sound Tone"
            style={{
              backgroundColor: "#1e293b",
              border: "1px solid #475569",
              color: "#38bdf8",
              padding: "9px 12px",
              borderRadius: "8px",
              fontSize: "0.82rem",
              fontWeight: "700",
              outline: "none",
              cursor: "pointer",
            }}
          >
            <option value="wail">📢 Siren: Civil Defense Wail</option>
            <option value="yelp">🚨 Siren: Rapid Emergency Yelp</option>
            <option value="hilo">🚑 Siren: European Hi-Lo Horn</option>
            <option value="klaxon">⚠️ Siren: Evacuation Klaxon</option>
          </select>

          {/* Siren Buzzer Sound / Mute Button */}
          <button
            onClick={toggleSirenMute}
            style={{
              padding: "10px 18px",
              backgroundColor: sirenPlaying ? "#dc2626" : (unsafeCount > 0 ? "#7f1d1d" : "#1e293b"),
              border: `1.5px solid ${sirenPlaying ? "#f87171" : (unsafeCount > 0 ? "#ef4444" : "#475569")}`,
              borderRadius: "10px",
              color: "#ffffff",
              fontWeight: "700",
              fontSize: "0.85rem",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              boxShadow: sirenPlaying ? "0 0 18px rgba(220, 38, 38, 0.8)" : "none",
              transition: "all 0.2s ease",
            }}
          >
            <span>{sirenPlaying ? "🔊" : "🔇"}</span>
            <span>
              {sirenPlaying
                ? "Mute Siren Buzzer"
                : unsafeCount > 0
                ? "Unmute Siren Buzzer"
                : "Test Audio Siren (Preview)"}
            </span>
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

      {/* ── DANGER TRACKING & DISASTER SIMULATION CONTROL BAR ─────────────── */}
      <div
        style={{
          backgroundColor: unsafeCount > 0 ? "rgba(127, 29, 29, 0.45)" : "#1e293b",
          border: `1.5px solid ${unsafeCount > 0 ? "#ef4444" : "#334155"}`,
          borderRadius: "14px",
          padding: "18px 22px",
          marginBottom: "24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
          boxShadow: unsafeCount > 0 ? "0 0 25px rgba(239, 68, 68, 0.35)" : "none",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap" }}>
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "50%",
              backgroundColor: unsafeCount > 0 ? "#dc2626" : "#0284c7",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.5rem",
              boxShadow: unsafeCount > 0 ? "0 0 16px rgba(239, 68, 68, 0.8)" : "none",
            }}
          >
            {unsafeCount > 0 ? "🚨" : "🛡️"}
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
              <strong style={{ color: unsafeCount > 0 ? "#fca5a5" : "#f8fafc", fontSize: "1.05rem" }}>
                {unsafeCount > 0
                  ? `🚨 CRITICAL ALERT: ${unsafeCount} Family Member(s) Unsafe / In Danger!`
                  : "🛡️ Safety Radar: All Family Members Safe"}
              </strong>
              {sirenPlaying ? (
                <span
                  style={{
                    backgroundColor: "#dc2626",
                    color: "#fff",
                    padding: "2px 8px",
                    borderRadius: "12px",
                    fontSize: "0.72rem",
                    fontWeight: "800",
                    letterSpacing: "1px",
                    animation: "pulse 1s infinite",
                  }}
                >
                  🔊 SIREN ACTIVE (BUZZING)
                </span>
              ) : unsafeCount === 0 ? (
                <span
                  style={{
                    backgroundColor: "#166534",
                    color: "#86efac",
                    padding: "2px 8px",
                    borderRadius: "12px",
                    fontSize: "0.72rem",
                    fontWeight: "700",
                    letterSpacing: "0.5px",
                  }}
                >
                  🔇 SIREN SILENT (ALL SAFE)
                </span>
              ) : (
                <span
                  style={{
                    backgroundColor: "#7f1d1d",
                    color: "#fca5a5",
                    padding: "2px 8px",
                    borderRadius: "12px",
                    fontSize: "0.72rem",
                    fontWeight: "700",
                  }}
                >
                  🔇 SIREN MUTED
                </span>
              )}
            </div>
            <p style={{ margin: "4px 0 0 0", fontSize: "0.83rem", color: "#94a3b8" }}>
              {unsafeCount > 0
                ? "⚠️ Automatic Siren is BUZZING because at least one family member is unsafe."
                : "✅ Automatic Siren is SILENT because all family members are safe."}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>Hazard Zone:</span>
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
              <option value="all">All Danger Zones ({ACTIVE_DANGER_ZONES.length})</option>
              {ACTIVE_DANGER_ZONES.map((z) => (
                <option key={z.id} value={z.id}>
                  {z.name} ({z.type})
                </option>
              ))}
            </select>
          </div>

          {/* Trigger Incoming Disaster Toggle Button */}
          <button
            onClick={triggerIncomingDisaster}
            style={{
              padding: "10px 18px",
              backgroundColor: disasterAlertActive ? "#dc2626" : "#0284c7",
              border: "none",
              color: "#ffffff",
              borderRadius: "8px",
              fontWeight: "800",
              fontSize: "0.85rem",
              cursor: "pointer",
              boxShadow: disasterAlertActive ? "0 0 16px rgba(220, 38, 38, 0.6)" : "0 2px 8px rgba(2, 132, 199, 0.4)",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span>{disasterAlertActive ? "🛑 Clear Disaster Alert" : "🚨 Simulate Disaster in Area"}</span>
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
            backgroundColor: unsafeCount > 0 ? "#3b0707" : "#1e293b",
            padding: "18px",
            borderRadius: "12px",
            border: `1.5px solid ${unsafeCount > 0 ? "#ef4444" : "#334155"}`,
            boxShadow: unsafeCount > 0 ? "0 0 15px rgba(239, 68, 68, 0.25)" : "none",
          }}
        >
          <span style={{ color: unsafeCount > 0 ? "#fca5a5" : "#94a3b8", fontSize: "0.8rem", fontWeight: "600", textTransform: "uppercase" }}>
            Unsafe / In Danger
          </span>
          <div style={{ fontSize: "1.8rem", fontWeight: "800", color: unsafeCount > 0 ? "#ef4444" : "#f8fafc", marginTop: "4px" }}>
            {unsafeCount}
          </div>
          <div style={{ fontSize: "0.8rem", color: unsafeCount > 0 ? "#f87171" : "#94a3b8", marginTop: "4px" }}>
            {unsafeCount > 0 ? "⚠️ Siren Buzzer Triggered" : "0 Unsafe (Siren Silent)"}
          </div>
        </div>

        <div style={{ backgroundColor: "#1e293b", padding: "18px", borderRadius: "12px", border: "1px solid #334155" }}>
          <span style={{ color: "#94a3b8", fontSize: "0.8rem", fontWeight: "600", textTransform: "uppercase" }}>
            Radar Status
          </span>
          <div style={{ fontSize: "1.2rem", fontWeight: "800", color: unsafeCount > 0 ? "#ef4444" : "#22c55e", marginTop: "8px" }}>
            {unsafeCount > 0 ? "🚨 ALERT BUZZING" : "🟢 STANDBY (NORMAL)"}
          </div>
          <div style={{ fontSize: "0.8rem", color: "#94a3b8", marginTop: "4px" }}>Automatic Proximity Check</div>
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
          <span>Register Family Member into Radar Network</span>
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
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
          <h3 style={{ fontSize: "1.25rem", fontWeight: "700", margin: 0, color: "#f8fafc" }}>
            👥 Tracked Family Members ({evaluatedMembers.length})
          </h3>
          <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>
            Automatic Unsafe Symbol & Siren Trigger on Threat Detection
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
              const isUnsafe = member.isUnsafe;
              const isSafe = !isUnsafe;
              const coords = member.memberCoords || parseMemberCoordinates(member);

              // Evacuation Route to Nearest Safe Shelter Link
              const evacRouteUrl = member.nearestShelter && coords
                ? `/map?evac=1&originLat=${coords.lat}&originLng=${coords.lng}&destLat=${member.nearestShelter.lat}&destLng=${member.nearestShelter.lng}&shelterName=${encodeURIComponent(member.nearestShelter.name)}&hazard=${encodeURIComponent(member.dangerZone?.name || "Active Danger Area")}&name=${encodeURIComponent(member.name)}`
                : coords
                ? `/map?lat=${coords.lat}&lng=${coords.lng}&name=${encodeURIComponent(member.name)}`
                : `/map?name=${encodeURIComponent(member.location || member.name)}`;

              return (
                <div
                  key={member.id || member._id}
                  style={{
                    backgroundColor: isUnsafe ? "#2a0d0d" : "#1e293b",
                    borderRadius: "14px",
                    border: `2px solid ${isUnsafe ? "#ef4444" : "#166534"}`,
                    padding: "20px 24px",
                    boxShadow: isUnsafe
                      ? "0 0 30px rgba(239, 68, 68, 0.4)"
                      : "none",
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
                          width: "48px",
                          height: "48px",
                          borderRadius: "50%",
                          backgroundColor: isUnsafe ? "#ef4444" : "#166534",
                          color: "#ffffff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "1.5rem",
                          border: "2.5px solid #ffffff",
                          boxShadow: isUnsafe ? "0 0 18px rgba(239, 68, 68, 0.9)" : "none",
                        }}
                      >
                        {isUnsafe ? "⚠️" : "👤"}
                      </div>

                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                          <span style={{ fontSize: "1.2rem", fontWeight: "800", color: "#f8fafc" }}>
                            {member.name}
                          </span>

                          {/* AUTOMATIC SYMBOL CHANGE: UNSAFE SYMBOL */}
                          {isUnsafe ? (
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
                                boxShadow: "0 0 14px rgba(239, 68, 68, 0.7)",
                              }}
                            >
                              <span>🚨</span>
                              <span>{member.inDanger ? "UNSAFE (IN DANGER ZONE)" : "UNSAFE (NEEDS HELP)"}</span>
                            </span>
                          ) : (
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px",
                                backgroundColor: "#14532d",
                                border: "1px solid #22c55e",
                                color: "#86efac",
                                padding: "3px 10px",
                                borderRadius: "20px",
                                fontSize: "0.78rem",
                                fontWeight: "700",
                              }}
                            >
                              <span>✅</span>
                              <span>CONFIRMED SAFE</span>
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
                            <span style={{ color: isUnsafe ? "#fca5a5" : "#e2e8f0", fontWeight: "600" }}>
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
                      {/* Manual Status Toggle (Safe / Unsafe) */}
                      <button
                        onClick={() => handleToggleStatus(member)}
                        title={isSafe ? "Click to report this member needs emergency help" : "Click to confirm this member is safe"}
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
                        <span>{isSafe ? "Safe (Click to Mark Unsafe)" : "Unsafe (Click to Mark Safe)"}</span>
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

                      {/* Edit Member Name & Details (Permanent for all users) */}
                      <button
                        onClick={() => handleOpenEdit(member)}
                        title="Edit Member Name & Info (Permanent for all users)"
                        style={{
                          padding: "8px 12px",
                          borderRadius: "8px",
                          border: "1px solid #0284c7",
                          backgroundColor: "rgba(2, 132, 199, 0.15)",
                          color: "#38bdf8",
                          fontWeight: "700",
                          fontSize: "0.85rem",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "5px",
                          transition: "all 0.2s ease",
                        }}
                      >
                        <span>✏️</span>
                        <span>Edit</span>
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => handleDelete(member)}
                        title="Remove Member Permanently"
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

                  {/* ── DANGER ALERT & RESPONSE MAP CONNECT BAR ────────────── */}
                  {isUnsafe && (
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
                            <span>
                              {member.dangerZone
                                ? `IN ACTIVE DANGER ZONE: ${member.dangerZone.name}`
                                : "STATUS: EMERGENCY ASSISTANCE REQUESTED"}
                            </span>
                            {member.dangerZone && (
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
                            )}
                          </div>
                          {member.dangerZone ? (
                            <>
                              <p style={{ margin: "4px 0 0 0", fontSize: "0.83rem", color: "#fca5a5" }}>
                                {member.dangerZone.description} • Distance to hazard epicenter:{" "}
                                <strong>{member.distanceToEpicenterKm} km</strong> (Danger radius: {member.dangerZone.radiusKm} km)
                              </p>
                              <p style={{ margin: "4px 0 0 0", fontSize: "0.82rem", color: "#fdba74" }}>
                                📢 <strong>Advisory:</strong> {member.dangerZone.advisory}
                              </p>
                            </>
                          ) : (
                            <p style={{ margin: "4px 0 0 0", fontSize: "0.83rem", color: "#fca5a5" }}>
                              Member flagged as needing emergency help or medical triage. Nearest safe shelter route computed below.
                            </p>
                          )}
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
                              🛡️ Nearest Safe Refuge: {member.nearestShelter.name}
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

      {/* ── EDIT MEMBER MODAL (PERMANENT MULTI-USER CLOUD SYNC) ────────── */}
      {editingMember && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.78)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 99999,
            padding: "20px",
          }}
        >
          <div
            style={{
              backgroundColor: "#1e293b",
              border: "1.5px solid #38bdf8",
              borderRadius: "16px",
              padding: "26px",
              maxWidth: "520px",
              width: "100%",
              boxShadow: "0 20px 50px rgba(0, 0, 0, 0.7), 0 0 35px rgba(56, 189, 248, 0.25)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "18px" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "1.3rem", fontWeight: "800", color: "#f8fafc" }}>
                  ✏️ Modify Family Member
                </h3>
                <p style={{ margin: "4px 0 0 0", fontSize: "0.82rem", color: "#38bdf8" }}>
                  ☁️ Name and detail changes save permanently in Cloud & MongoDB for every user.
                </p>
              </div>
              <button
                onClick={handleCloseEdit}
                style={{
                  background: "none",
                  border: "none",
                  color: "#94a3b8",
                  fontSize: "1.5rem",
                  cursor: "pointer",
                  lineHeight: "1",
                }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "#e2e8f0", marginBottom: "6px" }}>
                  Full Name <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="e.g., Prafulla Kumar Behera"
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    backgroundColor: "#0f172a",
                    border: "1.5px solid #38bdf8",
                    borderRadius: "8px",
                    color: "#ffffff",
                    fontSize: "0.95rem",
                    fontWeight: "700",
                    boxSizing: "border-box",
                    outline: "none",
                  }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "600", color: "#94a3b8", marginBottom: "6px" }}>
                    Relationship
                  </label>
                  <select
                    value={editRelation}
                    onChange={(e) => setEditRelation(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      backgroundColor: "#0f172a",
                      border: "1px solid #475569",
                      borderRadius: "8px",
                      color: "#ffffff",
                      fontSize: "0.9rem",
                      boxSizing: "border-box",
                      outline: "none",
                    }}
                  >
                    {RELATIONSHIPS.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "600", color: "#94a3b8", marginBottom: "6px" }}>
                    Blood Group
                  </label>
                  <select
                    value={editBloodGroup}
                    onChange={(e) => setEditBloodGroup(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      backgroundColor: "#0f172a",
                      border: "1px solid #475569",
                      borderRadius: "8px",
                      color: "#ffffff",
                      fontSize: "0.9rem",
                      boxSizing: "border-box",
                      outline: "none",
                    }}
                  >
                    {BLOOD_GROUPS.map((bg) => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "600", color: "#94a3b8", marginBottom: "6px" }}>
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="e.g., 9861012345"
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    backgroundColor: "#0f172a",
                    border: "1px solid #475569",
                    borderRadius: "8px",
                    color: "#ffffff",
                    fontSize: "0.9rem",
                    boxSizing: "border-box",
                    outline: "none",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "600", color: "#94a3b8", marginBottom: "6px" }}>
                  Location Address
                </label>
                <input
                  type="text"
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  placeholder="e.g., Patia, Bhubaneswar"
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    backgroundColor: "#0f172a",
                    border: "1px solid #475569",
                    borderRadius: "8px",
                    color: "#ffffff",
                    fontSize: "0.9rem",
                    boxSizing: "border-box",
                    outline: "none",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "600", color: "#94a3b8", marginBottom: "6px" }}>
                  GPS Coordinates (lat, lng)
                </label>
                <input
                  type="text"
                  value={editCoordinates}
                  onChange={(e) => setEditCoordinates(e.target.value)}
                  placeholder="e.g., 20.3522, 85.8193"
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    backgroundColor: "#0f172a",
                    border: "1px solid #475569",
                    borderRadius: "8px",
                    color: "#ffffff",
                    fontSize: "0.9rem",
                    boxSizing: "border-box",
                    outline: "none",
                  }}
                />
              </div>

              <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "8px" }}>
                <button
                  type="button"
                  onClick={handleCloseEdit}
                  style={{
                    padding: "10px 18px",
                    backgroundColor: "#334155",
                    border: "none",
                    borderRadius: "8px",
                    color: "#ffffff",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editSaving}
                  style={{
                    padding: "10px 22px",
                    backgroundColor: "#0284c7",
                    border: "none",
                    borderRadius: "8px",
                    color: "#ffffff",
                    fontWeight: "700",
                    cursor: editSaving ? "not-allowed" : "pointer",
                    boxShadow: "0 4px 14px rgba(2, 132, 199, 0.4)",
                  }}
                >
                  {editSaving ? "Saving Permanently..." : "💾 Save Changes (All Users)"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}