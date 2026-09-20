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
import { isAuthorizedAdmin } from "../utils/adminAuth";
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

  // ── Live Clock & Date State ───────────────────────────────────────────────
  const [clock, setClock] = useState(() => {
    const d = new Date();
    return {
      time: d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false }),
      date: d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).replace(/ /g, "-"),
    };
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const d = new Date();
      setClock({
        time: d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false }),
        date: d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).replace(/ /g, "-"),
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header
      className="header-container"
      style={{
        display: "flex",
        flexDirection: "column",
        backgroundColor: "rgba(6, 11, 23, 0.95)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(56, 189, 248, 0.16)",
        color: "#f8fafc",
        position: "sticky",
        top: 0,
        zIndex: 50,
        boxShadow: "0 4px 24px rgba(0, 0, 0, 0.5)",
      }}
    >
      {/* ── Main Top Row Controls Matching Photo ─────────────────────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "8px 18px",
          gap: "12px",
          flexWrap: "nowrap",
        }}
      >
        {/* ─────────────── LEFT: Logo & Platform Identity ─────────────── */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
          {/* Mobile Drawer Toggle (if small screen) */}
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
                width: "36px",
                height: "36px",
                backgroundColor: "rgba(30, 41, 59, 0.85)",
                border: "1px solid rgba(56, 189, 248, 0.3)",
                borderRadius: "8px",
                color: "#38bdf8",
                cursor: "pointer",
              }}
            >
              <Menu size={18} />
            </button>
          )}

          {/* Hexagon/Cube Logo Icon */}
          <Link
            to="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              textDecoration: "none",
            }}
          >
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: "linear-gradient(135deg, #0284c7 0%, #2563eb 100%)",
                border: "1.5px solid rgba(56, 189, 248, 0.6)",
                boxShadow: "0 0 16px rgba(56, 189, 248, 0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.2rem",
                color: "#ffffff",
                flexShrink: 0,
              }}
            >
              ❖
            </div>
            <div style={{ display: "flex", flexDirection: "column", lineHeight: "1.15" }}>
              <span
                style={{
                  fontSize: "0.96rem",
                  fontWeight: "900",
                  color: "#ffffff",
                  letterSpacing: "-0.01em",
                  whiteSpace: "nowrap",
                }}
              >
                Disaster Management Platform
              </span>
              <span
                style={{
                  fontSize: "0.64rem",
                  color: "#38bdf8",
                  fontWeight: "700",
                  letterSpacing: "0.02em",
                  whiteSpace: "nowrap",
                }}
              >
                Predict · Alert · Respond · Rebuild
              </span>
            </div>
          </Link>
        </div>

        {/* ─────────────── CENTER: Permanent Active Emergency Status Card ─────────────── */}
        <div
          onClick={() => navigate("/alerts")}
          style={{
            backgroundColor: "rgba(136, 19, 55, 0.28)",
            border: "1px solid rgba(244, 63, 94, 0.45)",
            borderRadius: "12px",
            padding: "5px 14px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            boxShadow: "0 0 20px rgba(225, 29, 72, 0.2)",
            cursor: "pointer",
            flexShrink: 1,
            minWidth: 0,
          }}
          title="Click to inspect Active Emergency details"
        >
          <div
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "50%",
              backgroundColor: "rgba(225, 29, 72, 0.3)",
              border: "1px solid rgba(244, 63, 94, 0.6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#f43f5e",
              fontSize: "0.9rem",
              flexShrink: 0,
            }}
          >
            ⚠️
          </div>
          <div style={{ display: "flex", flexDirection: "column", lineHeight: "1.2", minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
              <span
                style={{
                  fontSize: "0.72rem",
                  fontWeight: "900",
                  color: "#fca5a5",
                  letterSpacing: "0.04em",
                  fontFamily: "var(--font-mono, monospace)",
                }}
              >
                ACTIVE EMERGENCY
              </span>
              <span style={{ fontSize: "0.82rem", fontWeight: "800", color: "#ffffff" }}>
                NER Landslide Alert — NH-10
              </span>
              <span
                style={{
                  fontSize: "0.58rem",
                  fontWeight: "900",
                  backgroundColor: "#e11d48",
                  color: "#ffffff",
                  padding: "1px 6px",
                  borderRadius: "4px",
                }}
              >
                CRITICAL
              </span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                fontSize: "0.66rem",
                color: "#cbd5e1",
                marginTop: "2px",
                flexWrap: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              <span>🏠 4 Villages Affected</span>
              <span>👥 387 People Exposed</span>
              <span>🛣️ 2 Roads Blocked</span>
              <span style={{ color: "#94a3b8" }}>⏱️ Updated 21:42</span>
            </div>
          </div>
        </div>

        {/* ─────────────── RIGHT: Status, Clock, Language, Bell, User ─────────────── */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
          {/* System Online Badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "7px",
              backgroundColor: "rgba(16, 185, 129, 0.12)",
              border: "1px solid rgba(16, 185, 129, 0.35)",
              borderRadius: "999px",
              padding: "4px 10px",
            }}
          >
            <span
              style={{
                width: "7px",
                height: "7px",
                borderRadius: "50%",
                backgroundColor: "#10b981",
                boxShadow: "0 0 8px #10b981",
              }}
            />
            <div style={{ display: "flex", flexDirection: "column", lineHeight: "1.1", textAlign: "left" }}>
              <span style={{ fontSize: "0.68rem", fontWeight: "800", color: "#34d399" }}>System Online</span>
              <span style={{ fontSize: "0.56rem", color: "#94a3b8" }}>All Services Operational</span>
            </div>
          </div>

          {/* Live Clock & Date */}
          <div style={{ display: "flex", flexDirection: "column", textAlign: "center", lineHeight: "1.1", minWidth: "65px" }}>
            <span style={{ fontSize: "0.98rem", fontWeight: "900", color: "#ffffff", fontFamily: "var(--font-mono, monospace)" }}>
              {clock.time}
            </span>
            <span style={{ fontSize: "0.62rem", color: "#94a3b8" }}>
              {clock.date}
            </span>
          </div>

          {/* Language Switcher Dropdown */}
          <div
            style={{
              backgroundColor: "rgba(30, 41, 59, 0.75)",
              border: "1px solid rgba(56, 189, 248, 0.25)",
              borderRadius: "8px",
              padding: "4px 8px",
            }}
          >
            <select
              value={langDisplayName}
              onChange={(e) => setLangByDisplayName(e.target.value)}
              style={{
                backgroundColor: "transparent",
                color: "#ffffff",
                border: "none",
                fontSize: "0.74rem",
                fontWeight: "800",
                outline: "none",
                cursor: "pointer",
              }}
            >
              <option value="English" style={{ background: "#0f172a" }}>EN</option>
              <option value="Hindi" style={{ background: "#0f172a" }}>HI</option>
              <option value="Odia" style={{ background: "#0f172a" }}>OR</option>
              <option value="Bengali" style={{ background: "#0f172a" }}>BN</option>
              <option value="Assamese" style={{ background: "#0f172a" }}>AS</option>
            </select>
          </div>
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
                  {Boolean(user?.email && isAuthorizedAdmin(user.email)) ? "OFFICER · ADMIN" : "FIELD RESPONDER"}
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
                    to="/alerts?tab=notifications"
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
                      {Boolean(user?.email && isAuthorizedAdmin(user.email)) ? "🛡️ OFFICER ADMIN" : "🚨 VERIFIED RESPONDER"}
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
