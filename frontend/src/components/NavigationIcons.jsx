// ─────────────────────────────────────────────────────────────────────────────
// src/components/NavigationIcons.jsx
//
// Real, vibrant, high-fidelity emergency & disaster SVG graphic icons
// with custom gradients, 3D shadows, and category-specific colors.
// ─────────────────────────────────────────────────────────────────────────────
import React from "react";

export function IconDashboard({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ filter: "drop-shadow(0 2px 4px rgba(14,165,233,0.35))" }}>
      <rect x="2" y="2" width="9" height="9" rx="2.5" fill="url(#dash-g1)" />
      <rect x="13" y="2" width="9" height="5" rx="2" fill="url(#dash-g2)" />
      <rect x="13" y="9" width="9" height="13" rx="2.5" fill="url(#dash-g3)" />
      <rect x="2" y="13" width="9" height="9" rx="2.5" fill="url(#dash-g4)" />
      <circle cx="6.5" cy="6.5" r="1.6" fill="#ffffff" opacity="0.95" />
      <circle cx="6.5" cy="17.5" r="1.6" fill="#ffffff" opacity="0.95" />
      <circle cx="17.5" cy="15.5" r="1.6" fill="#ffffff" opacity="0.95" />
      <defs>
        <linearGradient id="dash-g1" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#38bdf8"/><stop offset="100%" stopColor="#2563eb"/></linearGradient>
        <linearGradient id="dash-g2" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#22d3ee"/><stop offset="100%" stopColor="#0284c7"/></linearGradient>
        <linearGradient id="dash-g3" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#6366f1"/><stop offset="100%" stopColor="#4338ca"/></linearGradient>
        <linearGradient id="dash-g4" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#0284c7"/><stop offset="100%" stopColor="#0369a1"/></linearGradient>
      </defs>
    </svg>
  );
}

export function IconLandslide({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ filter: "drop-shadow(0 2px 4px rgba(245,158,11,0.35))" }}>
      <path d="M12 2.5L2 20h20L12 2.5z" fill="url(#land-mountain)" />
      <path d="M12 2.5L16 11l-3 4-2-2-4 7h11L12 2.5z" fill="url(#land-snow)" opacity="0.9" />
      <circle cx="12" cy="11.5" r="2.8" fill="#ef4444" />
      <path d="M12 10v2" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="12" cy="13.2" r="0.5" fill="#ffffff" />
      <path d="M7 17l2-2 2 1" stroke="#fef08a" strokeWidth="1.4" strokeLinecap="round" />
      <defs>
        <linearGradient id="land-mountain" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#f59e0b"/><stop offset="100%" stopColor="#b45309"/></linearGradient>
        <linearGradient id="land-snow" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#fed7aa"/><stop offset="100%" stopColor="#ea580c"/></linearGradient>
      </defs>
    </svg>
  );
}

export function IconAlerts({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ filter: "drop-shadow(0 2px 6px rgba(239,68,68,0.5))" }}>
      <rect x="4" y="16" width="16" height="5" rx="2" fill="url(#alert-base)" />
      <path d="M6 16C6 10 9 4 12 4s6 6 6 12H6z" fill="url(#alert-dome)" />
      <path d="M12 4v4" stroke="#fef08a" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M4 8C2.5 10 2.5 14 4 16" stroke="#f87171" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M20 8c1.5 2 1.5 6 0 8" stroke="#f87171" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="12" cy="11" r="2" fill="#ffffff" opacity="0.95" />
      <defs>
        <linearGradient id="alert-base" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#475569"/><stop offset="100%" stopColor="#1e293b"/></linearGradient>
        <linearGradient id="alert-dome" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#ef4444"/><stop offset="100%" stopColor="#dc2626"/></linearGradient>
      </defs>
    </svg>
  );
}

export function IconClimate({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ filter: "drop-shadow(0 2px 4px rgba(6,182,212,0.35))" }}>
      <circle cx="12" cy="12" r="9.5" fill="url(#climate-globe)" />
      <path d="M4 12c3-4 6 2 9-1s4 4 7 1" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M7 7c2 2 5-1 8 1" stroke="#a5f3fc" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <circle cx="16" cy="8" r="3" fill="#fbbf24" opacity="0.9" />
      <path d="M14 16c2 1 5 1 6-2" stroke="#e0f2fe" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <defs>
        <linearGradient id="climate-globe" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#0891b2"/><stop offset="100%" stopColor="#0e7490"/></linearGradient>
      </defs>
    </svg>
  );
}

