import React, { useState, useEffect, useCallback, useRef } from "react";
import { onForegroundMessage } from "../services/fcmService";
import { subscribeToDisasterAlerts } from "../services/socketService";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// ─── Initial seed data shown when offline or first loading ─────────────────────
const SEED_NOTIFICATIONS = [
  {
    id: "seed-1",
    title: "[IMD / NDMA SACHET] Cyclone & High Squall Advisory",
    message: "Severe weather system active. Heavy rainfall & squally wind conditions forecasted along the coastal belt.",
    location: "Odisha & Bengal Coast",
    time: "10 minutes ago",
    severity: "High",
    read: false,
    sourceAgency: "IMD Govt of India / NDMA SACHET",
    sourceUrl: "https://sachet.ndma.gov.in/",
    isGovtOfficial: true,
    createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
  },
  {
    id: "seed-2",
    title: "[CWC Flood Forecast] River Basin Inundation Warning",
    message: "River catchment precipitation triggering advisory levels in delta zones.",
    location: "Bhubaneswar & Cuttack",
    time: "30 minutes ago",
    severity: "Medium",
    read: false,
    sourceAgency: "Central Water Commission",
    sourceUrl: "https://ffs.india-water.gov.in/",
    isGovtOfficial: true,
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  {
    id: "seed-3",
    title: "Safety Centers & Shelters Operational",
    message: "Multi-purpose emergency shelters and relief distribution points are prepared.",
    location: "Nearby Safe Zones",
    time: "1 hour ago",
    severity: "Low",
    read: true,
    sourceAgency: "Platform Emergency Administration",
    sourceUrl: "https://sachet.ndma.gov.in/",
    isGovtOfficial: false,
    createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const severityIcon = (s) => {
  const sev = (s || "").toLowerCase();
  if (sev === "critical" || sev === "high") return "🚨";
  if (sev === "medium") return "⚠️";
  return "ℹ️";
};

const severityColor = (s) => {
  const sev = (s || "").toLowerCase();
  if (sev === "critical") return "#dc2626";
  if (sev === "high") return "#ef4444";
  if (sev === "medium") return "#f59e0b";
  return "#94a3b8";
};

function timeAgo(dateStr) {
  if (!dateStr) return "just now";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// ─── Toast component ──────────────────────────────────────────────────────────
function Toast({ notification, onDismiss }) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 8000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const officialUrl = notification.sourceUrl || "https://sachet.ndma.gov.in/";

  return (
    <div
      style={{
        position: "fixed",
        top: "80px",
        right: "20px",
        zIndex: 9999,
        backgroundColor: "#0f172a",
        border: `2px solid ${severityColor(notification.severity || "High")}`,
        borderRadius: "12px",
        padding: "16px 20px",
        maxWidth: "380px",
        color: "#fff",
        boxShadow: "0 10px 35px rgba(0,0,0,0.6)",
        animation: "slideIn 0.3s ease",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px" }}>
        <div>
          {notification.sourceAgency && (
            <div
              style={{
                fontSize: "0.68rem",
                fontWeight: "800",
                color: "#38bdf8",
                textTransform: "uppercase",
                marginBottom: "4px",
              }}
            >
              🏛️ {notification.sourceAgency}
            </div>
          )}
          <div style={{ fontWeight: "700", fontSize: "0.95rem", marginBottom: "4px" }}>
            {severityIcon(notification.severity)} {notification.title}
          </div>
          <div style={{ fontSize: "0.82rem", color: "#cbd5e1", marginBottom: "10px" }}>
            {notification.body || notification.message}
          </div>

          {officialUrl && (
            <a
              href={officialUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                backgroundColor: "#2563eb",
                color: "#fff",
                fontSize: "0.75rem",
                fontWeight: "700",
                padding: "6px 12px",
                borderRadius: "6px",
                textDecoration: "none",
              }}
            >
              <span>View Official Advisory</span>
              <span>↗</span>
            </a>
          )}
        </div>
        <button
          onClick={onDismiss}
          style={{
            background: "none",
            border: "none",
            color: "#64748b",
            cursor: "pointer",
            fontSize: "1.2rem",
            padding: "0",
            lineHeight: 1,
          }}
          aria-label="Dismiss notification"
        >
          ×
        </button>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
function Notifications() {
  const [notifications, setNotifications] = useState(SEED_NOTIFICATIONS);
  const [loadingApi, setLoadingApi] = useState(false);
  const [toast, setToast] = useState(null);
  const [filterTab, setFilterTab] = useState("all");
  const unsubRef = useRef(null);

  // ── Fetch from backend ──────────────────────────────────────────────────────
  const fetchNotifications = useCallback(async () => {
    setLoadingApi(true);
    const token = localStorage.getItem("token");

    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(`${API_URL}/api/notifications`, { headers });

      if (res.ok) {
        const json = await res.json();
        const items = (json.data || []).map((n) => ({
          id: n._id || n.id,
          title: n.title,
          message: n.message || n.body || "",
          location: n.location || n.metadata?.location || "Regional",
          time: timeAgo(n.createdAt),
          severity: n.priority || n.severity || "Normal",
          read: n.isRead ?? n.read ?? false,
          sourceAgency: n.sourceAgency || n.metadata?.sourceAgency || (n.sourceUrl ? "Official Govt Feed" : null),
          sourceUrl: n.sourceUrl || n.metadata?.sourceUrl || (n.isBroadcast ? "https://sachet.ndma.gov.in/" : null),
          isGovtOfficial: Boolean(n.sourceUrl || n.isBroadcast || n.sourceAgency),
          createdAt: n.createdAt,
        }));

        if (items.length > 0) {
          setNotifications(items);
        }
      }
    } catch (err) {
      console.warn("[Notifications] Backend fetch notice:", err.message);
    } finally {
      setLoadingApi(false);
    }
  }, []);

  // ── Browser notification trigger ───────────────────────────────────────────
  const triggerBrowserNotification = useCallback((n) => {
    if (!("Notification" in window)) return;
    const trigger = () => {
      try {
        const notif = new Notification(`🚨 ${n.title}`, {
          body: `${n.message}\n📍 ${n.location || "Official Alert"}`,
          icon: "/pwa-192x192.png",
          badge: "/pwa-192x192.png",
          tag: `alert-${n.id}`,
          requireInteraction: true,
        });
        notif.onclick = () => {
          window.focus();
          if (n.sourceUrl) {
            window.open(n.sourceUrl, "_blank", "noopener,noreferrer");
          }
        };
      } catch (e) {}
    };

    if (Notification.permission === "granted") {
      trigger();
    } else if (Notification.permission === "default") {
      Notification.requestPermission().then((perm) => {
        if (perm === "granted") trigger();
      });
    }
  }, []);

  // ── On mount: fetch notifications + subscribe to Real-time Socket & FCM ─────
  useEffect(() => {
    fetchNotifications();

    // 1. Subscribe to Live Government Disaster Alerts via Socket.IO
    const unsubSocket = subscribeToDisasterAlerts((newAlert) => {
      const newNotif = {
        id: newAlert._id || `socket-${Date.now()}`,
        title: newAlert.title,
        message: newAlert.message,
        location: newAlert.affectedAreas?.[0] || newAlert.country || "Active Region",
        time: "just now",
        severity: newAlert.severity || "High",
        read: false,
        sourceAgency: newAlert.sourceAgency || "Official Govt Disaster Bureau",
        sourceUrl: newAlert.sourceUrl || "https://sachet.ndma.gov.in/",
        isGovtOfficial: true,
        createdAt: new Date().toISOString(),
      };

      setNotifications((prev) => [newNotif, ...prev]);
      setToast(newNotif);
      triggerBrowserNotification(newNotif);
    });

    // 2. Subscribe to FCM foreground push messages
    let cancelled = false;
    onForegroundMessage(({ title, body, data }) => {
      if (cancelled) return;
      const newNotif = {
        id: `fcm-${Date.now()}`,
        title,
        message: body,
        location: data?.location || "Live Alert",
        time: "just now",
        severity: data?.severity || "High",
        read: false,
        sourceAgency: data?.sourceAgency || "Emergency Alert System",
        sourceUrl: data?.sourceUrl || "https://sachet.ndma.gov.in/",
        isGovtOfficial: true,
        createdAt: new Date().toISOString(),
      };
      setNotifications((prev) => [newNotif, ...prev]);
      setToast(newNotif);
      triggerBrowserNotification(newNotif);
    }).then((unsub) => {
      if (!cancelled) unsubRef.current = unsub;
    });

    return () => {
      cancelled = true;
      if (unsubRef.current) unsubRef.current();
      unsubSocket();
    };
  }, [fetchNotifications, triggerBrowserNotification]);

  // ── Mark as read (backend + local state) ────────────────────────────────────
  const markAsRead = async (id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));

    const token = localStorage.getItem("token");
    if (token && !token.startsWith("demo-") && !token.startsWith("local-")) {
      try {
        await fetch(`${API_URL}/api/notifications/${id}/read`, {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch {}
    }
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  // Filtered notifications
  const displayedNotifications = notifications.filter((n) => {
    if (filterTab === "govt") return n.isGovtOfficial;
    if (filterTab === "platform") return !n.isGovtOfficial;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <>
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(30px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>

      {/* Live Toast */}
      {toast && <Toast notification={toast} onDismiss={() => setToast(null)} />}

      <div className="notifications-page" style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: "16px",
            marginBottom: "20px",
          }}
        >
          <div>
            <h1 style={{ fontSize: "1.8rem", fontWeight: "800", color: "#f8fafc", margin: 0 }}>
              📢 Emergency & Disaster Notifications
            </h1>
            <p style={{ color: "#94a3b8", marginTop: "4px", fontSize: "0.95rem" }}>
              Direct live broadcasts synchronized with government disaster management feeds and meteorological warning bureaus.
              {loadingApi && <span style={{ color: "#60a5fa", marginLeft: "8px" }}>⟳ Syncing with official portals…</span>}
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span
              style={{
                backgroundColor: unreadCount > 0 ? "rgba(239, 68, 68, 0.2)" : "rgba(100, 116, 139, 0.2)",
                color: unreadCount > 0 ? "#f87171" : "#94a3b8",
                border: `1px solid ${unreadCount > 0 ? "#ef4444" : "#334155"}`,
                borderRadius: "20px",
                padding: "6px 14px",
                fontSize: "0.85rem",
                fontWeight: "700",
              }}
            >
              🔔 {unreadCount} Unread
            </span>

            <button
              onClick={fetchNotifications}
              style={{
                background: "#1e293b",
                border: "1px solid #334155",
                color: "#94a3b8",
                fontSize: "0.82rem",
                fontWeight: "600",
                cursor: "pointer",
                borderRadius: "8px",
                padding: "8px 14px",
              }}
            >
              ↻ Refresh
            </button>
          </div>
        </div>

        {/* Filter Tabs & Mark All as Read */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "10px",
            marginBottom: "20px",
          }}
        >
          <div style={{ display: "flex", gap: "8px" }}>
            {[
              { id: "all", label: "All Notifications" },
              { id: "govt", label: "🏛️ Official Govt Disaster Feeds" },
              { id: "platform", label: "👥 Platform Updates" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterTab(tab.id)}
                style={{
                  backgroundColor: filterTab === tab.id ? "#2563eb" : "#0f172a",
                  color: filterTab === tab.id ? "#ffffff" : "#94a3b8",
                  border: "1px solid",
                  borderColor: filterTab === tab.id ? "#3b82f6" : "#334155",
                  borderRadius: "8px",
                  padding: "8px 14px",
                  fontSize: "0.85rem",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              style={{
                backgroundColor: "transparent",
                border: "1px solid #334155",
                color: "#38bdf8",
                fontSize: "0.82rem",
                fontWeight: "600",
                padding: "6px 12px",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              ✓ Mark All as Read
            </button>
          )}
        </div>

        {/* Notification List */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {displayedNotifications.map((notification) => {
            const officialUrl = notification.sourceUrl || (notification.isGovtOfficial ? "https://sachet.ndma.gov.in/" : null);

            return (
              <div
                key={notification.id}
                style={{
                  backgroundColor: notification.read ? "#0f172a" : "#1e293b",
                  border: `1px solid ${notification.read ? "#1e293b" : "#334155"}`,
                  borderLeft: `4px solid ${severityColor(notification.severity)}`,
                  borderRadius: "10px",
                  padding: "16px",
                  display: "flex",
                  gap: "14px",
                  alignItems: "flex-start",
                  transition: "background-color 0.2s",
                }}
              >
                <div style={{ fontSize: "1.5rem", flexShrink: 0, marginTop: "2px" }}>
                  {severityIcon(notification.severity)}
                </div>

                <div style={{ flex: 1 }}>
                  {/* Agency badge & tags */}
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "4px" }}>
                    {notification.sourceAgency && (
                      <span
                        style={{
                          backgroundColor: "rgba(56, 189, 248, 0.15)",
                          color: "#38bdf8",
                          border: "1px solid rgba(56, 189, 248, 0.3)",
                          fontSize: "0.68rem",
                          fontWeight: "800",
                          padding: "2px 8px",
                          borderRadius: "4px",
                          textTransform: "uppercase",
                        }}
                      >
                        🏛️ {notification.sourceAgency}
                      </span>
                    )}

                    {!notification.read && (
                      <span
                        style={{
                          backgroundColor: "#ef4444",
                          color: "#fff",
                          fontSize: "0.65rem",
                          fontWeight: "800",
                          padding: "2px 6px",
                          borderRadius: "4px",
                        }}
                      >
                        NEW
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h2 style={{ fontSize: "1rem", fontWeight: "700", color: "#f8fafc", margin: "0 0 6px 0" }}>
                    {notification.title}
                  </h2>

                  {/* Message body */}
                  <p style={{ fontSize: "0.88rem", color: "#cbd5e1", margin: "0 0 10px 0", lineHeight: 1.5 }}>
                    {notification.message}
                  </p>

                  {/* Meta details & Action Links */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                      gap: "10px",
                      fontSize: "0.78rem",
                      color: "#94a3b8",
                    }}
                  >
                    <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                      <span>📍 {notification.location}</span>
                      <span>🕐 {notification.time}</span>
                      <span style={{ color: severityColor(notification.severity), fontWeight: "600" }}>
                        ⚠️ {notification.severity}
                      </span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      {/* Direct official website link */}
                      {officialUrl && (
                        <a
                          href={officialUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            backgroundColor: "#2563eb",
                            color: "#ffffff",
                            padding: "6px 12px",
                            borderRadius: "6px",
                            fontSize: "0.75rem",
                            fontWeight: "700",
                            textDecoration: "none",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          <span>🌐 Official Govt Report</span>
                          <span>↗</span>
                        </a>
                      )}

                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          style={{
                            backgroundColor: "transparent",
                            border: "1px solid #475569",
                            color: "#94a3b8",
                            padding: "5px 10px",
                            borderRadius: "6px",
                            fontSize: "0.75rem",
                            cursor: "pointer",
                          }}
                        >
                          ✓ Mark Read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {displayedNotifications.length === 0 && !loadingApi && (
            <div
              style={{
                textAlign: "center",
                padding: "50px 20px",
                backgroundColor: "#0f172a",
                borderRadius: "10px",
                border: "1px solid #1e293b",
                color: "#94a3b8",
              }}
            >
              🔔 No notifications found in this category.
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Notifications;