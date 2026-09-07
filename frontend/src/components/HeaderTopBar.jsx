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
} from "lucide-react";
import { useLanguage } from "../i18n/LanguageContext";
import {
  isUserLoggedIn,
  getCurrentUser,
  logoutSession,
  subscribeToAuthChange,
} from "../services/authService";
import { subscribeToDisasterAlerts } from "../services/socketService";

export default function HeaderTopBar({ onToggleSidebar }) {
  const { langDisplayName, setLangByDisplayName, t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const [loggedIn, setLoggedIn] = useState(isUserLoggedIn());
  const [user, setUser] = useState(getCurrentUser());
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
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
    };
    if (menuOpen || notifOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [menuOpen, notifOpen]);

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
        alignItems: "center",
        justifyContent: "space-between",
        padding: "10px 24px",
        backgroundColor: "#0b1329",
        borderBottom: "1px solid #1e293b",
        color: "#f8fafc",
        position: "sticky",
        top: 0,
        zIndex: 50,
        backdropFilter: "blur(12px)",
      }}
    >
      {/* ─────────────── LEFT: Drawer Toggle + Status chips ─────────────── */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>

        {/* ── MOBILE SIDEBAR DRAWER TOGGLE ── */}
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label="Toggle navigation menu"
          className="mobile-sidebar-toggle-btn"
          style={{
            display: "none",
            alignItems: "center",
            justifyContent: "center",
            width: "36px",
            height: "36px",
            backgroundColor: "#1e293b",
            border: "1px solid #334155",
            borderRadius: "8px",
            color: "#38bdf8",
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          <Menu size={20} />
        </button>

        {/* ── LIVE STATUS CHIP ── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            backgroundColor: isOnline ? "rgba(16, 185, 129, 0.12)" : "rgba(239, 68, 68, 0.15)",
            border: `1px solid ${isOnline ? "rgba(16, 185, 129, 0.4)" : "rgba(239, 68, 68, 0.4)"}`,
            padding: "4px 10px",
            borderRadius: "20px",
            fontSize: "0.75rem",
            fontWeight: "700",
            color: isOnline ? "#34d399" : "#fca5a5",
            flexShrink: 0,
          }}
          title={isOnline ? "Connected to Disaster Alert Network" : "PWA Offline Mode"}
        >
          {isOnline ? (
            <>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#10b981", boxShadow: "0 0 8px #10b981", flexShrink: 0 }} />
              <span className="header-status-chip-text">LIVE SATELLITE NETWORK</span>
              <span className="header-status-chip-mobile" style={{ display: "none" }}>LIVE</span>
            </>
          ) : (
            <>
              <WifiOff size={12} color="#ef4444" />
              <span className="header-status-chip-text">OFFLINE PWA MODE</span>
              <span className="header-status-chip-mobile" style={{ display: "none" }}>OFFLINE</span>
            </>
          )}
        </div>

        {/* ── MAP SHORTCUT (Hidden on small mobile) ── */}
        <Link
          to="/map"
          className="header-map-shortcut"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            color: "#38bdf8",
            fontSize: "0.8rem",
            fontWeight: "600",
            textDecoration: "none",
            backgroundColor: "rgba(56, 189, 248, 0.1)",
            padding: "4px 10px",
            borderRadius: "6px",
            border: "1px solid rgba(56, 189, 248, 0.25)",
            flexShrink: 0,
          }}
        >
          <span>🗺️</span>
          <span style={{ display: "inline-block" }}>{t.nav_map || "Disaster Response Map"}</span>
        </Link>

        {/* ── QUICK LANGUAGE SWITCHER ── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            backgroundColor: "#1e293b",
            padding: "4px 8px",
            borderRadius: "6px",
            border: "1px solid #334155",
            flexShrink: 0,
          }}
        >
          <Globe size={14} color="#38bdf8" />
          <select
            value={langDisplayName}
            onChange={(e) => setLangByDisplayName(e.target.value)}
            className="header-lang-select"
            style={{
              backgroundColor: "transparent",
              color: "#f8fafc",
              border: "none",
              fontSize: "0.78rem",
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
      </div>

      {/* Right Top Controls: Profile Icon (if logged in) and Hamburger Menu */}
      <div
        ref={menuRef}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          position: "relative",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {/* ── PROFILE ICON (Shown only after login, positioned above/beside hamburger menu) ── */}
          {loggedIn && (
            <Link
              to="/profile"
              title={`View Profile (${displayName})`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                textDecoration: "none",
                backgroundColor: "rgba(30, 41, 59, 0.8)",
                border: "1.5px solid rgba(56, 189, 248, 0.4)",
                padding: "3px 10px 3px 4px",
                borderRadius: "30px",
                transition: "all 0.2s",
                cursor: "pointer",
                boxShadow: "0 2px 10px rgba(0, 0, 0, 0.3)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#38bdf8";
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(56, 189, 248, 0.4)";
                e.currentTarget.style.transform = "translateY(0)";
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
                    backgroundColor: "#1e293b",
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
                    width: "9px",
                    height: "9px",
                    borderRadius: "50%",
                    backgroundColor: "#10b981",
                    border: "1.5px solid #0f172a",
                  }}
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", textAlign: "left", lineHeight: "1.2" }}>
                <span style={{ fontSize: "0.82rem", fontWeight: "700", color: "#f1f5f9" }}>
                  {displayName.length > 14 ? `${displayName.substring(0, 14)}...` : displayName}
                </span>
                <span style={{ fontSize: "0.68rem", color: "#94a3b8" }}>
                  {user?.role === "admin" ? "Administrator" : "Responder"}
                </span>
              </div>
            </Link>
          )}

          {/* ── LIVE NOTIFICATION BELL BUTTON & DROPDOWN ── */}
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
                backgroundColor: notifOpen ? "rgba(56, 189, 248, 0.2)" : "#1e293b",
                border: `1.5px solid ${notifOpen ? "#38bdf8" : "#334155"}`,
                borderRadius: "10px",
                color: notifOpen ? "#38bdf8" : "#f1f5f9",
                cursor: "pointer",
                position: "relative",
                transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                boxShadow: notifOpen ? "0 0 15px rgba(56, 189, 248, 0.4)" : "none",
              }}
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: "-4px",
                    right: "-4px",
                    backgroundColor: "#ef4444",
                    color: "#ffffff",
                    fontSize: "0.68rem",
                    fontWeight: "800",
                    minWidth: "18px",
                    height: "18px",
                    borderRadius: "9px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "0 4px",
                    border: "2px solid #0b1329",
                    boxShadow: "0 0 8px rgba(239, 68, 68, 0.8)",
                  }}
                >
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Live Notifications Dropdown Popover */}
            {notifOpen && (
              <div
                id="top-notifications-dropdown"
                style={{
                  position: "absolute",
                  top: "48px",
                  right: 0,
                  width: "380px",
                  maxWidth: "92vw",
                  backgroundColor: "#0f172a",
                  border: "1px solid #334155",
                  borderRadius: "14px",
                  boxShadow: "0 20px 45px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.08)",
                  padding: "16px",
                  zIndex: 1000,
                  animation: "fadeInDown 0.18s ease-out",
                }}
              >
                {/* Header */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: "12px", borderBottom: "1px solid #1e293b" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "1.2rem" }}>🚨</span>
                    <span style={{ fontWeight: "800", fontSize: "0.95rem", color: "#f8fafc" }}>
                      Live Notifications
                    </span>
                    <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#10b981", boxShadow: "0 0 8px #10b981" }} />
                  </div>
                  <span style={{ fontSize: "0.72rem", color: "#38bdf8", fontWeight: "700", backgroundColor: "rgba(56, 189, 248, 0.15)", padding: "3px 8px", borderRadius: "12px" }}>
                    {notifications.length} Active
                  </span>
                </div>

                {/* Notifications List */}
                <div style={{ maxHeight: "320px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "10px", marginTop: "12px" }}>
                  {notifications.slice(0, 5).map((n) => (
                    <div
                      key={n.id}
                      style={{
                        padding: "10px 12px",
                        borderRadius: "8px",
                        backgroundColor: "#1e293b",
                        borderLeft: `3px solid ${n.severity === "critical" ? "#ef4444" : n.severity === "high" ? "#f97316" : "#38bdf8"}`,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
                        <span style={{ fontSize: "0.68rem", fontWeight: "800", color: "#38bdf8", textTransform: "uppercase" }}>
                          🏛️ {n.sourceAgency || "Disaster Alert"}
                        </span>
                        <span style={{ fontSize: "0.68rem", color: "#94a3b8" }}>{n.time}</span>
                      </div>
                      <div style={{ fontSize: "0.82rem", fontWeight: "700", color: "#f1f5f9", lineHeight: "1.3", marginBottom: "4px" }}>
                        {n.title}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "#cbd5e1", lineHeight: "1.35", marginBottom: "6px" }}>
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
                            fontSize: "0.72rem",
                            color: "#60a5fa",
                            textDecoration: "none",
                            fontWeight: "700",
                          }}
                        >
                          <span>Official Advisory</span>
                          <span>↗</span>
                        </a>
                      )}
                    </div>
                  ))}
                </div>

                {/* Footer Link to All Notifications */}
                <div style={{ marginTop: "12px", paddingTop: "10px", borderTop: "1px solid #1e293b" }}>
                  <Link
                    to="/notifications"
                    onClick={() => setNotifOpen(false)}
                    style={{
                      display: "block",
                      textAlign: "center",
                      backgroundColor: "#2563eb",
                      color: "#ffffff",
                      fontSize: "0.8rem",
                      fontWeight: "700",
                      padding: "8px 14px",
                      borderRadius: "8px",
                      textDecoration: "none",
                      transition: "background-color 0.15s",
                    }}
                  >
                    View All Notifications &amp; Official Broadcasts →
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* ── HAMBURGER MENU BUTTON ── */}
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
              backgroundColor: menuOpen ? "#2563eb" : "#1e293b",
              border: `1.5px solid ${menuOpen ? "#60a5fa" : "#334155"}`,
              borderRadius: "10px",
              color: "#ffffff",
              cursor: "pointer",
              transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
              boxShadow: menuOpen ? "0 0 15px rgba(37, 99, 235, 0.5)" : "none",
            }}
            onMouseEnter={(e) => {
              if (!menuOpen) e.currentTarget.style.borderColor = "#60a5fa";
            }}
            onMouseLeave={(e) => {
              if (!menuOpen) e.currentTarget.style.borderColor = "#334155";
            }}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* ── HAMBURGER DROPDOWN MENU ── */}
        {menuOpen && (
          <div
            id="hamburger-dropdown-menu"
            style={{
              position: "absolute",
              top: "48px",
              right: 0,
              width: "300px",
              maxWidth: "calc(100vw - 24px)",
              backgroundColor: "#0f172a",
              border: "1px solid #334155",
              borderRadius: "14px",
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.05)",
              padding: "16px",
              zIndex: 100,
              animation: "fadeInDown 0.18s ease-out",
            }}
          >
            {/* Header: User Profile Card */}
            {loggedIn ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  paddingBottom: "14px",
                  borderBottom: "1px solid #1e293b",
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
                  <div style={{ fontWeight: "700", fontSize: "0.95rem", color: "#f8fafc", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                    {displayName}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#94a3b8", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                    {user?.email || "Authenticated Responder"}
                  </div>
                  <div style={{ display: "inline-block", marginTop: "4px", backgroundColor: "#1e3a8a", color: "#93c5fd", fontSize: "0.68rem", fontWeight: "700", padding: "2px 8px", borderRadius: "10px" }}>
                    {user?.role === "admin" ? "🛡️ Administrator" : "🚨 Verified Responder"}
                  </div>
                </div>
              </div>
            ) : (
              <div
                style={{
                  padding: "12px",
                  backgroundColor: "#1e293b",
                  borderRadius: "10px",
                  marginBottom: "14px",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: "0.88rem", fontWeight: "700", color: "#f8fafc" }}>
                  Guest / Field Responder
                </div>
                <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: "2px" }}>
                  Sign in to access personalized SOS data & response tools
                </div>
              </div>
            )}

            {/* Menu Items */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {/* My Profile Link (Always shown in hamburger) */}
              <Link
                to="/profile"
                onClick={() => setMenuOpen(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  color: "#f8fafc",
                  textDecoration: "none",
                  fontSize: "0.88rem",
                  fontWeight: "600",
                  backgroundColor: location.pathname === "/profile" ? "#2563eb" : "transparent",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) => {
                  if (location.pathname !== "/profile") e.currentTarget.style.backgroundColor = "#1e293b";
                }}
                onMouseLeave={(e) => {
                  if (location.pathname !== "/profile") e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                <User size={18} color="#38bdf8" />
                <span>My Profile</span>
              </Link>

              {/* Settings Link (Always shown in hamburger) */}
              <Link
                to="/settings"
                onClick={() => setMenuOpen(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  color: "#f8fafc",
                  textDecoration: "none",
                  fontSize: "0.88rem",
                  fontWeight: "600",
                  backgroundColor: location.pathname === "/settings" ? "#2563eb" : "transparent",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) => {
                  if (location.pathname !== "/settings") e.currentTarget.style.backgroundColor = "#1e293b";
                }}
                onMouseLeave={(e) => {
                  if (location.pathname !== "/settings") e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                <Settings size={18} color="#f59e0b" />
                <span>Settings</span>
              </Link>

              {/* Disaster Response Map Shortcut */}
              <Link
                to="/map"
                onClick={() => setMenuOpen(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  color: "#f8fafc",
                  textDecoration: "none",
                  fontSize: "0.88rem",
                  fontWeight: "600",
                  backgroundColor: location.pathname === "/map" ? "#2563eb" : "transparent",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) => {
                  if (location.pathname !== "/map") e.currentTarget.style.backgroundColor = "#1e293b";
                }}
                onMouseLeave={(e) => {
                  if (location.pathname !== "/map") e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                <MapPin size={18} color="#10b981" />
                <span>Disaster Response Map</span>
              </Link>

              <div style={{ height: "1px", backgroundColor: "#1e293b", margin: "6px 0" }} />

              {/* Auth Options: Conditional logic */}
              {loggedIn ? (
                /* When LOGGED IN: Show Logout. Login & Register are NOT shown! */
                <button
                  id="top-menu-logout-btn"
                  type="button"
                  onClick={handleLogout}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    color: "#f87171",
                    backgroundColor: "rgba(239, 68, 68, 0.1)",
                    border: "1px solid rgba(239, 68, 68, 0.2)",
                    fontSize: "0.88rem",
                    fontWeight: "700",
                    cursor: "pointer",
                    textAlign: "left",
                    width: "100%",
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.2)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.1)";
                  }}
                >
                  <LogOut size={18} color="#ef4444" />
                  <span>Logout</span>
                </button>
              ) : (
                /* When LOGGED OUT: Show Login and Register. Logout is NOT shown! */
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <Link
                    to="/login"
                    onClick={() => setMenuOpen(false)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "10px 12px",
                      borderRadius: "8px",
                      color: "#60a5fa",
                      backgroundColor: "rgba(37, 99, 235, 0.1)",
                      border: "1px solid rgba(37, 99, 235, 0.3)",
                      fontSize: "0.88rem",
                      fontWeight: "700",
                      textDecoration: "none",
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "rgba(37, 99, 235, 0.2)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "rgba(37, 99, 235, 0.1)";
                    }}
                  >
                    <LogIn size={18} color="#3b82f6" />
                    <span>Log In</span>
                  </Link>

                  <Link
                    to="/register"
                    onClick={() => setMenuOpen(false)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "10px 12px",
                      borderRadius: "8px",
                      color: "#34d399",
                      backgroundColor: "rgba(16, 185, 129, 0.1)",
                      border: "1px solid rgba(16, 185, 129, 0.3)",
                      fontSize: "0.88rem",
                      fontWeight: "700",
                      textDecoration: "none",
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "rgba(16, 185, 129, 0.2)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "rgba(16, 185, 129, 0.1)";
                    }}
                  >
                    <UserPlus size={18} color="#10b981" />
                    <span>Register</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
