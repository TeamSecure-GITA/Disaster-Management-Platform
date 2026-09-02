// ─────────────────────────────────────────────────────────────────────────────
// src/services/fcmService.js
//
// Firebase Cloud Messaging (FCM) client-side service.
// Requests notification permission, obtains an FCM token, and registers it
// with the backend so the server can send push notifications to this device.
// ─────────────────────────────────────────────────────────────────────────────

import { getToken, onMessage } from "firebase/messaging";
import { getMessagingInstance } from "../firebase";

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY || "";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

/**
 * Request notification permission from the user.
 * @returns {"granted"|"denied"|"default"|"unsupported"}
 */
export const requestNotificationPermission = async () => {
  if (!("Notification" in window)) return "unsupported";
  if (Notification.permission === "granted") return "granted";
  if (Notification.permission === "denied") return "denied";
  const result = await Notification.requestPermission();
  return result;
};

/**
 * Get the FCM registration token for this device.
 * Returns null if messaging is not supported or permission is denied.
 */
export const getFcmToken = async () => {
  try {
    const messaging = await getMessagingInstance();
    if (!messaging) return null;

    const permission = await requestNotificationPermission();
    if (permission !== "granted") {
      console.info("[FCM] Notification permission not granted:", permission);
      return null;
    }

    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY || undefined,
      serviceWorkerRegistration: await navigator.serviceWorker.getRegistration("/firebase-messaging-sw.js"),
    });

    return token || null;
  } catch (err) {
    console.warn("[FCM] Could not get FCM token:", err);
    return null;
  }
};

/**
 * Save the FCM token to the backend.
 * Requires a valid JWT token in localStorage.
 */
const saveFcmTokenToBackend = async (fcmToken) => {
  const authToken = localStorage.getItem("token");
  if (!authToken || authToken.startsWith("demo-") || authToken.startsWith("local-")) {
    // Demo / offline sessions — skip backend sync
    return;
  }

  try {
    await fetch(`${API_URL}/api/users/fcm-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ fcmToken }),
    });
    console.info("[FCM] Token registered with backend.");
  } catch (err) {
    console.warn("[FCM] Failed to save token to backend:", err);
  }
};

/**
 * Subscribe to foreground (in-app) FCM messages.
 * Pass a callback that receives { title, body, data } when a message arrives.
 * Returns an unsubscribe function.
 */
export const onForegroundMessage = async (callback) => {
  try {
    const messaging = await getMessagingInstance();
    if (!messaging) return () => {};

    const unsubscribe = onMessage(messaging, (payload) => {
      const title = payload.notification?.title || "Emergency Alert";
      const body = payload.notification?.body || "";
      const data = payload.data || {};
      callback({ title, body, data });

      // Also show a browser notification if the tab is not focused
      if (document.visibilityState !== "visible" && Notification.permission === "granted") {
        new Notification(`🚨 ${title}`, {
          body,
          icon: "/pwa-192x192.png",
          badge: "/pwa-192x192.png",
          tag: `fcm-${Date.now()}`,
        });
      }
    });

    return unsubscribe;
  } catch (err) {
    console.warn("[FCM] onMessage setup failed:", err);
    return () => {};
  }
};

/**
 * Initialize FCM: get token + register with backend.
 * Call this once after the user is authenticated.
 */
export const initFCM = async () => {
  try {
    const token = await getFcmToken();
    if (token) {
      await saveFcmTokenToBackend(token);
    }
    return token;
  } catch (err) {
    console.warn("[FCM] Initialization failed:", err);
    return null;
  }
};
