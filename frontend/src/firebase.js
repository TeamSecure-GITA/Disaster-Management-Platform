// ─────────────────────────────────────────────────────────────────────────────
// src/firebase.js
//
// Single Firebase app instance shared across the whole frontend.
// Config values are injected via Vite environment variables (.env).
// Add your project's values to frontend/.env:
//
//   VITE_FIREBASE_API_KEY=...
//   VITE_FIREBASE_AUTH_DOMAIN=...
//   VITE_FIREBASE_PROJECT_ID=...
//   VITE_FIREBASE_STORAGE_BUCKET=...
//   VITE_FIREBASE_MESSAGING_SENDER_ID=...
//   VITE_FIREBASE_APP_ID=...
//   VITE_FIREBASE_MEASUREMENT_ID=...   (optional — Analytics)
// ─────────────────────────────────────────────────────────────────────────────

import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getMessaging, isSupported } from "firebase/messaging";

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId:     import.meta.env.VITE_FIREBASE_MEASUREMENT_ID, // optional
};

// Prevent duplicate initialisation during hot-module reloads
let app = null;
let auth = null;
let db = null;

try {
  if (firebaseConfig.apiKey && firebaseConfig.projectId) {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    auth = getAuth(app);
    db = getFirestore(app);
  } else {
    console.warn("[Firebase] Firebase config missing. Running in standalone mode.");
  }
} catch (err) {
  console.warn("[Firebase] Failed to initialize Firebase:", err);
}

export { auth, db };

// Firebase Cloud Messaging is not available in all browsers (e.g. Safari < 16.4)
// Wrap in isSupported() so it never crashes on unsupported platforms.
export const getMessagingInstance = async () => {
  try {
    if (!app) return null;
    const supported = await isSupported();
    if (!supported) return null;
    return getMessaging(app);
  } catch (err) {
    console.warn("[Firebase] Messaging not supported or failed:", err);
    return null;
  }
};

export default app;
