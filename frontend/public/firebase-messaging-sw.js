// ─────────────────────────────────────────────────────────────────────────────
// public/firebase-messaging-sw.js
//
// Firebase Cloud Messaging Service Worker.
// Handles BACKGROUND push notifications when the app tab is not in focus
// or the browser is closed. This file MUST live at the root URL path
// (i.e., served from /firebase-messaging-sw.js).
//
// Firebase credentials are inlined here because service workers cannot
// import from ES modules (Vite environment variables are not available).
// These are PUBLIC keys — safe to commit (they identify your Firebase project
// but do NOT grant server-side access).
// ─────────────────────────────────────────────────────────────────────────────

importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyCwO7cZ3llc2AQKTFCyIA8bE4VaEvb_I7E",
  authDomain: "disaster-management-plat-cd635.firebaseapp.com",
  projectId: "disaster-management-plat-cd635",
  storageBucket: "disaster-management-plat-cd635.firebasestorage.app",
  messagingSenderId: "1048123149571",
  appId: "1:1048123149571:web:140cbe32cb0621c06bad36",
  measurementId: "G-E90RLYGPS2",
});

const messaging = firebase.messaging();

// ─── Background message handler ────────────────────────────────────────────
// Fires when a push notification arrives while the page is in the background
// or the browser tab is closed.
messaging.onBackgroundMessage((payload) => {
  console.log("[SW] Background FCM message received:", payload);

  const title = payload.notification?.title || "🚨 Emergency Alert";
  const body  = payload.notification?.body  || "A new emergency alert has been issued.";
  const icon  = payload.notification?.icon  || "/pwa-192x192.png";
  const badge = "/pwa-192x192.png";

  const notificationOptions = {
    body,
    icon,
    badge,
    tag: `disaster-alert-${Date.now()}`,
    requireInteraction: true,
    vibrate: [200, 100, 200, 100, 200],
    data: {
      url: payload.data?.url || "/notifications",
      ...payload.data,
    },
    actions: [
      { action: "view",   title: "View Alert" },
      { action: "dismiss", title: "Dismiss" },
    ],
  };

  self.registration.showNotification(title, notificationOptions);
});

// ─── Notification click handler ─────────────────────────────────────────────
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "dismiss") return;

  const targetUrl = event.notification.data?.url || "/notifications";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((windowClients) => {
        // If the app is already open, focus it and navigate
        for (const client of windowClients) {
          if (client.url.includes(self.location.origin) && "focus" in client) {
            client.focus();
            client.navigate(targetUrl);
            return;
          }
        }
        // Otherwise open a new window
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      })
  );
});
