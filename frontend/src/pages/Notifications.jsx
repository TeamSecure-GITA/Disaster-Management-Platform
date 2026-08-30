import React, { useState, useEffect } from "react";

const INITIAL_NOTIFICATIONS = [
  {
    id: 1,
    title: "Cyclone Alert",
    message: "A cyclone warning has been issued. Please monitor official emergency information.",
    location: "Odisha Coast",
    time: "10 minutes ago",
    severity: "High",
    read: false,
  },
  {
    id: 2,
    title: "Flood Warning",
    message: "Heavy rainfall may cause flooding in low-lying areas.",
    location: "Bhubaneswar",
    time: "30 minutes ago",
    severity: "Medium",
    read: false,
  },
  {
    id: 3,
    title: "Safety Information",
    message: "Emergency shelters and rescue centers are available for affected residents.",
    location: "Nearby Areas",
    time: "1 hour ago",
    severity: "Low",
    read: true,
  },
];

const STORAGE_KEY = "notification_read_state";

function Notifications() {
  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const readIds = JSON.parse(saved);
        return INITIAL_NOTIFICATIONS.map((n) => ({
          ...n,
          read: readIds.includes(n.id) || n.read,
        }));
      }
    } catch {}
    return INITIAL_NOTIFICATIONS;
  });

  // Persist read state to localStorage
  const persistReadState = (updatedNotifications) => {
    const readIds = updatedNotifications.filter((n) => n.read).map((n) => n.id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(readIds));
  };

  // Request notification permission on mount and trigger browser notification
  // for any unread high-severity alerts
  useEffect(() => {
    const unreadHigh = notifications.filter((n) => !n.read && n.severity === "High");
    if (unreadHigh.length === 0) return;

    const triggerBrowserNotification = (notification) => {
      if (Notification.permission === "granted") {
        new Notification(`🚨 ${notification.title}`, {
          body: `${notification.message}\n📍 ${notification.location}`,
          icon: "/pwa-192x192.png",
          badge: "/pwa-192x192.png",
          tag: `alert-${notification.id}`,
          requireInteraction: true,
        });
      } else if (Notification.permission === "default") {
        Notification.requestPermission().then((permission) => {
          if (permission === "granted") {
            triggerBrowserNotification(notification);
          }
        });
      }
    };

    unreadHigh.forEach((n) => triggerBrowserNotification(n));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const markAsRead = (id) => {
    const updated = notifications.map((n) =>
      n.id === id ? { ...n, read: true } : n
    );
    setNotifications(updated);
    persistReadState(updated);
  };

  const markAllAsRead = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(updated);
    persistReadState(updated);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const severityIcon = (s) =>
    s === "High" ? "🚨" : s === "Medium" ? "⚠️" : "ℹ️";

  return (
    <div className="notifications-page">
      <div className="notifications-header">
        <div>
          <h1>📢 Emergency Notifications</h1>
          <p>Important disaster alerts and emergency information.</p>
        </div>
        <div className="notification-count">🔔 {unreadCount} Unread</div>
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
                <span
                  style={{
                    color:
                      notification.severity === "High"
                        ? "#ef4444"
                        : notification.severity === "Medium"
                        ? "#f59e0b"
                        : "#94a3b8",
                    fontWeight: "600",
                  }}
                >
                  ⚠️ {notification.severity}
                </span>
              </div>

              {!notification.read && (
                <button className="read-btn" onClick={() => markAsRead(notification.id)}>
                  ✓ Mark as Read
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {notifications.length === 0 && (
        <div className="empty-notifications">🔔 No notifications available.</div>
      )}
    </div>
  );
}

export default Notifications;