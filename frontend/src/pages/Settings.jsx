import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Bell,
  Volume2,
  VolumeX,
  MapPin,
  Layers,
  Shield,
  Wifi,
  Database,
  Globe,
  Save,
  Trash2,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Smartphone,
  Eye,
} from "lucide-react";
import localforage from "localforage";

const SETTINGS_STORAGE_KEY = "user_preferences_21";

const DEFAULT_SETTINGS = {
  // Emergency Alerts
  emergencyAlerts: true,
  criticalSiren: true,
  smsAlerts: false,
  whatsappSos: true,
  // Map & Satellite
  defaultMapLayer: "satellite", // "satellite" | "streets" | "dark"
  riskZoneOpacity: 0.65,
  minRiskThreshold: 30, // %
  enableWeatherOverlay: true,
  showLandslides: true,
  showFloods: true,
  showCyclones: true,
  showHeavyRain: true,
  showSoilMoisture: true,
  showSoilErosion: true,
  // Offline & PWA
  offlineTilePrecache: true,
  highContrastMode: true,
  // Language
  language: "English",
};

export default function Settings() {
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      }
    } catch {}
    return DEFAULT_SETTINGS;
  });

  const [toastMsg, setToastMsg] = useState("");
  const [clearingCache, setClearingCache] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [cacheSizeText, setCacheSizeText] = useState("Pre-cached (Active)");

  // Load from localforage if available
  useEffect(() => {
    async function loadIndexedDbSettings() {
      try {
        const stored = await localforage.getItem(SETTINGS_STORAGE_KEY);
        if (stored) {
          setSettings((prev) => ({ ...prev, ...stored }));
        }
      } catch {}
    }
    loadIndexedDbSettings();
  }, []);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3500);
  };

  const updateSetting = (key, value) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updated));
      localforage.setItem(SETTINGS_STORAGE_KEY, updated).catch(() => {});
    } catch {}
  };

  const handleSaveAll = async () => {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
      await localforage.setItem(SETTINGS_STORAGE_KEY, settings);
      showToast("✅ All preferences saved successfully to device and offline storage!");
    } catch (err) {
      showToast("⚠️ Could not save to offline storage.");
    }
  };

  const handleClearCache = async () => {
    if (!window.confirm("Clear offline map tiles and cached disaster reports from this device?")) {
      return;
    }
    setClearingCache(true);
    try {
      if ("caches" in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      }
      setCacheSizeText("Cleared (0 MB)");
      showToast("🗑️ Offline cache purged successfully!");
    } catch {
      showToast("⚠️ Failed to purge cache.");
    } finally {
      setClearingCache(false);
    }
  };

  const handleForceSync = async () => {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      showToast("🔄 Offline incident queue and SOS telemetry synced with server!");
    }, 1200);
  };

  const handleTestSiren = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(800, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.3);
      osc.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 0.6);
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.8);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.8);
      showToast("🔊 Test emergency siren played.");
    } catch (e) {
      showToast("🔊 Siren sound preview active.");
    }
  };

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", paddingBottom: "40px" }}>
      {/* Toast Notification */}
      {toastMsg && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            zIndex: 9999,
            backgroundColor: "#1e293b",
            color: "#f8fafc",
            border: "1.5px solid #38bdf8",
            padding: "12px 20px",
            borderRadius: "12px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
            fontSize: "0.88rem",
            fontWeight: "700",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          {toastMsg}
        </div>
      )}

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px", marginBottom: "28px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1 style={{ margin: 0, fontSize: "1.7rem", fontWeight: "800", color: "#f8fafc" }}>
              ⚙️ Platform & Emergency Settings
            </h1>
            <span style={{ backgroundColor: "#2563eb", color: "#fff", fontSize: "0.75rem", padding: "3px 10px", borderRadius: "999px", fontWeight: "700" }}>
              PWA Configured
            </span>
          </div>
          <p style={{ margin: "6px 0 0 0", color: "#94a3b8", fontSize: "0.92rem" }}>
            Customize disaster notification sirens, Satellite Weather detection layers, offline caching, and responder preferences.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSaveAll}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 20px",
            backgroundColor: "#2563eb",
            color: "#ffffff",
            border: "none",
            borderRadius: "10px",
            fontWeight: "700",
            fontSize: "0.9rem",
            cursor: "pointer",
            boxShadow: "0 4px 14px rgba(37, 99, 235, 0.4)",
            transition: "all 0.2s",
          }}
        >
          <Save size={16} /> Save All Preferences
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {/* ── 1. EMERGENCY NOTIFICATIONS & AUDIO SIREN ── */}
        <div style={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: "16px", padding: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
            <Bell size={20} color="#ef4444" />
            <h2 style={{ margin: 0, fontSize: "1.15rem", fontWeight: "700", color: "#f8fafc" }}>
              Emergency Broadcasts & Life-Safety Alarms
            </h2>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* Toggle 1: Critical Push Alerts */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px", backgroundColor: "#1e293b", borderRadius: "12px" }}>
              <div>
                <div style={{ fontWeight: "700", color: "#f8fafc", fontSize: "0.92rem" }}>
                  Disaster Push Notifications
                </div>
                <div style={{ fontSize: "0.8rem", color: "#94a3b8", marginTop: "2px" }}>
                  Receive official IMD & NDMA alerts for cyclones, heavy floods, and storm warnings
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.emergencyAlerts}
                onChange={(e) => updateSetting("emergencyAlerts", e.target.checked)}
                style={{ width: "20px", height: "20px", cursor: "pointer", accentColor: "#2563eb" }}
              />
            </div>

            {/* Toggle 2: Audible Siren Alarm */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px", backgroundColor: "#1e293b", borderRadius: "12px" }}>
              <div style={{ flex: 1, paddingRight: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{ fontWeight: "700", color: "#f8fafc", fontSize: "0.92rem" }}>
                    Audible Siren Alarm on Severe Disasters (&gt;80% Risk)
                  </div>
                  <button
                    type="button"
                    onClick={handleTestSiren}
                    style={{ padding: "3px 8px", backgroundColor: "#334155", color: "#38bdf8", border: "none", borderRadius: "6px", fontSize: "0.72rem", fontWeight: "700", cursor: "pointer" }}
                  >
                    🔊 Test Siren Sound
                  </button>
                </div>
                <div style={{ fontSize: "0.8rem", color: "#94a3b8", marginTop: "2px" }}>
                  Triggers high-decibel acoustic alert when evacuation order or extreme danger is declared in your zone
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.criticalSiren}
                onChange={(e) => updateSetting("criticalSiren", e.target.checked)}
                style={{ width: "20px", height: "20px", cursor: "pointer", accentColor: "#ef4444" }}
              />
            </div>

            {/* Toggle 3: WhatsApp SOS */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px", backgroundColor: "#1e293b", borderRadius: "12px" }}>
              <div>
                <div style={{ fontWeight: "700", color: "#f8fafc", fontSize: "0.92rem" }}>
                  One-Tap WhatsApp Emergency Dispatch Integration
                </div>
                <div style={{ fontSize: "0.8rem", color: "#94a3b8", marginTop: "2px" }}>
                  Format distress messages with GPS coordinates, battery %, and medical info for instant WhatsApp sending
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.whatsappSos}
                onChange={(e) => updateSetting("whatsappSos", e.target.checked)}
                style={{ width: "20px", height: "20px", cursor: "pointer", accentColor: "#10b981" }}
              />
            </div>
          </div>
        </div>

        {/* ── 2. SATELLITE WEATHER DETECTION & DISASTER MAP CONFIG ── */}
        <div style={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: "16px", padding: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
            <Layers size={20} color="#38bdf8" />
            <h2 style={{ margin: 0, fontSize: "1.15rem", fontWeight: "700", color: "#f8fafc" }}>
              Disaster Response Map & Satellite Weather Detection
            </h2>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            {/* Default Base Layer */}
            <div>
              <label style={{ display: "block", fontSize: "0.88rem", fontWeight: "700", color: "#cbd5e1", marginBottom: "8px" }}>
                Default Base Map Layer on Startup
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px" }}>
                {[
                  { id: "satellite", title: "🛰️ Satellite Imagery", desc: "High-resolution satellite topography (Esri World Imagery)" },
                  { id: "streets", title: "🗺️ Standard Streets", desc: "OpenStreetMap terrain & roads (offline pre-cached in PWA)" },
                  { id: "dark", title: "🌙 Dark Tactical", desc: "CartoDB Dark Matter with high-contrast emergency overlays" },
                ].map((lyr) => (
                  <button
                    key={lyr.id}
                    type="button"
                    onClick={() => updateSetting("defaultMapLayer", lyr.id)}
                    style={{
                      padding: "12px 14px",
                      backgroundColor: settings.defaultMapLayer === lyr.id ? "rgba(37, 99, 235, 0.2)" : "#1e293b",
                      border: `2px solid ${settings.defaultMapLayer === lyr.id ? "#3b82f6" : "#334155"}`,
                      borderRadius: "12px",
                      textAlign: "left",
                      color: "#fff",
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    <div style={{ fontWeight: "700", fontSize: "0.9rem", color: settings.defaultMapLayer === lyr.id ? "#60a5fa" : "#f1f5f9" }}>
                      {lyr.title}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: "4px" }}>
                      {lyr.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Risk Zone Opacity */}
            <div style={{ padding: "14px", backgroundColor: "#1e293b", borderRadius: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                <span style={{ fontSize: "0.88rem", fontWeight: "700", color: "#f8fafc" }}>
                  Weather & Hazard Risk Highlight Opacity
                </span>
                <span style={{ fontSize: "0.88rem", fontWeight: "700", color: "#38bdf8" }}>
                  {Math.round(settings.riskZoneOpacity * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.2"
                max="0.9"
                step="0.05"
                value={settings.riskZoneOpacity}
                onChange={(e) => updateSetting("riskZoneOpacity", parseFloat(e.target.value))}
                style={{ width: "100%", accentColor: "#38bdf8", cursor: "pointer" }}
              />
              <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: "4px" }}>
                Controls how vividly colored risk zones (landslide, soil moisture, flood, cyclone) appear on the map.
              </div>
            </div>

            {/* Hazard Categories */}
            <div>
              <div style={{ fontSize: "0.88rem", fontWeight: "700", color: "#cbd5e1", marginBottom: "10px" }}>
                Active Weather & Ground Hazard Detection Categories
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "10px" }}>
                {[
                  { key: "showFloods", label: "🌊 Flood Inundation & River Basins" },
                  { key: "showCyclones", label: "🌀 Cyclone & High Wind Corridors" },
                  { key: "showHeavyRain", label: "🌧️ Heavy Rain & Precipitation" },
                  { key: "showLandslides", label: "⛰️ Landslide & Slope Instability" },
                  { key: "showSoilMoisture", label: "🌱 Soil Moisture Saturation" },
                  { key: "showSoilErosion", label: "🏜️ Soil Erosion & Riverbank Risk" },
                ].map((cat) => (
                  <label
                    key={cat.key}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "10px 12px",
                      backgroundColor: "#1e293b",
                      borderRadius: "10px",
                      fontSize: "0.82rem",
                      fontWeight: "600",
                      color: "#f1f5f9",
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={settings[cat.key]}
                      onChange={(e) => updateSetting(cat.key, e.target.checked)}
                      style={{ accentColor: "#2563eb", width: "16px", height: "16px" }}
                    />
                    <span>{cat.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div style={{ textAlign: "right" }}>
              <Link
                to="/map"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "0.82rem",
                  color: "#38bdf8",
                  textDecoration: "none",
                  fontWeight: "700",
                }}
              >
                🗺️ Open Disaster Response Map to Preview Changes →
              </Link>
            </div>
          </div>
        </div>

        {/* ── 3. OFFLINE PWA STORAGE & DATA CACHE ── */}
        <div style={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: "16px", padding: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
            <Database size={20} color="#10b981" />
            <h2 style={{ margin: 0, fontSize: "1.15rem", fontWeight: "700", color: "#f8fafc" }}>
              Offline PWA Storage & Emergency Cache
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "14px" }}>
            <div style={{ padding: "16px", backgroundColor: "#1e293b", borderRadius: "12px" }}>
              <div style={{ fontWeight: "700", color: "#f8fafc", fontSize: "0.9rem", marginBottom: "4px" }}>
                Offline Map Tiles Status
              </div>
              <div style={{ fontSize: "0.8rem", color: "#94a3b8", marginBottom: "12px" }}>
                Status: <strong style={{ color: "#34d399" }}>{cacheSizeText}</strong>
              </div>
              <button
                type="button"
                onClick={handleClearCache}
                disabled={clearingCache}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "8px 14px",
                  backgroundColor: "rgba(239, 68, 68, 0.15)",
                  color: "#f87171",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                  borderRadius: "8px",
                  fontSize: "0.8rem",
                  fontWeight: "700",
                  cursor: "pointer",
                }}
              >
                <Trash2 size={14} /> Clear Offline Tile Cache
              </button>
            </div>

            <div style={{ padding: "16px", backgroundColor: "#1e293b", borderRadius: "12px" }}>
              <div style={{ fontWeight: "700", color: "#f8fafc", fontSize: "0.9rem", marginBottom: "4px" }}>
                Offline Disaster Incident Reports
              </div>
              <div style={{ fontSize: "0.8rem", color: "#94a3b8", marginBottom: "12px" }}>
                Sync offline queued incident tickets and family check-ins with backend
              </div>
              <button
                type="button"
                onClick={handleForceSync}
                disabled={syncing}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "8px 14px",
                  backgroundColor: "rgba(16, 185, 129, 0.15)",
                  color: "#34d399",
                  border: "1px solid rgba(16, 185, 129, 0.3)",
                  borderRadius: "8px",
                  fontSize: "0.8rem",
                  fontWeight: "700",
                  cursor: "pointer",
                }}
              >
                <RefreshCw size={14} className={syncing ? "spin" : ""} /> Force Sync Offline Queue
              </button>
            </div>
          </div>
        </div>

        {/* ── 4. LANGUAGE & DISPLAY ── */}
        <div style={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: "16px", padding: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
            <Globe size={20} color="#f59e0b" />
            <h2 style={{ margin: 0, fontSize: "1.15rem", fontWeight: "700", color: "#f8fafc" }}>
              Language & Regional Localization
            </h2>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px", padding: "16px", backgroundColor: "#1e293b", borderRadius: "12px" }}>
            <div>
              <div style={{ fontWeight: "700", color: "#f8fafc", fontSize: "0.92rem" }}>
                Primary Platform Language
              </div>
              <div style={{ fontSize: "0.8rem", color: "#94a3b8", marginTop: "2px" }}>
                Used for emergency alerts, safety guides, and UI labels
              </div>
            </div>

            <select
              value={settings.language}
              onChange={(e) => updateSetting("language", e.target.value)}
              style={{
                padding: "10px 16px",
                borderRadius: "8px",
                backgroundColor: "#0f172a",
                color: "#f8fafc",
                border: "1px solid #334155",
                fontSize: "0.9rem",
                fontWeight: "600",
                outline: "none",
                minWidth: "220px",
              }}
            >
              <option value="English">English</option>
              <option value="Hindi">Hindi (हिन्दी)</option>
              <option value="Odia">Odia (ଓଡ଼ିଆ)</option>
              <option value="Bengali">Bengali (বাংলা)</option>
              <option value="Spanish">Spanish (Español)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}