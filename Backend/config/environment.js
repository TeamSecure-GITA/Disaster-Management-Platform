const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "..", ".env") });

const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;

const requiredVariables = [
  "JWT_SECRET",
];

const missingVariables = requiredVariables.filter(
  (variable) => !process.env[variable]
);

if (!mongoUri) {
  missingVariables.push("MONGO_URI");
}

if (missingVariables.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missingVariables.join(", ")}`
  );
}

const weakJwtSecrets = [
  "CHANGE_ME",
  "replace-with-a-long-random-secret",
];

if (weakJwtSecrets.includes(process.env.JWT_SECRET) ||
  process.env.JWT_SECRET.startsWith("replace-with-") ||
  process.env.JWT_SECRET.length < 32) {
  throw new Error("JWT_SECRET must be a unique value of at least 32 characters.");
}

const environment = {
  nodeEnv: process.env.NODE_ENV || "development",

  port: Number(process.env.PORT) || 5000,

  mongoUri: mongoUri || process.env.MONGO_URI,

  jwtSecret: process.env.JWT_SECRET,

  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",

  frontendUrl:
    process.env.FRONTEND_URL || "http://localhost:5500",

  aiChatbotUrl:
    process.env.AI_CHATBOT_URL || "http://localhost:8000",

  satelliteApiUrl: process.env.SATELLITE_API_URL || "",

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
};

module.exports = environment;