const mongoose = require("mongoose");

const DEFAULT_LOCAL_URI = "mongodb://127.0.0.1:27017/disaster_management";

const getPreferredUri = () => {
  const envUri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (envUri) return envUri;

  if (process.env.NODE_ENV === "production") {
    throw new Error("MONGO_URI environment variable is required in production mode.");
  }

  return DEFAULT_LOCAL_URI;
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
    console.error("MongoDB connection failed:", error.message);
    throw error;
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