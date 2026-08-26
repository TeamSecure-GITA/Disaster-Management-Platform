import React, { useState } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  AlertTriangle,
  Heart,
  Save,
  Wifi,
  Radio,
  CheckCircle2,
  Clock,
  Briefcase
} from "lucide-react";

export default function Profile() {
  const [activeTab, setActiveTab] = useState("overview");
  const [isSaved, setIsSaved] = useState(false);

  const [profile, setProfile] = useState({
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
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Save Notification Toast */}
      {isSaved && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-2xl animate-bounce">
          <CheckCircle2 className="w-5 h-5" />
          <span className="text-sm font-semibold">Profile & Vitals Saved Successfully!</span>
        </div>
      )}

      {/* Hero Header Card */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-800 border border-slate-800 rounded-3xl p-6 sm:p-8 mb-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 relative z-10">
          {/* Avatar / Profile Image */}
          <div className="relative">
            <div className="w-28 h-28 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-3xl font-extrabold text-white shadow-xl border-2 border-slate-700">
              {profile.fullName
                ? profile.fullName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                : "U"}
            </div>
            <span className="absolute -bottom-2 -right-2 bg-emerald-500 text-slate-950 p-1.5 rounded-full border-4 border-slate-900 shadow" title="PWA Online Sync Ready">
              <Wifi className="w-4 h-4 font-bold" />
            </span>
          </div>

          {/* User Details Header */}
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

            {/* Live Metrics Bar */}
            <div className="pt-2 flex flex-wrap gap-2 justify-center md:justify-start">
              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs px-3 py-1 rounded-lg font-medium flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 animate-pulse" /> Live Mesh Active
              </span>
              <span className="bg-slate-800 text-slate-300 border border-slate-700 text-xs px-3 py-1 rounded-lg font-medium flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-rose-400" /> Blood Group: <strong className="text-white">{profile.bloodGroup}</strong>
              </span>
              <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs px-3 py-1 rounded-lg font-medium flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> Last Sync: Just now
              </span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 mt-8 gap-6 text-sm font-medium overflow-x-auto">
          <button
            onClick={() => setActiveTab("overview")}
            className={`pb-3 transition-colors border-b-2 whitespace-nowrap ${
              activeTab === "overview"
                ? "border-blue-500 text-blue-400 font-semibold"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            Personal & Contact Details
          </button>
          <button
            onClick={() => setActiveTab("vitals")}
            className={`pb-3 transition-colors border-b-2 whitespace-nowrap ${
              activeTab === "vitals"
                ? "border-blue-500 text-blue-400 font-semibold"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            Emergency & Medical Vitals
          </button>
          <button
            onClick={() => setActiveTab("pwa")}
            className={`pb-3 transition-colors border-b-2 whitespace-nowrap ${
              activeTab === "pwa"
                ? "border-blue-500 text-blue-400 font-semibold"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            PWA Offline & Location Settings
          </button>
        </div>
      </div>

      {/* Form Content Body */}
      <form onSubmit={handleSave}>
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left 2 Columns: Main Fields */}
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-400" /> Basic Information
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                    <input
                      type="text"
                      name="fullName"
                      value={profile.fullName}
                      onChange={handleChange}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Role / Capacity
                  </label>
                  <div className="relative">
                    <Briefcase className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                    <select
                      name="role"
                      value={profile.role}
                      onChange={handleChange}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-100 focus:outline-none focus:border-blue-500 transition-all"
                    >
                      <option>First Responder / Citizen</option>
                      <option>Medical Volunteer</option>
                      <option>Shelter Manager</option>
                      <option>Disaster Relief Admin</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                    <input
                      type="email"
                      name="email"
                      value={profile.email}
                      onChange={handleChange}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-100 focus:outline-none focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Primary Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                    <input
                      type="text"
                      name="phone"
                      value={profile.phone}
                      onChange={handleChange}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-100 focus:outline-none focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Assigned Emergency Zone
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                  <input
                    type="text"
                    name="zone"
                    value={profile.zone}
                    onChange={handleChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-100 focus:outline-none focus:border-blue-500 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Right Column: Emergency SOS Card */}
            <div className="bg-gradient-to-b from-rose-950/30 to-slate-900 border border-rose-900/40 rounded-3xl p-6 space-y-5 shadow-xl">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-lg">
                <AlertTriangle className="w-5 h-5" /> Quick Dispatch Contact
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                This contact receives instant automated SMS & GPS coordinates whenever you trigger an SOS signal.
              </p>

              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Contact Name</label>
                  <input
                    type="text"
                    name="emergencyContactName"
                    value={profile.emergencyContactName}
                    onChange={handleChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-sm text-slate-100 focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Emergency Phone Number</label>
                  <input
                    type="text"
                    name="emergencyContactPhone"
                    value={profile.emergencyContactPhone}
                    onChange={handleChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-sm text-slate-100 focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "vitals" && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl max-w-3xl">
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-500" /> Medical Profile & Triage Notes
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Blood Group
                </label>
                <select
                  name="bloodGroup"
                  value={profile.bloodGroup}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-4 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                >
                  <option>A+</option>
                  <option>A-</option>
                  <option>B+</option>
                  <option>B-</option>
                  <option>O+</option>
                  <option>O-</option>
                  <option>AB+</option>
                  <option>AB-</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Known Allergies
                </label>
                <input
                  type="text"
                  name="allergies"
                  value={profile.allergies}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-4 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Existing Medical Conditions / Medications
              </label>
              <textarea
                name="medicalConditions"
                rows="3"
                value={profile.medicalConditions}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        )}

        {activeTab === "pwa" && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl max-w-3xl">
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Wifi className="w-5 h-5 text-emerald-400" /> PWA Capabilities & Storage Controls
            </h2>

            <div className="space-y-4">
              <label className="flex items-center justify-between p-4 rounded-2xl bg-slate-950 border border-slate-800 cursor-pointer">
                <div>
                  <p className="font-semibold text-sm">Background GPS Beaconing</p>
                  <p className="text-xs text-slate-400">Allows emergency response maps to locate you during active distress mode.</p>
                </div>
                <input
                  type="checkbox"
                  name="allowLocationTracking"
                  checked={profile.allowLocationTracking}
                  onChange={handleChange}
                  className="w-5 h-5 accent-blue-600 rounded"
                />
              </label>

              <label className="flex items-center justify-between p-4 rounded-2xl bg-slate-950 border border-slate-800 cursor-pointer">
                <div>
                  <p className="font-semibold text-sm">Auto-Sync IndexedDB Queue</p>
                  <p className="text-xs text-slate-400">Automatically uploads cached offline reports as soon as network returns.</p>
                </div>
                <input
                  type="checkbox"
                  name="autoSyncOfflineData"
                  checked={profile.autoSyncOfflineData}
                  onChange={handleChange}
                  className="w-5 h-5 accent-blue-600 rounded"
                />
              </label>
            </div>
          </div>
        )}

        {/* Action Button Bar */}
        <div className="mt-8 flex justify-end">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm px-8 py-3 rounded-2xl transition-all flex items-center gap-2 shadow-lg shadow-blue-600/25 active:scale-95"
          >
            <Save className="w-4 h-4" /> Save Profile & Settings
          </button>
        </div>
      </form>
    </div>
  );
}