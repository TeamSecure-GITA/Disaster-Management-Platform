import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Menu,
  X,
  User,
  Settings,
  LogOut,
  LogIn,
  UserPlus,
  MapPin,
  WifiOff,
  Globe,
  Bell,
  Radio,
  Zap,
  PhoneCall,
} from "lucide-react";
import { useLanguage } from "../i18n/LanguageContext";
import {
  isUserLoggedIn,
  getCurrentUser,
  logoutSession,
  subscribeToAuthChange,
} from "../services/authService";
import { subscribeToDisasterAlerts } from "../services/socketService";
import { useLowBandwidth } from "../utils/LowBandwidthContext";

export default function HeaderTopBar({ onToggleSidebar, isDesktopMode = false }) {
  const { isLowBandwidth, toggleLowBandwidth } = useLowBandwidth();

  const { langDisplayName, setLangByDisplayName, t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const [loggedIn, setLoggedIn] = useState(isUserLoggedIn());
  const [user, setUser] = useState(getCurrentUser());
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [hotlineOpen, setHotlineOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [notifications, setNotifications] = useState([
    {
      id: "live-imd-1",
      title: "[IMD / NDMA SACHET] Cyclone & High Squall Advisory",
      message: "Severe weather system active. High squally wind conditions along eastern coasts.",
      time: "Just now",
      severity: "high",
      sourceAgency: "IMD / NDMA SACHET",
      sourceUrl: "https://sachet.ndma.gov.in/",
      read: false,
    },
    {
      id: "live-cwc-2",
      title: "[CWC Flood Forecast] River Basin Inundation Warning",
      message: "Heavy precipitation triggering cautionary stages in river catchments.",
      time: "15m ago",
      severity: "medium",
      sourceAgency: "Central Water Commission",
      sourceUrl: "https://ffs.india-water.gov.in/",
      read: false,
    },
    {
      id: "live-ner-3",
      title: "NER Landslide Telemetry: Slope Sensor Saturation",
      message: "Geological sensors detect critical saturation levels along hill highways.",
      time: "45m ago",
      severity: "high",
      sourceAgency: "NER Disaster Telemetry",
      sourceUrl: "https://sachet.ndma.gov.in/",
      read: true,
    },
  ]);

  const menuRef = useRef(null);
  const notifRef = useRef(null);
  const hotlineRef = useRef(null);

  // Unread notification count
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Fetch live notifications and listen to socket events
  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
    async function loadNotifications() {
      try {
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await fetch(`${API_URL}/api/notifications`, { headers });
        if (res.ok) {
          const json = await res.json();
          if (Array.isArray(json.data) && json.data.length > 0) {
            const mapped = json.data.map((n) => ({
              id: n._id || n.id,
              title: n.title,
              message: n.message || "",
              time: "Recent",
              severity: (n.priority || n.severity || "high").toLowerCase(),
              sourceAgency: n.sourceAgency || "Official Advisory",
              sourceUrl: n.sourceUrl || "https://sachet.ndma.gov.in/",
              read: Boolean(n.isRead),
            }));
            setNotifications(mapped);
          }
        }
      } catch (_) {}
    }
    loadNotifications();

    const unsubAlerts = subscribeToDisasterAlerts((newAlert) => {
      if (!newAlert) return;
      const item = {
        id: newAlert._id || Date.now(),
        title: newAlert.title || "Live Disaster Alert",
        message: newAlert.message || "",
        time: "Just now",
        severity: (newAlert.severity || "high").toLowerCase(),
        sourceAgency: newAlert.sourceAgency || "Official Govt Feed",
        sourceUrl: newAlert.sourceUrl || "https://sachet.ndma.gov.in/",
        read: false,
      };
      setNotifications((prev) => [item, ...prev.slice(0, 9)]);
    });

    return () => unsubAlerts();
  }, []);

  // Sync auth state
  useEffect(() => {
    const unsub = subscribeToAuthChange(({ loggedIn: isAuth, user: u }) => {
      setLoggedIn(isAuth);
      setUser(u || getCurrentUser());
    });
    return unsub;
  }, []);

  // Online / offline detector
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

  // Close menus on route change
  useEffect(() => {
    setMenuOpen(false);
    setNotifOpen(false);
    setHotlineOpen(false);
  }, [location.pathname]);

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
      if (hotlineRef.current && !hotlineRef.current.contains(e.target)) {
        setHotlineOpen(false);
      }
    };
    if (menuOpen || notifOpen || hotlineOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [menuOpen, notifOpen, hotlineOpen]);

  const handleLogout = async () => {
    setMenuOpen(false);
    await logoutSession();
    navigate("/login");
  };

  const displayName = user?.name || user?.displayName || (user?.email ? user.email.split("@")[0] : "Responder");
  const avatarUrl = user?.photoUrl || user?.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName)}`;

  return (
    <header
      className="header-container"
      style={{
        display: "flex",
        flexDirection: "column",
        backgroundColor: "rgba(6, 11, 23, 0.88)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(56, 189, 248, 0.16)",
        color: "#f8fafc",
        position: "sticky",
        top: 0,
        zIndex: 50,
        boxShadow: "0 4px 24px rgba(0, 0, 0, 0.45)",
      }}
    >
      {/* ── Main Top Row Controls ────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 20px",
          gap: "12px",
        }}
      >
        {/* ─────────────── LEFT: Drawer Toggle + Status chips ─────────────── */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>

          {/* Mobile Drawer Toggle */}
          {!isDesktopMode && (
            <button
              type="button"
              onClick={onToggleSidebar}
              aria-label="Toggle navigation menu"
              className="mobile-sidebar-toggle-btn"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "38px",
                height: "38px",
                backgroundColor: "rgba(30, 41, 59, 0.85)",
                border: "1px solid rgba(56, 189, 248, 0.3)",
                borderRadius: "10px",
                color: "#38bdf8",
                cursor: "pointer",
                flexShrink: 0,
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
                transition: "all 0.15s ease",
              }}
            >
              <Menu size={20} />
            </button>
          )}

          {/* Live Satellite / Network Status */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              backgroundColor: isOnline ? "rgba(16, 185, 129, 0.12)" : "rgba(244, 63, 94, 0.14)",
              border: `1px solid ${isOnline ? "rgba(16, 185, 129, 0.4)" : "rgba(244, 63, 94, 0.45)"}`,
              padding: "5px 12px",
              borderRadius: "999px",
              fontSize: "0.72rem",
              fontWeight: "800",
              color: isOnline ? "#34d399" : "#fda4af",
              fontFamily: "var(--font-mono, monospace)",
              flexShrink: 0,
              boxShadow: isOnline ? "0 0 12px rgba(16, 185, 129, 0.2)" : "0 0 12px rgba(244, 63, 94, 0.25)",
            }}
            title={isOnline ? "Connected to Disaster Alert Network" : "PWA Offline Mode"}
          >
            {isOnline ? (
              <>
                <span
                  style={{
                    width: "7px",
                    height: "7px",
                    borderRadius: "50%",
                    backgroundColor: "#10b981",
                    boxShadow: "0 0 8px #10b981",
                    flexShrink: 0,
                  }}
                />
                <span className="header-status-chip-text">SAT-NET ACTIVE</span>
                <span className="header-status-chip-mobile" style={{ display: "none" }}>ONLINE</span>
              </>
            ) : (
              <>
                <WifiOff size={13} color="#f43f5e" />
                <span className="header-status-chip-text">OFFLINE LOCAL CACHE</span>
                <span className="header-status-chip-mobile" style={{ display: "none" }}>OFFLINE</span>
              </>
            )}
          </div>

          {/* Quick 1-Tap Emergency SOS Beacon Shortcut */}
          <Link
            to="/emergency-sos"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              background: "linear-gradient(135deg, #e11d48 0%, #be123c 100%)",
              color: "#ffffff",
              padding: "5px 14px",
              borderRadius: "999px",
              fontSize: "0.74rem",
              fontWeight: "800",
              textDecoration: "none",
              border: "1px solid rgba(251, 113, 133, 0.6)",
              boxShadow: "0 0 14px rgba(225, 29, 72, 0.55)",
              flexShrink: 0,
              fontFamily: "var(--font-mono, monospace)",
              letterSpacing: "0.04em",
              transition: "transform 0.15s ease, box-shadow 0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.04)";
              e.currentTarget.style.boxShadow = "0 0 20px rgba(225, 29, 72, 0.85)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = "0 0 14px rgba(225, 29, 72, 0.55)";
            }}
          >
            <span>🚨</span>
            <span>SOS BEACON</span>
          </Link>

          {/* Emergency Helpline Quick-Bar Popover */}
          <div ref={hotlineRef} style={{ position: "relative" }}>
            <button
              type="button"
              onClick={() => setHotlineOpen(!hotlineOpen)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                backgroundColor: hotlineOpen ? "rgba(239, 68, 68, 0.25)" : "rgba(239, 68, 68, 0.12)",
                color: "#fca5a5",
                border: `1px solid ${hotlineOpen ? "#ef4444" : "rgba(239, 68, 68, 0.35)"}`,
                padding: "5px 12px",
                borderRadius: "999px",
                fontSize: "0.74rem",
                fontWeight: "800",
                cursor: "pointer",
                fontFamily: "var(--font-mono, monospace)",
                transition: "all 0.15s ease",
              }}
              title="Click to view all official 24x7 emergency helpline numbers"
            >
              <PhoneCall size={12} color="#ef4444" />
              <span>HOTLINES 112 / 108</span>
            </button>

            {hotlineOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "38px",
                  left: 0,
                  width: "320px",
                  maxWidth: "90vw",
                  backgroundColor: "rgba(10, 16, 32, 0.96)",
                  backdropFilter: "blur(24px)",
                  WebkitBackdropFilter: "blur(24px)",
                  border: "1px solid rgba(239, 68, 68, 0.35)",
                  borderRadius: "14px",
                  padding: "14px",
                  boxShadow: "0 20px 40px rgba(0, 0, 0, 0.85), 0 0 15px rgba(239, 68, 68, 0.2)",
                  zIndex: 1000,
                  animation: "fadeInDown 0.18s ease-out",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px", paddingBottom: "8px", borderBottom: "1px solid rgba(239, 68, 68, 0.2)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ fontSize: "1rem" }}>📞</span>
                    <span style={{ fontSize: "0.82rem", fontWeight: "800", color: "#fca5a5" }}>
                      Emergency Speed Dialers
                    </span>
                  </div>
                  <span style={{ fontSize: "0.62rem", color: "#94a3b8", fontFamily: "var(--font-mono, monospace)" }}>
                    24x7 TOLL FREE
                  </span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                  {[
                    { num: "112", label: "National Emergency", icon: "🚨", color: "#f87171" },
                    { num: "108", label: "Medical Ambulance", icon: "🚑", color: "#f87171" },
                    { num: "101", label: "Fire & Rescue", icon: "🚒", color: "#60a5fa" },
                    { num: "100", label: "Police Control", icon: "👮", color: "#60a5fa" },
                    { num: "1070", label: "Disaster (SDMA)", icon: "🏛️", color: "#facc15" },
                    { num: "1078", label: "NDRF Helpline", icon: "🛡️", color: "#c084fc" },
                    { num: "1091", label: "Women Helpline", icon: "👩", color: "#ec4899" },
                    { num: "1912", label: "Electricity / Wire", icon: "⚡", color: "#38bdf8" },
                  ].map((h) => (
                    <a
                      key={h.num}
                      href={`tel:${h.num}`}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "8px 10px",
                        borderRadius: "8px",
                        backgroundColor: "rgba(30, 41, 59, 0.7)",
                        border: "1px solid rgba(255, 255, 255, 0.08)",
                        textDecoration: "none",
                        color: "#f8fafc",
                        transition: "all 0.15s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.2)";
                        e.currentTarget.style.borderColor = "rgba(239, 68, 68, 0.4)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "rgba(30, 41, 59, 0.7)";
                        e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.08)";
                      }}
                    >
                      <span style={{ fontSize: "1.1rem" }}>{h.icon}</span>
                      <div style={{ lineHeight: "1.2" }}>
                        <div style={{ fontSize: "0.82rem", fontWeight: "800", color: h.color, fontFamily: "var(--font-mono, monospace)" }}>
                          {h.num}
                        </div>
                        <div style={{ fontSize: "0.64rem", color: "#94a3b8" }}>
                          {h.label}
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* GIS Map Link */}
          <Link
            to="/map"
            className="header-map-shortcut"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              color: "#38bdf8",
              fontSize: "0.76rem",
              fontWeight: "700",
              textDecoration: "none",
              backgroundColor: "rgba(56, 189, 248, 0.1)",
              padding: "5px 11px",
              borderRadius: "8px",
              border: "1px solid rgba(56, 189, 248, 0.28)",
              flexShrink: 0,
              transition: "all 0.15s ease",
            }}
          >
            <MapPin size={13} />
            <span>{t.nav_map || "GIS Map"}</span>
          </Link>

          {/* Language Switcher */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              backgroundColor: "rgba(30, 41, 59, 0.7)",
              padding: "4px 9px",
              borderRadius: "8px",
              border: "1px solid rgba(56, 189, 248, 0.2)",
              flexShrink: 0,
            }}
          >
            <Globe size={13} color="#38bdf8" />
            <select
              value={langDisplayName}
              onChange={(e) => setLangByDisplayName(e.target.value)}
              className="header-lang-select"
              style={{
                backgroundColor: "transparent",
                color: "#f8fafc",
                border: "none",
                fontSize: "0.75rem",
                fontWeight: "700",
                outline: "none",
                cursor: "pointer",
              }}
            >
              <option value="English" style={{ background: "#0f172a" }}>English</option>
              <option value="Hindi" style={{ background: "#0f172a" }}>Hindi (हिन्दी)</option>
              <option value="Odia" style={{ background: "#0f172a" }}>Odia (ଓଡ଼ିଆ)</option>
              <option value="Bengali" style={{ background: "#0f172a" }}>Bengali (বাংলা)</option>
              <option value="Assamese" style={{ background: "#0f172a" }}>Assamese (অসমীয়া)</option>
              <option value="Manipuri" style={{ background: "#0f172a" }}>Manipuri (মৈতৈলোন্)</option>
              <option value="Mizo" style={{ background: "#0f172a" }}>Mizo (Mizo ṭawng)</option>
              <option value="Bodo" style={{ background: "#0f172a" }}>Bodo (बड़ो)</option>
              <option value="Khasi" style={{ background: "#0f172a" }}>Khasi</option>
              <option value="Nagamese" style={{ background: "#0f172a" }}>Nagamese</option>
              <option value="Nepali" style={{ background: "#0f172a" }}>Nepali (नेपाली)</option>
              <option value="Spanish" style={{ background: "#0f172a" }}>Spanish (Español)</option>
              <option value="Garo" style={{ background: "#0f172a" }}>Garo (Achik)</option>
              <option value="Santali" style={{ background: "#0f172a" }}>Santali (ᱥᱟᱱᱛᱟᱲᱤ)</option>
            </select>
          </div>

          {/* ⚡ 2G Ultra-Low Bandwidth Mode */}
          <button
            onClick={() => {
              if (!isLowBandwidth) {
                toggleLowBandwidth();
                navigate("/low-bandwidth");
              } else {
                toggleLowBandwidth();
                navigate("/");
              }
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "5px",
              backgroundColor: isLowBandwidth ? "#f59e0b" : "rgba(245, 158, 11, 0.12)",
              border: `1px solid ${isLowBandwidth ? "#d97706" : "rgba(245, 158, 11, 0.35)"}`,
              color: isLowBandwidth ? "#000000" : "#fbbf24",
              padding: "4px 10px",
              borderRadius: "8px",
              fontSize: "0.72rem",
              fontWeight: "800",
              fontFamily: "var(--font-mono, monospace)",
              cursor: "pointer",
              flexShrink: 0,
              transition: "all 0.15s ease",
            }}
            title="Ultra-Low Bandwidth Mode: Strips heavy assets for 2G network resilience"
          >
            <Zap size={12} />
            <span>{isLowBandwidth ? "2G ACTIVE" : "2G RESILIENCE"}</span>
          </button>
        </div>

        {/* ─────────────── RIGHT: Notifications & User Profile ─────────────── */}
        <div
          ref={menuRef}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            position: "relative",
          }}
        >
          {/* User Profile Pill */}
          {loggedIn && (
            <Link
              to="/profile"
              title={`View Profile (${displayName})`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                textDecoration: "none",
                backgroundColor: "rgba(15, 23, 42, 0.8)",
                border: "1px solid rgba(56, 189, 248, 0.35)",
                padding: "3px 12px 3px 4px",
                borderRadius: "999px",
                transition: "all 0.2s",
                cursor: "pointer",
                boxShadow: "0 2px 10px rgba(0, 0, 0, 0.4)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#38bdf8";
                e.currentTarget.style.boxShadow = "0 0 12px rgba(56, 189, 248, 0.35)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(56, 189, 248, 0.35)";
                e.currentTarget.style.boxShadow = "0 2px 10px rgba(0, 0, 0, 0.4)";
              }}
            >
              <div style={{ position: "relative", width: "32px", height: "32px" }}>
                <img
                  src={avatarUrl}
                  alt={displayName}
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    backgroundColor: "#0f172a",
                    border: "1.5px solid #38bdf8",
                  }}
                  onError={(e) => {
                    e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName)}`;
                  }}
                />
                <span
                  style={{
                    position: "absolute",
                    bottom: "-1px",
                    right: "-1px",
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    backgroundColor: "#10b981",
                    border: "1.5px solid #0f172a",
                    boxShadow: "0 0 6px #10b981",
                  }}
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", textAlign: "left", lineHeight: "1.2" }}>
                <span style={{ fontSize: "0.8rem", fontWeight: "700", color: "#f8fafc" }}>
                  {displayName.length > 14 ? `${displayName.substring(0, 14)}...` : displayName}
                </span>
                <span style={{ fontSize: "0.64rem", color: "#94a3b8", fontFamily: "var(--font-mono, monospace)" }}>
                  {user?.role === "admin" ? "OFFICER · ADMIN" : "FIELD RESPONDER"}
                </span>
              </div>
            </Link>
          )}

          {/* Live Notification Bell */}
          <div ref={notifRef} style={{ position: "relative" }}>
            <button
              id="top-notification-bell-btn"
              type="button"
              onClick={() => setNotifOpen(!notifOpen)}
              title="Live Disaster Notifications"
              aria-label="Live Disaster Notifications"
              aria-expanded={notifOpen}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "40px",
                height: "40px",
                backgroundColor: notifOpen ? "rgba(56, 189, 248, 0.2)" : "rgba(30, 41, 59, 0.8)",
                border: `1.5px solid ${notifOpen ? "#38bdf8" : "rgba(56, 189, 248, 0.25)"}`,
                borderRadius: "10px",
                color: notifOpen ? "#38bdf8" : "#f1f5f9",
                cursor: "pointer",
                position: "relative",
                transition: "all 0.2s ease",
                boxShadow: notifOpen ? "0 0 16px rgba(56, 189, 248, 0.4)" : "none",
              }}
            >
              <Bell size={19} />
              {unreadCount > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: "-4px",
                    right: "-4px",
                    backgroundColor: "#f43f5e",
                    color: "#ffffff",
                    fontSize: "0.65rem",
                    fontWeight: "800",
                    minWidth: "18px",
                    height: "18px",
                    borderRadius: "999px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "0 4px",
                    border: "2px solid #060b17",
                    boxShadow: "0 0 10px rgba(244, 63, 94, 0.8)",
                  }}
                >
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Popover Dropdown */}
            {notifOpen && (
              <div
                id="top-notifications-dropdown"
                style={{
                  position: "absolute",
                  top: "48px",
                  right: 0,
                  width: "390px",
                  maxWidth: "92vw",
                  backgroundColor: "rgba(10, 16, 32, 0.95)",
                  backdropFilter: "blur(24px)",
                  WebkitBackdropFilter: "blur(24px)",
                  border: "1px solid rgba(56, 189, 248, 0.3)",
                  borderRadius: "16px",
                  boxShadow: "0 24px 50px rgba(0, 0, 0, 0.85), 0 0 0 1px rgba(255, 255, 255, 0.05)",
                  padding: "16px",
                  zIndex: 1000,
                  animation: "fadeInDown 0.18s ease-out",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: "12px", borderBottom: "1px solid rgba(56, 189, 248, 0.15)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Radio size={18} color="#38bdf8" />
                    <span style={{ fontWeight: "800", fontSize: "0.95rem", color: "#f8fafc" }}>
                      Crisis Broadcasts
                    </span>
                    <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#10b981", boxShadow: "0 0 8px #10b981" }} />
                  </div>
                  <span style={{ fontSize: "0.7rem", color: "#38bdf8", fontWeight: "700", backgroundColor: "rgba(56, 189, 248, 0.15)", padding: "3px 8px", borderRadius: "12px", fontFamily: "var(--font-mono, monospace)" }}>
                    {notifications.length} ACTIVE FEEDS
                  </span>
                </div>

                <div style={{ maxHeight: "320px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "10px", marginTop: "12px" }}>
                  {notifications.slice(0, 5).map((n) => (
                    <div
                      key={n.id}
                      style={{
                        padding: "10px 12px",
                        borderRadius: "10px",
                        backgroundColor: "rgba(30, 41, 59, 0.6)",
                        borderLeft: `3px solid ${n.severity === "critical" ? "#f43f5e" : n.severity === "high" ? "#f97316" : "#38bdf8"}`,
                        border: "1px solid rgba(255, 255, 255, 0.05)",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
                        <span style={{ fontSize: "0.66rem", fontWeight: "800", color: "#38bdf8", textTransform: "uppercase", fontFamily: "var(--font-mono, monospace)" }}>
                          🏛️ {n.sourceAgency || "Disaster Alert"}
                        </span>
                        <span style={{ fontSize: "0.66rem", color: "#94a3b8" }}>{n.time}</span>
                      </div>
                      <div style={{ fontSize: "0.82rem", fontWeight: "700", color: "#f1f5f9", lineHeight: "1.3", marginBottom: "4px" }}>
                        {n.title}
                      </div>
                      <div style={{ fontSize: "0.74rem", color: "#cbd5e1", lineHeight: "1.35", marginBottom: "6px" }}>
                        {n.message}
                      </div>
                      {n.sourceUrl && (
                        <a
                          href={n.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                            fontSize: "0.7rem",
                            color: "#60a5fa",
                            textDecoration: "none",
                            fontWeight: "700",
                          }}
                        >
                          <span>Official Portal Advisory</span>
                          <span>↗</span>
                        </a>
                      )}
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: "12px", paddingTop: "10px", borderTop: "1px solid rgba(56, 189, 248, 0.15)" }}>
                  <Link
                    to="/notifications"
                    onClick={() => setNotifOpen(false)}
                    style={{
                      display: "block",
                      textAlign: "center",
                      backgroundColor: "#0284c7",
                      color: "#ffffff",
                      fontSize: "0.78rem",
                      fontWeight: "700",
                      padding: "8px 14px",
                      borderRadius: "10px",
                      textDecoration: "none",
                      boxShadow: "0 2px 10px rgba(2, 132, 199, 0.4)",
                      transition: "background-color 0.15s",
                    }}
                  >
                    View All Crisis Feeds &amp; Alerts →
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Hamburger Menu Button */}
          <button
            id="top-hamburger-btn"
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle navigation menu"
            aria-expanded={menuOpen}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "40px",
              height: "40px",
              backgroundColor: menuOpen ? "#0284c7" : "rgba(30, 41, 59, 0.8)",
              border: `1.5px solid ${menuOpen ? "#38bdf8" : "rgba(56, 189, 248, 0.25)"}`,
              borderRadius: "10px",
              color: "#ffffff",
              cursor: "pointer",
              transition: "all 0.2s ease",
              boxShadow: menuOpen ? "0 0 16px rgba(56, 189, 248, 0.5)" : "none",
            }}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* Hamburger Menu Popover */}
          {menuOpen && (
            <div
              id="hamburger-dropdown-menu"
              style={{
                position: "absolute",
                top: "48px",
                right: 0,
                width: "300px",
                maxWidth: "calc(100vw - 24px)",
                backgroundColor: "rgba(10, 16, 32, 0.95)",
                backdropFilter: "blur(24px)",
                WebkitBackdropFilter: "blur(24px)",
                border: "1px solid rgba(56, 189, 248, 0.3)",
                borderRadius: "16px",
                boxShadow: "0 24px 50px rgba(0, 0, 0, 0.85), 0 0 0 1px rgba(255, 255, 255, 0.05)",
                padding: "16px",
                zIndex: 100,
                animation: "fadeInDown 0.18s ease-out",
              }}
            >
              {loggedIn ? (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    paddingBottom: "14px",
                    borderBottom: "1px solid rgba(56, 189, 248, 0.15)",
                    marginBottom: "12px",
                  }}
                >
                  <img
                    src={avatarUrl}
                    alt={displayName}
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: "2px solid #38bdf8",
                    }}
                    onError={(e) => {
                      e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName)}`;
                    }}
                  />
                  <div style={{ flex: 1, overflow: "hidden" }}>
                    <div style={{ fontWeight: "800", fontSize: "0.95rem", color: "#f8fafc", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                      {displayName}
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "#94a3b8", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                      {user?.email || "Authenticated Responder"}
                    </div>
                    <div style={{ display: "inline-block", marginTop: "4px", backgroundColor: "rgba(14, 165, 233, 0.18)", color: "#38bdf8", fontSize: "0.64rem", fontWeight: "800", padding: "2px 8px", borderRadius: "999px", fontFamily: "var(--font-mono, monospace)" }}>
                      {user?.role === "admin" ? "🛡️ OFFICER ADMIN" : "🚨 VERIFIED RESPONDER"}
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    padding: "12px",
                    backgroundColor: "rgba(30, 41, 59, 0.5)",
                    borderRadius: "10px",
                    marginBottom: "14px",
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontSize: "0.88rem", fontWeight: "700", color: "#f8fafc" }}>
                    Guest / Field Citizen
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "#94a3b8", marginTop: "2px" }}>
                    Authenticate to access tactical tools &amp; family telemetry
                  </div>
                </div>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <Link
                  to="/profile"
                  onClick={() => setMenuOpen(false)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "10px 12px",
                    borderRadius: "10px",
                    color: "#f8fafc",
                    textDecoration: "none",
                    fontSize: "0.85rem",
                    fontWeight: "600",
                    backgroundColor: location.pathname === "/profile" ? "rgba(14, 165, 233, 0.25)" : "transparent",
                    transition: "background 0.15s",
                  }}
                >
                  <User size={18} color="#38bdf8" />
                  <span>My Profile &amp; Clearance</span>
                </Link>

                <Link
                  to="/settings"
                  onClick={() => setMenuOpen(false)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "10px 12px",
                    borderRadius: "10px",
                    color: "#f8fafc",
                    textDecoration: "none",
                    fontSize: "0.85rem",
                    fontWeight: "600",
                    backgroundColor: location.pathname === "/settings" ? "rgba(14, 165, 233, 0.25)" : "transparent",
                    transition: "background 0.15s",
                  }}
                >
                  <Settings size={18} color="#f59e0b" />
                  <span>Settings &amp; Radios</span>
                </Link>

                <Link
                  to="/map"
                  onClick={() => setMenuOpen(false)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "10px 12px",
                    borderRadius: "10px",
                    color: "#f8fafc",
                    textDecoration: "none",
                    fontSize: "0.85rem",
                    fontWeight: "600",
                    backgroundColor: location.pathname === "/map" ? "rgba(14, 165, 233, 0.25)" : "transparent",
                    transition: "background 0.15s",
                  }}
                >
                  <MapPin size={18} color="#10b981" />
                  <span>Disaster GIS Map</span>
                </Link>

                <div style={{ height: "1px", backgroundColor: "rgba(56, 189, 248, 0.15)", margin: "6px 0" }} />

                {loggedIn ? (
                  <button
                    id="top-menu-logout-btn"
                    type="button"
                    onClick={handleLogout}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "10px 12px",
                      borderRadius: "10px",
                      color: "#fb7185",
                      backgroundColor: "rgba(244, 63, 94, 0.12)",
                      border: "1px solid rgba(244, 63, 94, 0.25)",
                      fontSize: "0.85rem",
                      fontWeight: "700",
                      cursor: "pointer",
                      textAlign: "left",
                      width: "100%",
                      transition: "all 0.15s",
                    }}
                  >
                    <LogOut size={18} color="#f43f5e" />
                    <span>Terminate Session / Logout</span>
                  </button>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <Link
                      to="/login"
                      onClick={() => setMenuOpen(false)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        padding: "10px 12px",
                        borderRadius: "10px",
                        color: "#60a5fa",
                        backgroundColor: "rgba(37, 99, 235, 0.15)",
                        border: "1px solid rgba(37, 99, 235, 0.35)",
                        fontSize: "0.85rem",
                        fontWeight: "700",
                        textDecoration: "none",
                      }}
                    >
                      <LogIn size={18} color="#3b82f6" />
                      <span>Sign In</span>
                    </Link>

                    <Link
                      to="/register"
                      onClick={() => setMenuOpen(false)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        padding: "10px 12px",
                        borderRadius: "10px",
                        color: "#34d399",
                        backgroundColor: "rgba(16, 185, 129, 0.12)",
                        border: "1px solid rgba(16, 185, 129, 0.35)",
                        fontSize: "0.85rem",
                        fontWeight: "700",
                        textDecoration: "none",
                      }}
                    >
                      <UserPlus size={18} color="#10b981" />
                      <span>Create Account</span>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Animated Rolling Live Emergency Telemetry Ticker ─────────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          backgroundColor: "rgba(3, 7, 18, 0.95)",
          borderTop: "1px solid rgba(56, 189, 248, 0.12)",
          padding: "4px 16px",
          overflow: "hidden",
          fontSize: "0.72rem",
          fontFamily: "var(--font-mono, monospace)",
          color: "#94a3b8",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            color: "#f43f5e",
            fontWeight: "800",
            flexShrink: 0,
            paddingRight: "12px",
            borderRight: "1px solid rgba(56, 189, 248, 0.15)",
          }}
        >
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#f43f5e", boxShadow: "0 0 6px #f43f5e" }} />
          <span>LIVE RADAR</span>
        </div>

        <div style={{ flex: 1, overflow: "hidden", whiteSpace: "nowrap", position: "relative", marginLeft: "12px" }}>
          <div
            className="header-ticker-track"
            style={{
              display: "inline-block",
              animation: "live-ticker-scroll 32s linear infinite",
              whiteSpace: "nowrap",
            }}
          >
            <span style={{ color: "#fb7185", fontWeight: "700" }}>[IMD / NDMA] Cyclone &amp; Squall Advisory Active</span>
            <span style={{ margin: "0 12px", color: "rgba(255,255,255,0.2)" }}>•</span>
            <span style={{ color: "#38bdf8" }}>[NER LANDSLIDE] Slope Saturation Index: 64% (Normal)</span>
            <span style={{ margin: "0 12px", color: "rgba(255,255,255,0.2)" }}>•</span>
            <span style={{ color: "#34d399" }}>[CWC BASIN] Catchment discharge stages within cautionary envelope</span>
            <span style={{ margin: "0 12px", color: "rgba(255,255,255,0.2)" }}>•</span>
            <span style={{ color: "#fbbf24" }}>[LORA MESH] 84 nodes active in Zero-Grid standby</span>
            <span style={{ margin: "0 12px", color: "rgba(255,255,255,0.2)" }}>•</span>
            <span style={{ color: "#c084fc" }}>[COSMIC MUON] Ground thickness density sensors calibrated</span>
          </div>
        </div>
      </div>
    </header>
  );
}
