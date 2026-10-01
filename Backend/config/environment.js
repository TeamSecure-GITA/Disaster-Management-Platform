const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "..", ".env") });

const isProd = (process.env.NODE_ENV || "development") === "production";

const mongoUri =
  process.env.MONGO_URI ||
  process.env.MONGODB_URI ||
  (isProd ? undefined : "mongodb://127.0.0.1:27017/disaster_management");

if (isProd && !mongoUri) {
  throw new Error("MONGO_URI must be provided in production environment.");
}

const jwtSecret =
  process.env.JWT_SECRET ||
  (isProd ? undefined : "dev-only-jwt-secret-not-for-production-min32chars");

if (isProd && !jwtSecret) {
  throw new Error("JWT_SECRET must be provided in production environment.");
}

const environment = {
  nodeEnv: process.env.NODE_ENV || "development",

  port: Number(process.env.PORT) || 5000,

  mongoUri: mongoUri,

  jwtSecret: jwtSecret,

  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",

  frontendUrl:
    process.env.FRONTEND_URL || "http://localhost:5500",

  aiChatbotUrl: (() => {
    const raw = process.env.AI_CHATBOT_URL;
    if (raw) {
      return raw.startsWith("http://") || raw.startsWith("https://")
        ? raw
        : `http://${raw}`;
    }
    return "http://ai-service:8000";
  })(),

  satelliteApiUrl:
    process.env.SATELLITE_API_URL || "https://catalogue.dataspace.copernicus.eu/odata/v1/Products",

  copernicusStacUrl:
    process.env.COPERNICUS_STAC_URL || "https://catalogue.dataspace.copernicus.eu/stac/search",

  satelliteSoilMoistureApiUrl:
    process.env.SATELLITE_SOIL_MOISTURE_API_URL || "https://api.open-meteo.com/v1/forecast",

  uploadDirectory:
    process.env.UPLOAD_DIRECTORY || "uploads",

  cloudStorageProvider:
    process.env.CLOUD_STORAGE_PROVIDER || "local",

  cloudinaryCloudName:
    process.env.CLOUDINARY_CLOUD_NAME || "",

  cloudinaryApiKey:
    process.env.CLOUDINARY_API_KEY || "",

  cloudinaryApiSecret:
    process.env.CLOUDINARY_API_SECRET || "",

  maxFileSize:
    Number(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024,

  logLevel:
    process.env.LOG_LEVEL || "info",

  // ── Firebase Admin SDK (for push notifications via FCM) ───────────────────
  firebaseProjectId:           process.env.FIREBASE_PROJECT_ID || "",
  firebaseClientEmail:         process.env.FIREBASE_CLIENT_EMAIL || "",
  firebasePrivateKey:          process.env.FIREBASE_PRIVATE_KEY
    ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
    : "",
  firebaseServiceAccountPath:  process.env.FIREBASE_SERVICE_ACCOUNT_PATH || "",
};

module.exports = environment;