export function IconMap({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ filter: "drop-shadow(0 3px 6px rgba(14,165,233,0.5))" }}>
      {/* Tactical Map Grid Tile */}
      <polygon points="2 6 8.5 3 15.5 6.5 22 3.5 22 17.5 15.5 20.5 8.5 17 2 20" fill="url(#map-tactical-mesh)" />
      
      {/* Topographic Relief Lines */}
      <path d="M2 11c3.5-1.5 5.5.5 6.5 0s4-2 7 0 4.5-.5 6.5-1" stroke="#38bdf8" strokeWidth="0.8" opacity="0.8" fill="none" />
      <path d="M2 15c3-1 6 1 6.5.5s4-1.5 7 .5 4.5 0 6.5-.5" stroke="#34d399" strokeWidth="0.8" opacity="0.8" fill="none" />
      
      {/* Radar Target Rings */}
      <circle cx="12" cy="11.5" r="5" stroke="#38bdf8" strokeWidth="0.9" strokeDasharray="1.5 1.5" opacity="0.75" />
      <circle cx="12" cy="11.5" r="2.2" stroke="#f43f5e" strokeWidth="0.8" opacity="0.6" />

      {/* 3D Ruby Geo-Pin with Pulsing Drop Shadow */}
      <ellipse cx="12" cy="16.2" rx="2.5" ry="1" fill="#000000" opacity="0.35" />
      <path d="M12 4.5C9.8 4.5 8 6.3 8 8.5c0 3.2 4 7.2 4 7.2s4-4 4-7.2c0-2.2-1.8-4-4-4z" fill="url(#pin-ruby-3d)" />
      
      {/* Glowing Inner Core & Gloss */}
      <circle cx="12" cy="8.5" r="1.6" fill="#ffffff" />
      <circle cx="12" cy="8.5" r="0.8" fill="#fbbf24" />
      <path d="M10 6.2a2 2 0 0 1 2-1" stroke="#ffffff" strokeWidth="0.6" strokeLinecap="round" opacity="0.8" />

      <defs>
        <linearGradient id="map-tactical-mesh" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0284c7" />
          <stop offset="50%" stopColor="#0f766e" />
          <stop offset="100%" stopColor="#064e3b" />
        </linearGradient>
        <linearGradient id="pin-ruby-3d" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ff2a55" />
          <stop offset="60%" stopColor="#e11d48" />
          <stop offset="100%" stopColor="#9f1239" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function IconSos({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ filter: "drop-shadow(0 3px 8px rgba(239,68,68,0.7))" }}>
      {/* Radial Distress Signal Waves */}
      <path d="M2.5 8.5C1.5 10.5 1.5 13.5 2.5 15.5" stroke="#f87171" strokeWidth="1.5" strokeLinecap="round" opacity="0.85" />
      <path d="M21.5 8.5c1 2 1 5 0 7" stroke="#f87171" strokeWidth="1.5" strokeLinecap="round" opacity="0.85" />
      
      {/* Outer Rotating Hazard Beacon Ring */}
      <rect x="3.5" y="3.5" width="17" height="17" rx="6" fill="url(#sos-beacon-grad)" />
      <rect x="4.2" y="4.2" width="15.6" height="15.6" rx="5.2" stroke="#fef08a" strokeWidth="0.8" opacity="0.7" />
      
      {/* Emergency Beacon Core Shield */}
      <rect x="5.2" y="6" width="13.6" height="12" rx="3.5" fill="#0f172a" />
      
      {/* Bold Crisp "SOS" Lettering with Emergency Yellow Dot */}
      <text
        x="12"
        y="14.2"
        textAnchor="middle"
        fill="#ffffff"
        fontWeight="900"
        fontSize="6.2"
        fontFamily="system-ui, -apple-system, sans-serif"
        letterSpacing="0.6"
      >
        SOS
      </text>

      {/* Beacon Light Alert Flash on Top */}
      <circle cx="12" cy="3.5" r="1.8" fill="#facc15" />
      <circle cx="12" cy="3.5" r="0.9" fill="#ffffff" />
      
      <defs>
        <linearGradient id="sos-beacon-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ff1e1e" />
          <stop offset="50%" stopColor="#dc2626" />
          <stop offset="100%" stopColor="#7f1d1d" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function IconRescue({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ filter: "drop-shadow(0 2px 5px rgba(244,63,94,0.4))" }}>
      <rect x="2.5" y="3.5" width="19" height="17" rx="3.5" fill="url(#rescue-bg)" />
      <rect x="9.5" y="6.5" width="5" height="11" rx="1.5" fill="#ef4444" />
      <rect x="6.5" y="9.5" width="11" height="5" rx="1.5" fill="#ef4444" />
      <rect x="10.8" y="7.8" width="2.4" height="8.4" rx="0.8" fill="#ffffff" />
      <rect x="7.8" y="10.8" width="8.4" height="2.4" rx="0.8" fill="#ffffff" />
      <defs>
        <linearGradient id="rescue-bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#ffffff"/><stop offset="100%" stopColor="#f1f5f9"/></linearGradient>
      </defs>
    </svg>
  );
}

