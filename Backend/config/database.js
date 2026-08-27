const mongoose = require("mongoose");

const ATLAS_MONGO_URI =
  "mongodb+srv://teamsecureproject_db_user:1ZUmjUV8dPgGD7dp@cluster0.0xz9hc6.mongodb.net/disaster_management?retryWrites=true&w=majority";

const getPreferredUri = () => {
  const envUri = process.env.MONGO_URI || process.env.MONGODB_URI;

  if (
    envUri &&
    !envUri.includes("127.0.0.1") &&
    !envUri.includes("localhost")
  ) {
    return envUri;
  }

  return ATLAS_MONGO_URI;
};

const connectDatabase = async () => {
  // Already connected — skip
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  const uri = getPreferredUri();

  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
    });

    console.log("MongoDB connected successfully");
    console.log(`Database: ${mongoose.connection.name}`);

    return mongoose.connection;
  } catch (error) {
    console.warn(
      `Primary connection failed (${error.message}). Retrying with MongoDB Atlas...`
    );

    // Disconnect stale handle before retrying
    try { await mongoose.disconnect(); } catch (_) {}

    try {
      await mongoose.connect(ATLAS_MONGO_URI, {
        serverSelectionTimeoutMS: 15000,
      });

      console.log("MongoDB connected successfully via Atlas fallback");
      console.log(`Database: ${mongoose.connection.name}`);
      return mongoose.connection;
    } catch (fallbackError) {
      console.error(
        "MongoDB Atlas fallback connection failed:",
        fallbackError.message
      );
      throw fallbackError;
    }
  }
};

const disconnectDatabase = async () => {
  try {
    await mongoose.disconnect();
    console.log("MongoDB disconnected");
  } catch (error) {
    console.error("MongoDB disconnection failed:", error.message);
  }
};

// MongoDB connection events
mongoose.connection.on("connected", () => {
  console.log("MongoDB connection established");
});

mongoose.connection.on("error", (error) => {
  console.error("MongoDB connection error:", error.message);
});

mongoose.connection.on("disconnected", () => {
  console.log("MongoDB connection disconnected");
});

mongoose.connection.on("reconnected", () => {
  console.log("MongoDB reconnected successfully");
});

module.exports = {
  connectDatabase,
  disconnectDatabase,
};