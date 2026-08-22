const admin = require("firebase-admin");
const path = require("path");
const User = require("../models/User");

let firebaseInitialized = false;

const initializeFirebase = () => {
  if (firebaseInitialized) {
    return true;
  }

  try {
    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY
      ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
      : null;

    if (!serviceAccountPath && !(projectId && clientEmail && privateKey)) {
      console.warn(
        "Firebase admin is not configured. Set FIREBASE_SERVICE_ACCOUNT_PATH or FIREBASE_PROJECT_ID/FIREBASE_CLIENT_EMAIL/FIREBASE_PRIVATE_KEY."
      );
      return false;
    }

    if (admin.apps.length === 0) {
      if (serviceAccountPath) {
        const resolvedPath = path.resolve(serviceAccountPath);
        const serviceAccount = require(resolvedPath);

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
    return true;
  } catch (error) {
    console.error("Firebase initialization failed:", error.message);
    return false;
  }
};

const getUserFcmToken = async (userId) => {
  const user = await User.findById(userId).select("fcmToken");
  return user?.fcmToken || null;
};

const sendToToken = async (token, title, message, data = {}) => {
  if (!token) {
    return {
      success: false,
      message: "No FCM token provided",
      skipped: true,
    };
  }

  if (!initializeFirebase()) {
    return {
      success: false,
      message: "Firebase is not configured",
      skipped: true,
    };
  }

  try {
    const payload = {
      token,
      notification: {
        title,
        body: message,
      },
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
    console.error("FCM send failed:", error.message);
    return {
      success: false,
      message: error.message,
      provider: "firebase-fcm",
    };
  }
};

const sendToUser = async (userId, title, message, data = {}) => {
  const token = await getUserFcmToken(userId);
  return sendToToken(token, title, message, data);
};

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