export function IconShelter({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ filter: "drop-shadow(0 2px 4px rgba(249,115,22,0.4))" }}>
      <path d="M12 2.5L2 19.5h20L12 2.5z" fill="url(#shelter-tent)" />
      <polygon points="12 2.5 12 19.5 22 19.5" fill="url(#shelter-shade)" />
      <polygon points="12 9 7.5 19.5 12 19.5" fill="#0f172a" opacity="0.85" />
      <circle cx="12" cy="6" r="1.5" fill="#fef08a" />
      <defs>
        <linearGradient id="shelter-tent" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#f97316"/><stop offset="100%" stopColor="#c2410c"/></linearGradient>
        <linearGradient id="shelter-shade" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#ea580c"/><stop offset="100%" stopColor="#9a3412"/></linearGradient>
      </defs>
    </svg>
  );
}

export function IconFamily({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ filter: "drop-shadow(0 2px 4px rgba(139,92,246,0.35))" }}>
      <path d="M12 2.5L3.5 6.5v6c0 5 3.5 9 8.5 10 5-1 8.5-5 8.5-10v-6L12 2.5z" fill="url(#fam-shield)" />
      <circle cx="9" cy="9.5" r="2" fill="#ffffff" />
      <circle cx="15" cy="9.5" r="2" fill="#ffffff" />
      <circle cx="12" cy="14" r="1.5" fill="#fde047" />
      <path d="M6 16.5c0-2 1.8-3 3-3s3 1 3 3" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M12 16.5c0-2 1.8-3 3-3s3 1 3 3" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" />
      <defs>
        <linearGradient id="fam-shield" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#8b5cf6"/><stop offset="100%" stopColor="#4c1d95"/></linearGradient>
      </defs>
    </svg>
  );
}

export function IconEvacuation({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ filter: "drop-shadow(0 2px 4px rgba(34,197,94,0.4))" }}>
      <rect x="2" y="3" width="20" height="18" rx="4" fill="url(#evac-bg)" />
      <path d="M6 12h8m-3-4l4 4-4 4" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="17" y="7" width="2" height="10" rx="1" fill="#fef08a" />
      <defs>
        <linearGradient id="evac-bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#22c55e"/><stop offset="100%" stopColor="#15803d"/></linearGradient>
      </defs>
    </svg>
  );
}

export function IconQrId({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ filter: "drop-shadow(0 2px 4px rgba(168,85,247,0.35))" }}>
      <rect x="2.5" y="2.5" width="19" height="19" rx="3.5" fill="url(#qr-bg)" stroke="#a855f7" strokeWidth="1" />
      <rect x="5" y="5" width="5" height="5" rx="1" fill="#ffffff" />
      <rect x="14" y="5" width="5" height="5" rx="1" fill="#ffffff" />
      <rect x="5" y="14" width="5" height="5" rx="1" fill="#ffffff" />
      <rect x="6.2" y="6.2" width="2.6" height="2.6" fill="#7e22ce" />
      <rect x="15.2" y="6.2" width="2.6" height="2.6" fill="#7e22ce" />
      <rect x="6.2" y="15.2" width="2.6" height="2.6" fill="#7e22ce" />
      <rect x="13" y="13" width="3" height="3" fill="#38bdf8" />
      <rect x="17" y="15" width="2" height="4" fill="#38bdf8" />
      <defs>
        <linearGradient id="qr-bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#3b0764"/><stop offset="100%" stopColor="#1e1b4b"/></linearGradient>
      </defs>
    </svg>
  );
}

