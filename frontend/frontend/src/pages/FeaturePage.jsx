import React from "react";
import { useLocation } from "react-router-dom";

const features = {
  "/alerts": {
    icon: "🚨",
    title: "Disaster Alerts",
    description: "Real-time emergency warnings and disaster alerts.",
  },

  "/map": {
    icon: "🗺️",
    title: "Live Map",
    description: "Monitor disaster locations and emergency areas.",
  },

  "/emergency-sos": {
    icon: "🆘",
    title: "Emergency SOS",
    description: "Emergency assistance and SOS response.",
  },

  "/rescue-centers": {
    icon: "📍",
    title: "Rescue Centers",
    description: "Find nearby rescue and emergency centers.",
  },

  "/shelter-finder": {
    icon: "📍",
    title: "Shelter Finder",
    description: "Find safe shelters during emergencies.",
  },

  "/family-safety": {
    icon: "👥",
    title: "Family Safety",
    description: "Manage family emergency safety information.",
  },

  "/evacuation-planner": {
    icon: "⏱️",
    title: "Evacuation Planner",
    description: "Plan safer evacuation routes.",
  },

  "/qr-rescue-id": {
    icon: "🪪",
    title: "QR Rescue ID",
    description: "Manage your emergency QR Rescue ID.",
  },

  "/notifications": {
    icon: "🔔",
    title: "Notifications",
    description: "View emergency notifications and updates.",
  },

  "/ai-assistant": {
    icon: "🤖",
    title: "AI Assistant",
    description: "AI-powered disaster management assistance.",
  },

  "/voice-assistant": {
    icon: "🎙️",
    title: "Voice Assistant",
    description: "Voice-based emergency assistance.",
  },

  "/damage-assessment": {
    icon: "🛠️",
    title: "Damage Assessment",
    description: "Assess disaster-related damage.",
  },

  "/analytics-reports": {
    icon: "📊",
    title: "Analytics & Reports",
    description: "View disaster analytics and reports.",
  },

  "/safety-guides": {
    icon: "🛡️",
    title: "Safety Guides",
    description: "Important disaster safety information.",
  },

  "/statistics": {
    icon: "📊",
    title: "Statistics",
    description: "View disaster statistics.",
  },

  "/disaster-response-map": {
    icon: "🗺️",
    title: "Disaster Response Map",
    description: "Monitor disaster response operations.",
  },

  "/incident-report": {
    icon: "📝",
    title: "Report Disaster",
    description: "Report a disaster or emergency incident.",
  },

  "/profile": {
    icon: "👤",
    title: "My Profile",
    description: "View and manage your profile.",
  },

  "/settings": {
    icon: "⚙️",
    title: "Settings",
    description: "Manage platform settings.",
  },

  "/logout": {
    icon: "🚪",
    title: "Logout",
    description: "Logout from the disaster management platform.",
  },
};

function FeaturePage() {
  const location = useLocation();

  const feature = features[location.pathname];

  if (!feature) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6 md:p-8">

      {/* Page Header */}
      <div className="mb-8">

        <div className="text-5xl mb-4">
          {feature.icon}
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-white">
          {feature.title}
        </h1>

        <p className="text-slate-400 mt-2">
          {feature.description}
        </p>

      </div>

      {/* Main Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8">

        <div className="flex items-center gap-3 mb-6">

          <div className="w-3 h-3 rounded-full bg-green-500" />

          <span className="text-green-400 font-semibold">
            System Ready
          </span>

        </div>

        <h2 className="text-xl font-bold text-white mb-3">
          {feature.title}
        </h2>

        <p className="text-slate-400 leading-7">
          This module is active and ready for integration
          with the Disaster Management Platform.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">

          <div className="bg-slate-800 rounded-xl p-5">
            <div className="text-2xl mb-3">🟢</div>
            <h3 className="font-semibold text-white">
              Status
            </h3>
            <p className="text-sm text-slate-400 mt-1">
              Active
            </p>
          </div>

          <div className="bg-slate-800 rounded-xl p-5">
            <div className="text-2xl mb-3">⚡</div>
            <h3 className="font-semibold text-white">
              Response
            </h3>
            <p className="text-sm text-slate-400 mt-1">
              Ready
            </p>
          </div>

          <div className="bg-slate-800 rounded-xl p-5">
            <div className="text-2xl mb-3">🔐</div>
            <h3 className="font-semibold text-white">
              Security
            </h3>
            <p className="text-sm text-slate-400 mt-1">
              Protected
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}

export default FeaturePage;