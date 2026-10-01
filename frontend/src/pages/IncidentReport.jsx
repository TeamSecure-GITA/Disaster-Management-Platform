import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import localforage from 'localforage';
import {
  saveOfflineReport,
  getOfflineReports,
  compressImage,
} from "../utils/offlineStorage";
import { scheduleSync, flushAllQueues } from "../utils/syncService";

function IncidentReport() {
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({
    type: "Landslide",
    location: "",
    severity: "High",
    description: "",
    affectedPeople: "",
    crackWidth: "",
    crackLength: "",
    roadStatus: "Clear",
    slopeTrend: "Stationary",
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [compressionInfo, setCompressionInfo] = useState(null);
  const [isCompressing, setIsCompressing] = useState(false);

  const [submitted, setSubmitted] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [reports, setReports] = useState([]);
  const [pendingQueue, setPendingQueue] = useState([]);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showSmsModal, setShowSmsModal] = useState(false);
  const [smsCopied, setSmsCopied] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [emergencyNumber, setEmergencyNumber] = useState("112");

  // Track online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Refresh pending offline queue and persisted reports on mount
  const refreshQueues = async () => {
    try {
      const saved = await localforage.getItem("incident_reports");
      if (saved && Array.isArray(saved)) setReports(saved);

      const queue = await getOfflineReports();
      setPendingQueue(queue || []);
    } catch (e) {
      console.error("Queue load error:", e);
    }
  };

  useEffect(() => {
    refreshQueues();

    const handleSyncComplete = () => {
      refreshQueues();
    };
    window.addEventListener("dmp:sync-complete", handleSyncComplete);
    return () => window.removeEventListener("dmp:sync-complete", handleSyncComplete);
  }, []);

  // Pre-fill from query parameters (e.g. from AR "See the Risk" scanner)
  useEffect(() => {
    const pType = searchParams.get("type");
    const pLoc = searchParams.get("location");
    const pSev = searchParams.get("severity");
    const pDesc = searchParams.get("description");
    const pAff = searchParams.get("affectedPeople");

    if (pType || pLoc || pSev || pDesc || pAff) {
      setForm((prev) => ({
        ...prev,
        ...(pType ? { type: pType } : {}),
        ...(pLoc ? { location: pLoc } : {}),
        ...(pSev ? { severity: pSev } : {}),
        ...(pDesc ? { description: pDesc } : {}),
        ...(pAff ? { affectedPeople: pAff } : {}),
      }));
    }
  }, [searchParams]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
    setSubmitted(false);
  };

  // Canvas Media Compression handler
  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    setIsCompressing(true);
    const origSizeKb = (file.size / 1024).toFixed(1);

    try {
      // Compress using Canvas (bounds to 1280x960, JPEG quality 0.72)
      const compressedDataUrl = await compressImage(file, {
        maxWidth: 1280,
        maxHeight: 960,
        quality: 0.72,
      });

      setImagePreview(compressedDataUrl);

      // Estimate compressed size in KB
      const approxCompressedKb = Math.round((compressedDataUrl.length * 0.75) / 1024);
      setCompressionInfo({
        orig: origSizeKb,
        compressed: approxCompressedKb,
        ratio: Math.round((1 - approxCompressedKb / parseFloat(origSizeKb)) * 100),
      });
    } catch (err) {
      console.warn("Media compression fallback:", err);
      setImagePreview(URL.createObjectURL(file));
    } finally {
      setIsCompressing(false);
    }
  };

  // Generate standardized SMS text for emergency fallback
  const getSmsPayload = () => {
    const coords = form.location || "Location not specified";
    const desc = form.description ? form.description.replace(/\n/g, " ") : "No description";
    return `REPORT ${form.type.toUpperCase()} ${form.severity.toUpperCase()} ${coords} ${desc} Affected:${form.affectedPeople || "0"}`;
  };

  const handleCopySms = () => {
    const text = getSmsPayload();
    navigator.clipboard.writeText(text).then(() => {
      setSmsCopied(true);
      setTimeout(() => setSmsCopied(false), 3000);
    });
  };

  // Form submission: Saves offline, prime Background Sync, flushes if online
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.location || !form.description) {
      alert("Please enter the incident location and description.");
      return;
    }

    const reportData = {
      ...form,
      id: Date.now(),
      status: isOnline ? "Syncing..." : "Saved Offline",
      createdAt: new Date().toISOString(),
    };

    try {
      // 1. Save to IndexedDB offline queue with compressed media
      const mediaList = imageFile ? [imageFile] : [];
      const opId = await saveOfflineReport(reportData, mediaList);

      // 2. Prime Web Background Sync API
      await scheduleSync();

      // 3. Update local UI list
      const updated = [{ ...reportData, operationId: opId }, ...reports];
      setReports(updated);
      await localforage.setItem("incident_reports", updated);

      // 4. If online, attempt immediate sync flush
      if (isOnline) {
        setIsSyncing(true);
        const token = localStorage.getItem("token") || localStorage.getItem("authToken");
        await flushAllQueues(token);
        setIsSyncing(false);
        setSubmitMessage("✅ Incident reported and synced to emergency response servers.");
      } else {
        setSubmitMessage("💾 Stored in offline queue. Will automatically upload via Background Sync when connected.");
      }

      setSubmitted(true);
      await refreshQueues();

      // Reset form
      setForm({
        type: "Landslide",
        location: "",
        severity: "High",
        description: "",
        affectedPeople: "",
        crackWidth: "",
        crackLength: "",
        roadStatus: "Clear",
        slopeTrend: "Stationary",
      });
      setImageFile(null);
      setImagePreview(null);
      setCompressionInfo(null);
    } catch (err) {
      console.error("Submit error:", err);
      alert("Failed to save report: " + err.message);
    }
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    const token = localStorage.getItem("token") || localStorage.getItem("authToken");
    await flushAllQueues(token);
    await refreshQueues();
    setIsSyncing(false);
  };

  return (
    <div className="incident-page" style={{ maxWidth: "900px", margin: "0 auto", padding: "24px 16px" }}>
      {/* Network & Offline Status Banner */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 16px",
          borderRadius: "8px",
          marginBottom: "20px",
          background: isOnline ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.2)",
          border: `1px solid ${isOnline ? "rgba(16, 185, 129, 0.4)" : "rgba(239, 68, 68, 0.5)"}`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "1.2rem" }}>{isOnline ? "🟢" : "📡"}</span>
          <div>
            <strong style={{ color: isOnline ? "#34d399" : "#fca5a5" }}>
              {isOnline ? "Online Mode" : "Low Network / Offline Mode"}
            </strong>
            <p style={{ margin: 0, fontSize: "0.8rem", color: "#94a3b8" }}>
              {isOnline
                ? "Reports synchronize directly to emergency command centers."
                : "IndexedDB queue active. Reports will sync automatically via Background Sync."}
            </p>
          </div>
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          {pendingQueue.length > 0 && (
            <button
              onClick={handleManualSync}
              disabled={isSyncing || !isOnline}
              style={{
                padding: "6px 12px",
                fontSize: "0.8rem",
                borderRadius: "6px",
                background: "#0284c7",
                color: "#fff",
                border: "none",
                cursor: "pointer",
                opacity: !isOnline ? 0.6 : 1,
              }}
            >
              {isSyncing ? "Syncing..." : `🔄 Sync Queue (${pendingQueue.length})`}
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowSmsModal(true)}
            style={{
              padding: "6px 12px",
              fontSize: "0.8rem",
              borderRadius: "6px",
              background: "#d97706",
              color: "#fff",
              border: "none",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            📱 SMS Fallback
          </button>
        </div>
      </div>

      <div className="incident-header" style={{ marginBottom: "20px" }}>
        <h1 style={{ fontSize: "1.8rem", color: "#f8fafc", margin: "0 0 6px 0" }}>📝 Report a Disaster Incident</h1>
        <p style={{ color: "#94a3b8", margin: 0 }}>
          Submit real-time geo-tagged field observations for NDMA, SDMA, and rapid-response teams.
        </p>
      </div>

      <form className="incident-form" onSubmit={handleSubmit}>
        <div
          className="incident-card"
          style={{
            background: "#1e293b",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "12px",
            padding: "24px",
          }}
        >
          <h2 style={{ fontSize: "1.2rem", color: "#38bdf8", marginBottom: "16px" }}>🚨 Incident Details</h2>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.85rem", color: "#cbd5e1", marginBottom: "6px" }}>
                Disaster Type
              </label>
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "6px",
                  background: "#0f172a",
                  color: "#f8fafc",
                  border: "1px solid #334155",
                }}
              >
                <option value="Landslide">Landslide / Slope Failure</option>
                <option value="Flood">Flooding / Water Inundation</option>
                <option value="Cyclone">Cyclone / Gale Wind</option>
                <option value="Earthquake">Earthquake Tremors</option>
                <option value="Fire">Wildfire / Structural Fire</option>
                <option value="Other">Other Emergency</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.85rem", color: "#cbd5e1", marginBottom: "6px" }}>
                ⚠️ Severity
              </label>
              <select
                name="severity"
                value={form.severity}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "6px",
                  background: "#0f172a",
                  color: "#f8fafc",
                  border: "1px solid #334155",
                }}
              >
                <option value="Low">Low - Monitored observation</option>
                <option value="Medium">Medium - Threat to property</option>
                <option value="High">High - Road blocked / Immediate danger</option>
                <option value="Critical">Critical - Life threatening / Mass evacuation needed</option>
              </select>
            </div>
          </div>

          <label style={{ display: "block", fontSize: "0.85rem", color: "#cbd5e1", marginBottom: "6px" }}>
            📍 Location / Coordinates
          </label>
          <div style={{ display: "flex", gap: "8px", alignItems: "stretch", marginBottom: "16px" }}>
            <input
              type="text"
              name="location"
              placeholder="e.g. 26.1445, 91.7362 or Guwahati NH-27 Km 42"
              value={form.location}
              onChange={handleChange}
              style={{
                flex: 1,
                padding: "10px",
                borderRadius: "6px",
                background: "#0f172a",
                color: "#f8fafc",
                border: "1px solid #334155",
              }}
            />
            <button
              type="button"
              onClick={() => {
                if (!navigator.geolocation) return alert("GPS not supported.");
                setGpsLoading(true);
                navigator.geolocation.getCurrentPosition(
                  (pos) => {
                    setForm((f) => ({
                      ...f,
                      location: `${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`,
                    }));
                    setGpsLoading(false);
                  },
                  () => {
                    alert("Unable to acquire GPS coordinates.");
                    setGpsLoading(false);
                  },
                  { enableHighAccuracy: true, timeout: 10000 }
                );
              }}
              style={{
                whiteSpace: "nowrap",
                padding: "8px 14px",
                background: "#0284c7",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              {gpsLoading ? "📡 Locating..." : "📍 Auto GPS"}
            </button>
          </div>

          {/* Specialized NER Slope & Geotechnical Observations for Landslide */}
          {form.type === "Landslide" && (
            <div
              style={{
                background: "rgba(30, 41, 59, 0.7)",
                border: "1px solid rgba(56, 189, 248, 0.4)",
                borderRadius: "10px",
                padding: "16px",
                marginBottom: "16px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                <span style={{ fontSize: "1.1rem" }}>⛰️</span>
                <strong style={{ color: "#38bdf8", fontSize: "0.95rem" }}>
                  NER Slope Movement & Geotechnical Observations
                </strong>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "10px" }}>
                <div>
                  <label style={{ fontSize: "0.8rem", color: "#cbd5e1" }}>Crack Width (approx cm)</label>
                  <input
                    type="number"
                    name="crackWidth"
                    placeholder="e.g. 5 cm"
                    value={form.crackWidth || ""}
                    onChange={handleChange}
                    style={{
                      width: "100%",
                      padding: "8px",
                      borderRadius: "6px",
                      background: "#0f172a",
                      color: "#f8fafc",
                      border: "1px solid #334155",
                      marginTop: "4px",
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.8rem", color: "#cbd5e1" }}>Crack Length (meters)</label>
                  <input
                    type="number"
                    name="crackLength"
                    placeholder="e.g. 12 m"
                    value={form.crackLength || ""}
                    onChange={handleChange}
                    style={{
                      width: "100%",
                      padding: "8px",
                      borderRadius: "6px",
                      background: "#0f172a",
                      color: "#f8fafc",
                      border: "1px solid #334155",
                      marginTop: "4px",
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: "10px" }}>
                <label style={{ fontSize: "0.8rem", color: "#cbd5e1" }}>Road Connectivity / Blockage Status</label>
                <select
                  name="roadStatus"
                  value={form.roadStatus || "Clear"}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    padding: "8px",
                    borderRadius: "6px",
                    background: "#0f172a",
                    color: "#f8fafc",
                    border: "1px solid #334155",
                    marginTop: "4px",
                  }}
                >
                  <option value="Clear">Road Fully Open</option>
                  <option value="Caution">Caution - Single Lane Traffic</option>
                  <option value="Partially Blocked">Partially Blocked (Light vehicles only)</option>
                  <option value="Completely Blocked">Completely Blocked (Debris on Highway)</option>
                  <option value="Culvert/Bridge Washed">Culvert or Bridge Damaged</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: "0.8rem", color: "#cbd5e1" }}>Slope Displacement Trend</label>
                <select
                  name="slopeTrend"
                  value={form.slopeTrend || "Stationary"}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    padding: "8px",
                    borderRadius: "6px",
                    background: "#0f172a",
                    color: "#f8fafc",
                    border: "1px solid #334155",
                    marginTop: "4px",
                  }}
                >
                  <option value="Stationary">Stationary - Surface cracks only</option>
                  <option value="Slow Creep">Slow Creep - Tilting trees/poles</option>
                  <option value="Active Rapid Movement">Active Rapid Movement / Mud run</option>
                  <option value="Rockfall">Falling Boulders / Rockfall Active</option>
                </select>
              </div>
            </div>
          )}

          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "0.85rem", color: "#cbd5e1", marginBottom: "6px" }}>
              👥 Number of Affected People
            </label>
            <input
              type="number"
              name="affectedPeople"
              min="0"
              placeholder="e.g. 25"
              value={form.affectedPeople}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "6px",
                background: "#0f172a",
                color: "#f8fafc",
                border: "1px solid #334155",
              }}
            />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "0.85rem", color: "#cbd5e1", marginBottom: "6px" }}>
              📝 Field Description
            </label>
            <textarea
              name="description"
              rows="4"
              placeholder="Detail observations, casualties, accessibility, immediate requirements..."
              value={form.description}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "6px",
                background: "#0f172a",
                color: "#f8fafc",
                border: "1px solid #334155",
              }}
            />
          </div>

          {/* Media Upload with In-Browser Compression */}
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", fontSize: "0.85rem", color: "#cbd5e1", marginBottom: "6px" }}>
              📷 Attach Incident Photo (Automatic Offline Canvas Compression)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ color: "#94a3b8", fontSize: "0.85rem" }}
            />

            {isCompressing && (
              <p style={{ color: "#38bdf8", fontSize: "0.8rem", marginTop: "6px" }}>
                ⏳ Compressing image for low-bandwidth transfer...
              </p>
            )}

            {compressionInfo && (
              <div
                style={{
                  marginTop: "8px",
                  padding: "8px 12px",
                  borderRadius: "6px",
                  background: "rgba(56, 189, 248, 0.15)",
                  border: "1px solid rgba(56, 189, 248, 0.3)",
                  fontSize: "0.8rem",
                  color: "#38bdf8",
                }}
              >
                ⚡ Canvas Compressed: {compressionInfo.orig} KB → ~{compressionInfo.compressed} KB (
                {compressionInfo.ratio}% smaller for low-network sync)
              </div>
            )}

            {imagePreview && (
              <div style={{ marginTop: "10px", maxWidth: "240px", borderRadius: "8px", overflow: "hidden" }}>
                <img
                  src={imagePreview}
                  alt="Incident Preview"
                  style={{ width: "100%", height: "auto", display: "block" }}
                />
              </div>
            )}
          </div>

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <button
              type="submit"
              disabled={isCompressing}
              style={{
                flex: 1,
                minWidth: "200px",
                padding: "12px 20px",
                background: isOnline ? "#0284c7" : "#0f766e",
                color: "#fff",
                fontWeight: 700,
                fontSize: "1rem",
                borderRadius: "8px",
                border: "none",
                cursor: "pointer",
              }}
            >
              {isOnline ? "📤 Submit Incident Report" : "💾 Save Offline to Sync Queue"}
            </button>

            <button
              type="button"
              onClick={() => setShowSmsModal(true)}
              style={{
                padding: "12px 20px",
                background: "rgba(217, 119, 6, 0.2)",
                color: "#fbbf24",
                border: "1px solid rgba(217, 119, 6, 0.4)",
                borderRadius: "8px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              📱 SMS Fallback
            </button>
          </div>

          {submitted && (
            <div
              style={{
                marginTop: "16px",
                padding: "12px",
                borderRadius: "6px",
                background: "rgba(16, 185, 129, 0.2)",
                border: "1px solid rgba(16, 185, 129, 0.4)",
                color: "#34d399",
                fontSize: "0.9rem",
              }}
            >
              {submitMessage}
            </div>
          )}
        </div>
      </form>

      {/* SMS Fallback Modal */}
      {showSmsModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.75)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "16px",
          }}
        >
          <div
            style={{
              background: "#1e293b",
              borderRadius: "12px",
              padding: "24px",
              maxWidth: "500px",
              width: "100%",
              border: "1px solid rgba(255, 255, 255, 0.2)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ margin: 0, color: "#f8fafc", fontSize: "1.2rem" }}>📱 Emergency SMS Fallback</h3>
              <button
                onClick={() => setShowSmsModal(false)}
                style={{ background: "transparent", border: "none", color: "#94a3b8", fontSize: "1.2rem", cursor: "pointer" }}
              >
                ✕
              </button>
            </div>

            <p style={{ color: "#cbd5e1", fontSize: "0.85rem", lineHeight: 1.5, marginBottom: "16px" }}>
              When data networks (2G/3G/4G) fail completely, send this formatted text to the emergency dispatch helpline via native cellular SMS:
            </p>

            <div style={{ marginBottom: "12px" }}>
              <label style={{ fontSize: "0.8rem", color: "#94a3b8" }}>Emergency Dispatch Number:</label>
              <select
                value={emergencyNumber}
                onChange={(e) => setEmergencyNumber(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px",
                  borderRadius: "6px",
                  background: "#0f172a",
                  color: "#f8fafc",
                  border: "1px solid #334155",
                  marginTop: "4px",
                }}
              >
                <option value="112">112 - National Emergency Support System</option>
                <option value="1070">1070 - State Disaster Management Authority (SDMA)</option>
                <option value="1077">1077 - District Emergency Operation Center (DEOC)</option>
              </select>
            </div>

            <div
              style={{
                background: "#0f172a",
                padding: "12px",
                borderRadius: "6px",
                border: "1px solid #334155",
                fontFamily: "monospace",
                fontSize: "0.85rem",
                color: "#38bdf8",
                whiteSpace: "pre-wrap",
                wordBreak: "break-all",
                marginBottom: "16px",
              }}
            >
              {getSmsPayload()}
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <a
                href={`sms:${emergencyNumber}?body=${encodeURIComponent(getSmsPayload())}`}
                style={{
                  flex: 1,
                  textAlign: "center",
                  padding: "10px",
                  borderRadius: "6px",
                  background: "#0284c7",
                  color: "#fff",
                  textDecoration: "none",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                }}
              >
                📲 Launch SMS App
              </a>

              <button
                type="button"
                onClick={handleCopySms}
                style={{
                  padding: "10px 16px",
                  borderRadius: "6px",
                  background: "#334155",
                  color: "#f8fafc",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "0.9rem",
                }}
              >
                {smsCopied ? "✓ Copied" : "📋 Copy"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reports and Offline Queue Status Section */}
      <div style={{ marginTop: "32px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h2 style={{ fontSize: "1.3rem", color: "#f8fafc", margin: 0 }}>📋 Local & Queued Reports</h2>
          {pendingQueue.length > 0 && (
            <span
              style={{
                fontSize: "0.8rem",
                padding: "4px 8px",
                borderRadius: "12px",
                background: "rgba(245, 158, 11, 0.2)",
                color: "#fbbf24",
                border: "1px solid rgba(245, 158, 11, 0.4)",
              }}
            >
              {pendingQueue.length} pending background sync
            </span>
          )}
        </div>

        {reports.length === 0 ? (
          <p style={{ color: "#64748b" }}>No incident reports submitted on this device yet.</p>
        ) : (
          <div style={{ display: "grid", gap: "12px" }}>
            {reports.map((report) => {
              const isPending = pendingQueue.some((q) => q.operationId === report.operationId);
              return (
                <div
                  key={report.id || report.operationId}
                  style={{
                    background: "#1e293b",
                    borderRadius: "8px",
                    padding: "16px",
                    border: `1px solid ${isPending ? "rgba(245, 158, 11, 0.4)" : "rgba(255, 255, 255, 0.08)"}`,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                    <h3 style={{ margin: 0, fontSize: "1rem", color: "#f8fafc" }}>
                      {report.type} — <span style={{ color: "#38bdf8" }}>{report.severity}</span>
                    </h3>
                    <span
                      style={{
                        fontSize: "0.75rem",
                        padding: "2px 8px",
                        borderRadius: "10px",
                        background: isPending ? "rgba(245, 158, 11, 0.2)" : "rgba(16, 185, 129, 0.2)",
                        color: isPending ? "#fbbf24" : "#34d399",
                      }}
                    >
                      {isPending ? "🟡 Queued for Offline Sync" : "🟢 Synced"}
                    </span>
                  </div>

                  <p style={{ margin: "4px 0", fontSize: "0.85rem", color: "#cbd5e1" }}>
                    📍 <strong>Location:</strong> {report.location}
                  </p>
                  <p style={{ margin: "4px 0", fontSize: "0.85rem", color: "#cbd5e1" }}>
                    📝 <strong>Description:</strong> {report.description}
                  </p>
                  {report.affectedPeople && (
                    <p style={{ margin: "4px 0", fontSize: "0.85rem", color: "#94a3b8" }}>
                      👥 <strong>Affected:</strong> ~{report.affectedPeople} persons
                    </p>
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

export default IncidentReport;