export function IconNotifications({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ filter: "drop-shadow(0 2px 5px rgba(234,179,8,0.4))" }}>
      <path d="M12 2a5 5 0 00-5 5v3c0 2-1.5 3.5-2 4.5h14c-.5-1-2-2.5-2-4.5V7a5 5 0 00-5-5z" fill="url(#bell-gold)" />
      <path d="M10 19a2 2 0 004 0" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
      <circle cx="17" cy="6" r="3.2" fill="#ef4444" stroke="#0b1329" strokeWidth="1.5" />
      <defs>
        <linearGradient id="bell-gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#fbbf24"/><stop offset="100%" stopColor="#d97706"/></linearGradient>
      </defs>
    </svg>
  );
}

export function IconAi({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ filter: "drop-shadow(0 2px 6px rgba(6,182,212,0.5))" }}>
      <rect x="3" y="6" width="18" height="14" rx="4" fill="url(#ai-head)" />
      <circle cx="8" cy="12" r="2.2" fill="#22d3ee" />
      <circle cx="16" cy="12" r="2.2" fill="#22d3ee" />
      <circle cx="8" cy="12" r="1" fill="#ffffff" />
      <circle cx="16" cy="12" r="1" fill="#ffffff" />
      <path d="M9 16c1 .8 2 1 3 1s2-.2 3-1" stroke="#38bdf8" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M12 2v4" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="2" r="1.5" fill="#ec4899" />
      <defs>
        <linearGradient id="ai-head" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#4338ca"/><stop offset="100%" stopColor="#1e1b4b"/></linearGradient>
      </defs>
    </svg>
  );
}

export function IconVoice({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ filter: "drop-shadow(0 2px 5px rgba(244,63,94,0.4))" }}>
      <rect x="8" y="2.5" width="8" height="12" rx="4" fill="url(#voice-mic)" />
      <path d="M5 10v1a7 7 0 0014 0v-1" stroke="#ec4899" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 18v3.5m-3 0h6" stroke="#ec4899" strokeWidth="2" strokeLinecap="round" />
      <line x1="10" y1="6" x2="14" y2="6" stroke="#ffffff" opacity="0.6" strokeLinecap="round" />
      <line x1="10" y1="9" x2="14" y2="9" stroke="#ffffff" opacity="0.6" strokeLinecap="round" />
      <defs>
        <linearGradient id="voice-mic" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#f43f5e"/><stop offset="100%" stopColor="#be123c"/></linearGradient>
      </defs>
    </svg>
  );
}

export function IconDamage({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ filter: "drop-shadow(0 2px 4px rgba(245,158,11,0.35))" }}>
      <path d="M3 14c0-4.5 4-8 9-8s9 3.5 9 8H3z" fill="url(#damage-hat)" />
      <rect x="2" y="14" width="20" height="3" rx="1.5" fill="#d97706" />
      <rect x="11" y="2.5" width="2" height="4.5" rx="1" fill="#fef08a" />
      <path d="M8 11h8" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" opacity="0.8" />
      <defs>
        <linearGradient id="damage-hat" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#fbbf24"/><stop offset="100%" stopColor="#ea580c"/></linearGradient>
      </defs>
    </svg>
  );
}

export function IconAnalytics({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ filter: "drop-shadow(0 2px 5px rgba(59,130,246,0.4))" }}>
      <rect x="2" y="14" width="4.5" height="7" rx="1.5" fill="url(#an-1)" />
      <rect x="8" y="10" width="4.5" height="11" rx="1.5" fill="url(#an-2)" />
      <rect x="14" y="5" width="4.5" height="16" rx="1.5" fill="url(#an-3)" />
      <path d="M3 11l6-4 5 3 7-7" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="21" cy="3" r="2" fill="#38bdf8" />
      <defs>
        <linearGradient id="an-1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#38bdf8"/><stop offset="100%" stopColor="#0284c7"/></linearGradient>
        <linearGradient id="an-2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#818cf8"/><stop offset="100%" stopColor="#4f46e5"/></linearGradient>
        <linearGradient id="an-3" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#34d399"/><stop offset="100%" stopColor="#059669"/></linearGradient>
      </defs>
    </svg>
  );
}

