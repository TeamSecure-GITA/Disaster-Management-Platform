import { io } from "socket.io-client";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

let socketInstance = null;
const alertListeners = new Set();

/**
 * Play a web-audio emergency beep chime (no external audio assets needed)
 */
export function playEmergencyAlertSound() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    // Two-tone warning chirp
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(880, now);
    osc1.frequency.setValueAtTime(440, now + 0.15);
    osc1.frequency.setValueAtTime(880, now + 0.3);

    gain1.gain.setValueAtTime(0.2, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);

    osc1.start(now);
    osc1.stop(now + 0.5);
  } catch (e) {
    // Audio might be blocked until user interaction
  }
}

/**
 * Display desktop OS notification with clickable link to official government website
 */
export function showDesktopGovtNotification(alert) {
  if (!("Notification" in window)) return;

  const title = alert.title || "🚨 Official Disaster Alert";
  const body = `${alert.message || "Emergency alert issued."}\n📍 Agency: ${
    alert.sourceAgency || "Govt Authority"
  }`;
  const icon = "/pwa-192x192.png";

  const trigger = () => {
    try {
      const notif = new Notification(title, {
        body,
        icon,
        badge: icon,
        requireInteraction: true,
        tag: `disaster-${alert.externalId || alert._id || Date.now()}`,
      });

      notif.onclick = () => {
        window.focus();
        if (alert.sourceUrl) {
          window.open(alert.sourceUrl, "_blank", "noopener,noreferrer");
        }
        notif.close();
      };
    } catch (e) {
      console.warn("Notification trigger error:", e);
    }
  };

  if (Notification.permission === "granted") {
    trigger();
  } else if (Notification.permission === "default") {
    Notification.requestPermission().then((perm) => {
      if (perm === "granted") trigger();
    });
  }
}

/**
 * Get or initialize socket connection
 */
export function getSocket() {
  if (socketInstance && socketInstance.connected) {
    return socketInstance;
  }

  const token = localStorage.getItem("token") || "guest";

  socketInstance = io(API_URL, {
    auth: { token },
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 2000,
    transports: ["websocket", "polling"],
  });

  socketInstance.on("connect", () => {
    console.log("[SocketService] Connected to real-time disaster alerts channel:", socketInstance.id);
  });

  socketInstance.on("connect_error", (err) => {
    console.warn("[SocketService] Connection warning:", err.message);
  });

  // Listen for official government & weather alerts
  socketInstance.on("govtDisasterAlert", (payload) => {
    const alertData = payload?.alert || payload;
    console.log("[SocketService] 🚨 Received Live Govt Disaster Alert:", alertData);
    playEmergencyAlertSound();
    showDesktopGovtNotification(alertData);
    alertListeners.forEach((callback) => {
      try {
        callback(alertData, "govt");
      } catch (err) {
        console.error("Alert listener error:", err);
      }
    });
  });

  // Listen for general new alerts
  socketInstance.on("newAlert", (alertData) => {
    console.log("[SocketService] Received new platform alert:", alertData);
    if (alertData.isGovtOfficial || alertData.severity === "critical" || alertData.severity === "high") {
      playEmergencyAlertSound();
      showDesktopGovtNotification(alertData);
    }
    alertListeners.forEach((callback) => {
      try {
        callback(alertData, "alert");
      } catch (err) {
        console.error("Alert listener error:", err);
      }
    });
  });

  return socketInstance;
}

/**
 * Subscribe to all live emergency disaster & weather alerts
 * Returns unsubscribe function
 */
export function subscribeToDisasterAlerts(callback) {
  getSocket(); // Ensure connected
  alertListeners.add(callback);
  return () => {
    alertListeners.delete(callback);
  };
}
