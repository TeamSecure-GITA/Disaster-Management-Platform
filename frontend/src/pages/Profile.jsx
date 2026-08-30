import React, { useState } from "react";
import {
  User, Mail, Phone, MapPin, ShieldCheck, AlertTriangle,
  Heart, Save, Wifi, Radio, CheckCircle2, Clock, Briefcase
} from "lucide-react";

const STORAGE_KEY = "user_profile_data";

const DEFAULT_PROFILE = {
  fullName: "Swayam Samal",
  email: "swayam.samal@example.com",
  phone: "+91 98765 43210",
  role: "First Responder / Citizen",
  zone: "Zone 4 - Coastal District (High Risk)",
  bloodGroup: "O+",
  allergies: "Penicillin",
  medicalConditions: "None",
  emergencyContactName: "Ananya Samal (Sister)",
  emergencyContactPhone: "+91 98765 00000",
  allowLocationTracking: true,
  autoSyncOfflineData: true,
};

// ── Reusable style tokens (vanilla CSS-in-JS, no Tailwind needed) ────────────
const S = {
  page:        { maxWidth: "900px", margin: "0 auto", padding: "24px", color: "#f8fafc" },
  card:        { backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "16px", padding: "24px", marginBottom: "20px" },
  cardDark:    { backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: "16px", padding: "24px", marginBottom: "20px" },
  label:       { display: "block", fontSize: "0.82rem", fontWeight: "600", color: "#94a3b8", marginBottom: "6px" },
  input:       { width: "100%", padding: "10px 14px", backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: "8px", color: "#fff", fontSize: "0.9rem", boxSizing: "border-box", outline: "none" },
  btn:         { width: "100%", padding: "12px", backgroundColor: "#2563eb", color: "#fff", border: "none", borderRadius: "10px", fontWeight: "700", fontSize: "1rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" },
  badge:       { display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "0.75rem", fontWeight: "600", padding: "4px 10px", borderRadius: "999px" },
  tabActive:   { padding: "8px 16px", borderRadius: "10px", border: "none", cursor: "pointer", fontWeight: "600", fontSize: "0.85rem", backgroundColor: "#2563eb", color: "#fff" },
  tabInactive: { padding: "8px 16px", borderRadius: "10px", border: "none", cursor: "pointer", fontWeight: "600", fontSize: "0.85rem", backgroundColor: "#1e293b", color: "#94a3b8" },
  row:         { display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" },
  grid2:       { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" },
  toast:       { position: "fixed", top: "20px", right: "20px", zIndex: 9999, display: "flex", alignItems: "center", gap: "10px", backgroundColor: "#059669", color: "#fff", padding: "12px 18px", borderRadius: "12px", boxShadow: "0 10px 30px rgba(0,0,0,0.4)", fontWeight: "600", fontSize: "0.9rem" },
};

export default function Profile() {
  const [activeTab, setActiveTab] = useState("overview");
  const [isSaved, setIsSaved]     = useState(false);

  const [profile, setProfile] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_PROFILE;
    } catch {
      return DEFAULT_PROFILE;
    }
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProfile((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch {
      alert("Could not save profile. Storage may be full.");
    }
  };

  const initials = profile.fullName
    ? profile.fullName.split(" ").map((n) => n[0]).join("").toUpperCase()
    : "U";

  const TABS = [
    { id: "overview",  label: "👤 Overview" },
    { id: "medical",   label: "🩺 Medical" },
    { id: "emergency", label: "🚨 Emergency" },
    { id: "settings",  label: "⚙️ Settings" },
  ];

  return (
    <div style={S.page}>

      {/* ── Save Toast ───────────────────────────────────────────────── */}
      {isSaved && (
        <div style={S.toast}>
          <CheckCircle2 size={18} /> Profile &amp; Vitals Saved Successfully!
        </div>
      )}

      {/* ── Hero Card ────────────────────────────────────────────────── */}
      <div style={{ ...S.card, background: "linear-gradient(135deg, #0f172a 60%, #1e293b)", position: "relative", overflow: "hidden" }}>
        {/* Decorative blur blob */}
        <div style={{ position: "absolute", top: -40, right: -40, width: 200, height: 200, background: "rgba(37,99,235,0.08)", borderRadius: "50%", filter: "blur(40px)", pointerEvents: "none" }} />

        <div style={{ display: "flex", gap: "24px", alignItems: "flex-start", flexWrap: "wrap", position: "relative" }}>
          {/* Avatar */}
          <div style={{ position: "relative", flexShrink: 0 }}>
            <div style={{ width: 96, height: 96, borderRadius: "16px", background: "linear-gradient(135deg, #2563eb, #6366f1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem", fontWeight: "800", color: "#fff", border: "2px solid #334155" }}>
              {initials}
            </div>
            <span title="PWA Sync Active" style={{ position: "absolute", bottom: -8, right: -8, backgroundColor: "#059669", borderRadius: "50%", padding: "5px", border: "3px solid #0f172a", display: "flex" }}>
              <Wifi size={12} color="#fff" />
            </span>
          </div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: "200px" }}>
            <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap", marginBottom: "6px" }}>
              <h1 style={{ margin: 0, fontSize: "1.6rem", fontWeight: "800" }}>{profile.fullName}</h1>
              <span style={{ ...S.badge, backgroundColor: "rgba(37,99,235,0.12)", color: "#60a5fa", border: "1px solid rgba(37,99,235,0.3)" }}>
                <ShieldCheck size={13} /> {profile.role}
              </span>
            </div>
            <p style={{ margin: "0 0 10px 0", color: "#94a3b8", fontSize: "0.87rem", display: "flex", alignItems: "center", gap: "6px" }}>
              <MapPin size={14} color="#f43f5e" /> {profile.zone}
            </p>
            <div style={S.row}>
              <span style={{ ...S.badge, backgroundColor: "rgba(16,185,129,0.1)", color: "#34d399", border: "1px solid rgba(16,185,129,0.2)" }}>
                <Radio size={12} style={{ animation: "pulse 2s infinite" }} /> Live Mesh Active
              </span>
              <span style={{ ...S.badge, backgroundColor: "#1e293b", color: "#cbd5e1", border: "1px solid #334155" }}>
                <Heart size={12} color="#f43f5e" /> Blood: <strong style={{ color: "#fff" }}>{profile.bloodGroup}</strong>
              </span>
              <span style={{ ...S.badge, backgroundColor: "#1e293b", color: "#cbd5e1", border: "1px solid #334155" }}>
                <Clock size={12} color="#f59e0b" /> {localStorage.getItem(STORAGE_KEY) ? "Saved locally ✓" : "Not yet saved"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tab Bar ──────────────────────────────────────────────────── */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={activeTab === tab.id ? S.tabActive : S.tabInactive}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Form ─────────────────────────────────────────────────────── */}
      <form onSubmit={handleSave}>
        <div style={S.card}>

          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <h2 style={{ margin: "0 0 4px 0", fontSize: "1.1rem", fontWeight: "700" }}>Personal Information</h2>
              {[
                { label: "Full Name",  name: "fullName", icon: <User size={14} /> },
                { label: "Email",      name: "email",    icon: <Mail size={14} /> },
                { label: "Phone",      name: "phone",    icon: <Phone size={14} /> },
                { label: "Role",       name: "role",     icon: <Briefcase size={14} /> },
                { label: "Risk Zone",  name: "zone",     icon: <AlertTriangle size={14} /> },
              ].map(({ label, name, icon }) => (
                <div key={name}>
                  <label style={S.label}><span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>{icon} {label}</span></label>
                  <input name={name} value={profile[name]} onChange={handleChange} style={S.input} />
                </div>
              ))}
            </div>
          )}

          {/* Medical Tab */}
          {activeTab === "medical" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <h2 style={{ margin: "0 0 4px 0", fontSize: "1.1rem", fontWeight: "700" }}>🩺 Medical Information</h2>
              {[
                { label: "Blood Group",        name: "bloodGroup" },
                { label: "Known Allergies",    name: "allergies" },
                { label: "Medical Conditions", name: "medicalConditions" },
              ].map(({ label, name }) => (
                <div key={name}>
                  <label style={S.label}><Heart size={13} color="#f43f5e" style={{ marginRight: "5px", verticalAlign: "middle" }} />{label}</label>
                  <input name={name} value={profile[name]} onChange={handleChange} style={S.input} />
                </div>
              ))}
            </div>
          )}

          {/* Emergency Contact Tab */}
          {activeTab === "emergency" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <h2 style={{ margin: "0 0 4px 0", fontSize: "1.1rem", fontWeight: "700" }}>🚨 Emergency Contact</h2>
              {[
                { label: "Contact Name",  name: "emergencyContactName" },
                { label: "Phone Number",  name: "emergencyContactPhone" },
              ].map(({ label, name }) => (
                <div key={name}>
                  <label style={S.label}><Phone size={13} style={{ marginRight: "5px", verticalAlign: "middle" }} />{label}</label>
                  <input name={name} value={profile[name]} onChange={handleChange} style={S.input} />
                </div>
              ))}
              {profile.emergencyContactPhone && (
                <a
                  href={`tel:${profile.emergencyContactPhone}`}
                  style={{ display: "inline-flex", alignItems: "center", gap: "6px", backgroundColor: "#059669", color: "#fff", padding: "10px 18px", borderRadius: "8px", textDecoration: "none", fontWeight: "700", width: "fit-content" }}
                >
                  📞 Call {profile.emergencyContactName}
                </a>
              )}
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === "settings" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <h2 style={{ margin: "0 0 4px 0", fontSize: "1.1rem", fontWeight: "700" }}>⚙️ Privacy &amp; Sync Settings</h2>
              {[
                { label: "Allow GPS Location Tracking", name: "allowLocationTracking" },
                { label: "Auto-Sync Offline Data",      name: "autoSyncOfflineData" },
              ].map(({ label, name }) => (
                <label key={name} style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer", padding: "12px", backgroundColor: "#0f172a", borderRadius: "8px" }}>
                  <input
                    type="checkbox"
                    name={name}
                    checked={profile[name]}
                    onChange={handleChange}
                    style={{ width: "18px", height: "18px", cursor: "pointer" }}
                  />
                  <span style={{ fontSize: "0.9rem", color: "#cbd5e1" }}>{label}</span>
                </label>
              ))}
            </div>
          )}

          {/* Save Button */}
          <div style={{ marginTop: "20px" }}>
            <button type="submit" style={S.btn}>
              <Save size={16} /> Save Profile
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}