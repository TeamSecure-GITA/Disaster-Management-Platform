import React, { useState, useEffect } from "react";
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

export default function Profile() {
  const [activeTab, setActiveTab] = useState("overview");
  const [isSaved, setIsSaved] = useState(false);

  // ── Load from localStorage on mount ──────────────────────────────────────
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
    setProfile((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // ── Save to localStorage ─────────────────────────────────────────────────
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

  const tabs = [
    { id: "overview",  label: "👤 Overview" },
    { id: "medical",   label: "🩺 Medical" },
    { id: "emergency", label: "🚨 Emergency Contact" },
    { id: "settings",  label: "⚙️ Settings" },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
      {/* ── Save Toast ─────────────────────────────────────────────────────── */}
      {isSaved && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-2xl animate-bounce">
          <CheckCircle2 className="w-5 h-5" />
          <span className="text-sm font-semibold">Profile & Vitals Saved Successfully!</span>
        </div>
      )}

      {/* ── Hero Card ──────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-800 border border-slate-800 rounded-3xl p-6 sm:p-8 mb-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 relative z-10">
          <div className="relative">
            <div className="w-28 h-28 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-3xl font-extrabold text-white shadow-xl border-2 border-slate-700">
              {profile.fullName
                ? profile.fullName.split(" ").map((n) => n[0]).join("")
                : "U"}
            </div>
            <span
              className="absolute -bottom-2 -right-2 bg-emerald-500 text-slate-950 p-1.5 rounded-full border-4 border-slate-900 shadow"
              title="PWA Online Sync Ready"
            >
              <Wifi className="w-4 h-4 font-bold" />
            </span>
          </div>

          <div className="flex-1 text-center md:text-left space-y-2">
            <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{profile.fullName}</h1>
              <span className="bg-blue-500/10 text-blue-400 border border-blue-500/30 text-xs px-3 py-1 rounded-full font-semibold flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" /> {profile.role}
              </span>
            </div>
            <p className="text-slate-400 text-sm flex items-center justify-center md:justify-start gap-1.5">
              <MapPin className="w-4 h-4 text-rose-500 shrink-0" /> {profile.zone}
            </p>
            <div className="pt-2 flex flex-wrap gap-2 justify-center md:justify-start">
              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs px-3 py-1 rounded-lg font-medium flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 animate-pulse" /> Live Mesh Active
              </span>
              <span className="bg-slate-800 text-slate-300 border border-slate-700 text-xs px-3 py-1 rounded-lg font-medium flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-rose-400" /> Blood Group: <strong className="text-white">{profile.bloodGroup}</strong>
              </span>
              <span className="bg-slate-800 text-slate-300 border border-slate-700 text-xs px-3 py-1 rounded-lg font-medium flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" /> Last saved: {localStorage.getItem(STORAGE_KEY) ? "Saved locally" : "Not yet saved"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tabs ───────────────────────────────────────────────────────────── */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
              activeTab === tab.id
                ? "bg-blue-600 text-white"
                : "bg-slate-800 text-slate-400 hover:bg-slate-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Form ───────────────────────────────────────────────────────────── */}
      <form onSubmit={handleSave}>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">

          {activeTab === "overview" && (
            <>
              <h2 className="text-lg font-bold text-white">Personal Information</h2>
              {[
                { label: "Full Name",  name: "fullName", icon: <User className="w-4 h-4" /> },
                { label: "Email",      name: "email",    icon: <Mail className="w-4 h-4" /> },
                { label: "Phone",      name: "phone",    icon: <Phone className="w-4 h-4" /> },
                { label: "Role",       name: "role",     icon: <Briefcase className="w-4 h-4" /> },
                { label: "Risk Zone",  name: "zone",     icon: <AlertTriangle className="w-4 h-4" /> },
              ].map(({ label, name, icon }) => (
                <div key={name}>
                  <label className="block text-sm font-medium text-slate-400 mb-1 flex items-center gap-1.5">
                    {icon} {label}
                  </label>
                  <input
                    name={name}
                    value={profile[name]}
                    onChange={handleChange}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              ))}
            </>
          )}

          {activeTab === "medical" && (
            <>
              <h2 className="text-lg font-bold text-white">Medical Information</h2>
              {[
                { label: "Blood Group",         name: "bloodGroup" },
                { label: "Allergies",           name: "allergies" },
                { label: "Medical Conditions",  name: "medicalConditions" },
              ].map(({ label, name }) => (
                <div key={name}>
                  <label className="block text-sm font-medium text-slate-400 mb-1">
                    <Heart className="inline w-4 h-4 text-rose-400 mr-1" /> {label}
                  </label>
                  <input
                    name={name}
                    value={profile[name]}
                    onChange={handleChange}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              ))}
            </>
          )}

          {activeTab === "emergency" && (
            <>
              <h2 className="text-lg font-bold text-white">Emergency Contact</h2>
              {[
                { label: "Contact Name",  name: "emergencyContactName" },
                { label: "Contact Phone", name: "emergencyContactPhone" },
              ].map(({ label, name }) => (
                <div key={name}>
                  <label className="block text-sm font-medium text-slate-400 mb-1">
                    <Phone className="inline w-4 h-4 mr-1" /> {label}
                  </label>
                  <input
                    name={name}
                    value={profile[name]}
                    onChange={handleChange}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              ))}
              {profile.emergencyContactPhone && (
                <a
                  href={`tel:${profile.emergencyContactPhone}`}
                  className="inline-flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-semibold"
                >
                  📞 Call {profile.emergencyContactName}
                </a>
              )}
            </>
          )}

          {activeTab === "settings" && (
            <>
              <h2 className="text-lg font-bold text-white">Privacy & Sync Settings</h2>
              {[
                { label: "Allow GPS Location Tracking", name: "allowLocationTracking" },
                { label: "Auto-Sync Offline Data",      name: "autoSyncOfflineData" },
              ].map(({ label, name }) => (
                <label key={name} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name={name}
                    checked={profile[name]}
                    onChange={handleChange}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-slate-300">{label}</span>
                </label>
              ))}
            </>
          )}

          {/* Save Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            <Save className="w-4 h-4" />
            Save Profile
          </button>
        </div>
      </form>
    </div>
  );
}