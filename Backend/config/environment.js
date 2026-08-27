const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "..", ".env") });

const DEFAULT_MONGO_URI =
  "mongodb+srv://teamsecureproject_db_user:1ZUmjUV8dPgGD7dp@cluster0.0xz9hc6.mongodb.net/disaster_management?retryWrites=true&w=majority";

const DEFAULT_JWT_SECRET =
  "8f6b2d0e9c4a7b1d5e3f6a8c0d2b4e6f9a1c3e5d7b9f2a4c6e8d0b3f5a7c9e1";

const mongoUri =
  process.env.MONGO_URI || process.env.MONGODB_URI || DEFAULT_MONGO_URI;

const jwtSecret =
  process.env.JWT_SECRET || DEFAULT_JWT_SECRET;

const environment = {
  nodeEnv: process.env.NODE_ENV || "development",

  port: Number(process.env.PORT) || 5000,

  mongoUri: mongoUri,

  jwtSecret: jwtSecret,

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