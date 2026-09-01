// ─────────────────────────────────────────────────────────────────────────────
// services/pushNotificationService.js
//
// Firebase Cloud Messaging (FCM) push notification service using firebase-admin.
// Sourced from Disaster-Management-Platform-2 (Zip modified) and merged with
// our existing environment.js config pattern.
//
// Configuration — set these in Backend/.env:
//   FIREBASE_PROJECT_ID=your-project-id
//   FIREBASE_CLIENT_EMAIL=firebase-adminsdk-...@your-project.iam.gserviceaccount.com
//   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
//   FIREBASE_SERVICE_ACCOUNT_PATH=/absolute/path/to/serviceAccountKey.json  (optional)
// ─────────────────────────────────────────────────────────────────────────────

const admin = require("firebase-admin");
const path  = require("path");
const User  = require("../models/User");

let firebaseInitialized = false;

// ─── Initialise Firebase Admin (lazy, idempotent) ────────────────────────────

const initializeFirebase = () => {
    if (firebaseInitialized) return true;

    try {
        const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
        const projectId          = process.env.FIREBASE_PROJECT_ID;
        const clientEmail        = process.env.FIREBASE_CLIENT_EMAIL;
        const privateKey         = process.env.FIREBASE_PRIVATE_KEY
            ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
            : null;

        // Neither path nor inline credentials configured → warn and skip
        if (!serviceAccountPath && !(projectId && clientEmail && privateKey)) {
            console.warn(
                "[FCM] Firebase Admin is not configured. " +
                "Set FIREBASE_SERVICE_ACCOUNT_PATH or " +
                "FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY."
            );
            return false;
        }

        // Only call initializeApp once (guard against hot-reload double-init)
        if (admin.apps.length === 0) {
            if (serviceAccountPath) {
                const resolved      = path.resolve(serviceAccountPath);
                const serviceAccount = require(resolved);
                admin.initializeApp({
                    credential: admin.credential.cert(serviceAccount),
                });
            } else {
                admin.initializeApp({
                    credential: admin.credential.cert({
                        projectId,
                        clientEmail,
                        privateKey,
                    }),
                });
            }
        }

        firebaseInitialized = true;
        console.log("[FCM] Firebase Admin SDK initialised successfully.");
        return true;
    } catch (error) {
        console.error("[FCM] Firebase initialisation failed:", error.message);
        return false;
    }
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Look up the FCM device token stored on the User document.
 * Returns null if the user doesn't exist or has no token registered.
 */
const getUserFcmToken = async (userId) => {
    const user = await User.findById(userId).select("fcmToken");
    return user?.fcmToken || null;
};

// ─── Core send functions ──────────────────────────────────────────────────────

/**
 * Send a push notification to a specific FCM device token.
 *
 * @param {string} token   - FCM registration token
 * @param {string} title   - Notification title
 * @param {string} message - Notification body
 * @param {object} data    - Additional key-value data payload (values must be strings)
 * @returns {Promise<{ success: boolean, messageId?: string, message?: string, provider: string, skipped?: boolean }>}
 */
const sendToToken = async (token, title, message, data = {}) => {
    if (!token) {
        return {
            success: false,
            message: "No FCM token provided",
            provider: "firebase-fcm",
            skipped: true,
        };
    }

    if (!initializeFirebase()) {
        return {
            success: false,
            message: "Firebase is not configured",
            provider: "firebase-fcm",
            skipped: true,
        };
    }

    try {
        const payload = {
            token,
            notification: { title, body: message },
            // FCM data payloads must be string:string maps
            data: Object.entries(data).reduce((acc, [key, value]) => {
                acc[key] = String(value);
                return acc;
            }, {}),
        };

        const response = await admin.messaging().send(payload);

        return {
            success: true,
            messageId: response,
            provider: "firebase-fcm",
        };
    } catch (error) {
        console.error("[FCM] send failed:", error.message);
        return {
            success: false,
            message: error.message,
            provider: "firebase-fcm",
        };
    }
};

/**
 * Send a push notification to a user by their MongoDB User ID.
 * Resolves the FCM token automatically.
 */
const sendToUser = async (userId, title, message, data = {}) => {
    const token = await getUserFcmToken(userId);
    return sendToToken(token, title, message, data);
};

/**
 * Alias kept for backwards compatibility with existing notificationService.js calls.
 */
const sendPushNotification = async (userId, title, message, data = {}) => {
    return sendToUser(userId, title, message, data);
};

module.exports = {
    initializeFirebase,
    getUserFcmToken,
    sendToToken,
    sendToUser,
    sendPushNotification,
};