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
  Shield,
  MapPin,
  Wifi,
  WifiOff,
  Bell,
  Radio,
  ExternalLink,
} from "lucide-react";
import {
  isUserLoggedIn,
  getCurrentUser,
  logoutSession,
  subscribeToAuthChange,
} from "../services/authService";

export default function HeaderTopBar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [loggedIn, setLoggedIn] = useState(isUserLoggedIn());
  const [user, setUser] = useState(getCurrentUser());
  const [menuOpen, setMenuOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const menuRef = useRef(null);

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

  // Close hamburger menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [menuOpen]);

  const handleLogout = async () => {
    setMenuOpen(false);
    await logoutSession();
    navigate("/login");
  };

  const displayName = user?.name || user?.displayName || (user?.email ? user.email.split("@")[0] : "Responder");
  const avatarUrl = user?.photoUrl || user?.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName)}`;

  return (
    <header
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
      {/* Left: Quick Status & Emergency Map Shortcut */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
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
          }}
          title={isOnline ? "Connected to Disaster Alert Network" : "PWA Offline Mode - Cached Maps & Local Storage Active"}
        >
          {isOnline ? (
            <>
              <span
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  backgroundColor: "#10b981",
                  boxShadow: "0 0 8px #10b981",
                }}
              />
              <span>LIVE SATELLITE NETWORK</span>
            </>
          ) : (
            <>
              <WifiOff size={12} color="#ef4444" />
              <span>OFFLINE PWA MODE</span>
            </>
          )}
        </div>

        <Link
          to="/map"
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
            transition: "all 0.2s",
          }}
        >
          <span>🗺️</span>
          <span style={{ display: "inline-block" }}>Disaster Response Map</span>
        </Link>
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
