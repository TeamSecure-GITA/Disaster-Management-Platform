import React, { useState, useEffect, useCallback, useRef } from "react";
import { onForegroundMessage } from "../services/fcmService";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// ─── Static seed data shown when offline or not authenticated ─────────────────
const SEED_NOTIFICATIONS = [
  {
    id: "seed-1",
    title: "Cyclone Alert",
    message: "A cyclone warning has been issued. Please monitor official emergency information.",
    location: "Odisha Coast",
    time: "10 minutes ago",
    severity: "High",
    read: false,
    createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
  },
  {
    id: "seed-2",
    title: "Flood Warning",
    message: "Heavy rainfall may cause flooding in low-lying areas.",
    location: "Bhubaneswar",
    time: "30 minutes ago",
    severity: "Medium",
    read: false,
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  {
    id: "seed-3",
    title: "Safety Information",
    message: "Emergency shelters and rescue centers are available for affected residents.",
    location: "Nearby Areas",
    time: "1 hour ago",
    severity: "Low",
    read: true,
    createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const severityIcon = (s) => (s === "High" ? "🚨" : s === "Medium" ? "⚠️" : "ℹ️");
const severityColor = (s) => (s === "High" ? "#ef4444" : s === "Medium" ? "#f59e0b" : "#94a3b8");

function timeAgo(dateStr) {
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
    const timer = setTimeout(onDismiss, 6000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div
      style={{
        position: "fixed",
        top: "80px",
        right: "20px",
        zIndex: 9999,
        backgroundColor: "#1e293b",
        border: `2px solid ${severityColor(notification.severity || "High")}`,
        borderRadius: "12px",
        padding: "14px 18px",
        maxWidth: "340px",
        color: "#fff",
        boxShadow: "0 8px 30px rgba(0,0,0,0.5)",
        animation: "slideIn 0.3s ease",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontWeight: "700", fontSize: "0.95rem", marginBottom: "4px" }}>
            {severityIcon(notification.severity || "High")} {notification.title}
          </div>
          <div style={{ fontSize: "0.82rem", color: "#94a3b8" }}>{notification.body || notification.message}</div>
        </div>
        <button
          onClick={onDismiss}
          style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: "1.1rem", padding: "0 0 0 10px" }}
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
  const [loadingApi, setLoadingApi]       = useState(false);
  const [toast, setToast]                 = useState(null);
  const unsubRef = useRef(null);

  // ── Fetch from backend ──────────────────────────────────────────────────────
  const fetchNotifications = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token || token.startsWith("demo-") || token.startsWith("local-")) return;

    setLoadingApi(true);
    try {
      const res = await fetch(`${API_URL}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const items = (json.data || []).map((n) => ({
        id: n._id || n.id,
        title: n.title,
        message: n.message || n.body || "",
        location: n.location || "Platform",
        time: timeAgo(n.createdAt),
        severity: n.severity || n.priority || "Low",
        read: n.isRead ?? n.read ?? false,
        createdAt: n.createdAt,
      }));
      if (items.length > 0) {
        setNotifications(items);
      }
    } catch (err) {
      console.warn("[Notifications] Failed to fetch from backend:", err);
      // Keep seed data visible
    } finally {
      setLoadingApi(false);
    }
  }, []);

  // ── Browser notification for unread high-severity alerts ───────────────────
  const triggerBrowserNotification = useCallback((n) => {
    if (!("Notification" in window)) return;
    if (Notification.permission === "granted") {
      new Notification(`🚨 ${n.title}`, {
        body: `${n.message}\n📍 ${n.location}`,
        icon: "/pwa-192x192.png",
        badge: "/pwa-192x192.png",
        tag: `alert-${n.id}`,
        requireInteraction: true,
      });
    } else if (Notification.permission === "default") {
      Notification.requestPermission().then((perm) => {
        if (perm === "granted") triggerBrowserNotification(n);
      });
    }
  }, []);

  // ── On mount: fetch data + subscribe to FCM foreground messages ─────────────
  useEffect(() => {
    fetchNotifications();

    // Subscribe to live FCM foreground messages
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
        createdAt: new Date().toISOString(),
      };
      setNotifications((prev) => [newNotif, ...prev]);
      setToast({ ...newNotif, body });
    }).then((unsub) => {
      if (!cancelled) unsubRef.current = unsub;
    });

    return () => {
      cancelled = true;
      if (unsubRef.current) unsubRef.current();
    };
  }, [fetchNotifications]);

  // ── Trigger browser notifications for unread high-severity on mount ─────────
  useEffect(() => {
    notifications
      .filter((n) => !n.read && n.severity === "High")
      .forEach(triggerBrowserNotification);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
      } catch {/* non-fatal */}
    }
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Inline keyframe animation for the toast */}
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(30px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>

      {/* Live FCM toast */}
      {toast && <Toast notification={toast} onDismiss={() => setToast(null)} />}

      <div className="notifications-page">
        <div className="notifications-header">
          <div>
            <h1>📢 Emergency Notifications</h1>
            <p>
              Important disaster alerts and emergency information.
              {loadingApi && <span style={{ color: "#60a5fa", marginLeft: "8px" }}>⟳ Syncing…</span>}
            </p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px" }}>
            <div className="notification-count">🔔 {unreadCount} Unread</div>
            <button
              onClick={fetchNotifications}
              style={{ background: "none", border: "1px solid #334155", color: "#94a3b8", fontSize: "0.75rem", cursor: "pointer", borderRadius: "6px", padding: "4px 10px" }}
            >
              ↻ Refresh
            </button>
          </div>
        </div>

        {unreadCount > 0 && (
          <button className="mark-all-btn" onClick={markAllAsRead}>
            ✓ Mark All as Read
          </button>
        )}

        <div className="notifications-list">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`notification-card ${notification.read ? "notification-read" : "notification-unread"}`}
            >
              <div className="notification-icon">{severityIcon(notification.severity)}</div>

              <div className="notification-content">
                <div className="notification-title-row">
                  <h2>{notification.title}</h2>
                  {!notification.read && <span className="new-badge">NEW</span>}
                </div>

                <p>{notification.message}</p>

                <div className="notification-details">
                  <span>📍 {notification.location}</span>
                  <span>🕐 {notification.time}</span>
                  <span style={{ color: severityColor(notification.severity), fontWeight: "600" }}>
                    ⚠️ {notification.severity}
                  </span>
                </div>

                {!notification.read && (
                  <button
                    className="read-btn"
                    onClick={() => markAsRead(notification.id)}
                  >
                    ✓ Mark as Read
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {notifications.length === 0 && !loadingApi && (
          <div className="empty-notifications">🔔 No notifications available.</div>
        )}
      </div>
    </>
  );
}

export default Notifications;