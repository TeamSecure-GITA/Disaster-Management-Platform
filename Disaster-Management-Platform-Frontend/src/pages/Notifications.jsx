import React, { useState } from "react";

function Notifications() {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "Cyclone Alert",
      message:
        "A cyclone warning has been issued. Please monitor official emergency information.",
      location: "Odisha Coast",
      time: "10 minutes ago",
      severity: "High",
      read: false,
    },
    {
      id: 2,
      title: "Flood Warning",
      message:
        "Heavy rainfall may cause flooding in low-lying areas.",
      location: "Bhubaneswar",
      time: "30 minutes ago",
      severity: "Medium",
      read: false,
    },
    {
      id: 3,
      title: "Safety Information",
      message:
        "Emergency shelters and rescue centers are available for affected residents.",
      location: "Nearby Areas",
      time: "1 hour ago",
      severity: "Low",
      read: true,
    },
  ]);

  const markAsRead = (id) => {
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === id
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications((current) =>
      current.map((notification) => ({
        ...notification,
        read: true,
      }))
    );
  };

  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  return (
    <div className="notifications-page">
      <div className="notifications-header">
        <div>
          <h1>📢 Emergency Notifications</h1>

          <p>
            Important disaster alerts and emergency information.
          </p>
        </div>

        <div className="notification-count">
          🔔 {unreadCount} Unread
        </div>
      </div>

      <button
        className="mark-all-btn"
        onClick={markAllAsRead}
      >
        ✓ Mark All as Read
      </button>

      <div className="notifications-list">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`notification-card ${
              notification.read ? "notification-read" : "notification-unread"
            }`}
          >
            <div className="notification-icon">
              {notification.severity === "High"
                ? "🚨"
                : notification.severity === "Medium"
                ? "⚠️"
                : "ℹ️"}
            </div>

            <div className="notification-content">
              <div className="notification-title-row">
                <h2>{notification.title}</h2>

                {!notification.read && (
                  <span className="new-badge">NEW</span>
                )}
              </div>

              <p>{notification.message}</p>

              <div className="notification-details">
                <span>📍 {notification.location}</span>
                <span>🕐 {notification.time}</span>
                <span>⚠️ {notification.severity}</span>
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

      {notifications.length === 0 && (
        <div className="empty-notifications">
          🔔 No notifications available.
        </div>
      )}
    </div>
  );
}

export default Notifications;