export function IconSafety({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ filter: "drop-shadow(0 2px 5px rgba(16,185,129,0.4))" }}>
      <path d="M12 2.5L4 6v6.5c0 5 3.5 9.5 8 10.5 4.5-1 8-5.5 8-10.5V6l-8-3.5z" fill="url(#safe-shield)" />
      <path d="M9 12l2 2 4-4.5" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <defs>
        <linearGradient id="safe-shield" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#10b981"/><stop offset="100%" stopColor="#065f46"/></linearGradient>
      </defs>
    </svg>
  );
}

export function IconStatistics({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ filter: "drop-shadow(0 2px 5px rgba(168,85,247,0.4))" }}>
      <circle cx="12" cy="12" r="9" fill="url(#stat-bg)" />
      <path d="M12 3v9h9" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 12l-6 6" stroke="#c084fc" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="12" r="2.5" fill="#f43f5e" />
      <defs>
        <linearGradient id="stat-bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#8b5cf6"/><stop offset="100%" stopColor="#581c87"/></linearGradient>
      </defs>
    </svg>
  );
}

export function IconReport({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ filter: "drop-shadow(0 2px 6px rgba(239,68,68,0.5))" }}>
      <rect x="3.5" y="3.5" width="17" height="18" rx="3.5" fill="url(#rep-card)" />
      <polygon points="12 7 6.5 17 17.5 17" fill="#f59e0b" />
      <path d="M12 10.5v3" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="12" cy="15.2" r="0.75" fill="#000000" />
      <defs>
        <linearGradient id="rep-card" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#ef4444"/><stop offset="100%" stopColor="#991b1b"/></linearGradient>
      </defs>
    </svg>
  );
}

export function IconAdmin({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ filter: "drop-shadow(0 2px 6px rgba(245,158,11,0.5))" }}>
      <path d="M12 2l2.5 5 5.5-2.5-2 6.5 4 4.5-5.5 1-2.5 5.5-2.5-5.5-5.5-1 4-4.5-2-6.5 5.5 2.5L12 2z" fill="url(#admin-crown)" />
      <circle cx="12" cy="12" r="3.5" fill="#dc2626" />
      <circle cx="12" cy="12" r="1.5" fill="#ffffff" />
      <defs>
        <linearGradient id="admin-crown" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#fbbf24"/><stop offset="100%" stopColor="#b45309"/></linearGradient>
      </defs>
    </svg>
  );
}

export function IconFaq({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ filter: "drop-shadow(0 3px 6px rgba(139,92,246,0.55))" }}>
      {/* Intelligent AI / Knowledge Rounded Badge */}
      <rect x="2.5" y="3.5" width="19" height="17" rx="5.5" fill="url(#faq-bg-grad)" />
      <rect x="3.2" y="4.2" width="17.6" height="15.6" rx="4.8" stroke="#a78bfa" strokeWidth="0.8" opacity="0.6" />
      
      {/* Bold Crisp "FAQ" Typography */}
      <text
        x="12"
        y="14.6"
        textAnchor="middle"
        fill="#ffffff"
        fontWeight="900"
        fontSize="6.8"
        fontFamily="system-ui, -apple-system, sans-serif"
        letterSpacing="0.6"
      >
        FAQ
      </text>

      {/* Sparkling Knowledge Star (Glitter AI Sparkle) */}
      <circle cx="18" cy="5.5" r="1.5" fill="#38bdf8" />
      <circle cx="18" cy="5.5" r="0.7" fill="#ffffff" />
      <circle cx="6" cy="18.5" r="1.2" fill="#fbbf24" />

      <defs>
        <linearGradient id="faq-bg-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#8b5cf6" />
          <stop offset="60%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#4338ca" />
        </linearGradient>
      </defs>
    </svg>
  );
}

