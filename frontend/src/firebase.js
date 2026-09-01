import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getMessaging, isSupported as isMessagingSupported } from "firebase/messaging";
import { getAnalytics, isSupported as isAnalyticsSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCwO7cZ3llc2AQKTFCyIA8bE4VaEvb_I7E",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "disaster-management-plat-cd635.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "disaster-management-plat-cd635",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "disaster-management-plat-cd635.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1048123149571",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1048123149571:web:140cbe32cb0621c06bad36",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-E90RLYGPS2"
};

// Prevent duplicate initialization during hot-module reloads
let app = null;
let auth = null;
let db = null;
let analytics = null;

try {
  if (firebaseConfig.apiKey && firebaseConfig.projectId) {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    auth = getAuth(app);
    db = getFirestore(app);

    // Analytics is only supported in browser environments
    if (typeof window !== "undefined") {
      isAnalyticsSupported().then((supported) => {
        if (supported) {
          analytics = getAnalytics(app);
        }
      }).catch((err) => {
        console.warn("[Firebase] Analytics initialization error:", err);
      });
    }
  } else {
    console.warn("[Firebase] Firebase config missing. Running in standalone mode.");
  }
} catch (err) {
  console.warn("[Firebase] Failed to initialize Firebase:", err);
}

export { auth, db, analytics };

// Firebase Cloud Messaging is not available in all browsers (e.g. Safari < 16.4)
// Wrap in isMessagingSupported() so it never crashes on unsupported platforms.
export const getMessagingInstance = async () => {
  try {
    if (!app) return null;
    const supported = await isMessagingSupported();
    if (!supported) return null;
    return getMessaging(app);
  } catch (err) {
    console.warn("[Firebase] Messaging not supported or failed:", err);
    return null;
  }
};

export default app;
