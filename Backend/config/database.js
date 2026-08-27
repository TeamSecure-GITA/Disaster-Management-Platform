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

let isConnecting = false;

const connectDatabase = async () => {
  if (mongoose.connection.readyState === 1 || isConnecting) {
    return mongoose.connection;
  }

  isConnecting = true;
  const uri = getPreferredUri();

  try {
    console.log("Connecting to MongoDB Atlas...");
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
    });

    console.log("MongoDB connected successfully");
    console.log(`Database: ${mongoose.connection.name}`);
    isConnecting = false;
    return mongoose.connection;
  } catch (error) {
    isConnecting = false;
    console.warn(
      `MongoDB connection issue (${error.message}). Retrying in 5 seconds...`
    );

    // Auto-retry in background every 5 seconds
    setTimeout(() => {
      connectDatabase().catch(() => {});
    }, 5000);

    return null;
  }
};

const disconnectDatabase = async () => {
  try {
    await mongoose.disconnect();
    console.log("MongoDB disconnected");
  } catch (error) {
    console.error("MongoDB disconnection failed");
    console.error(error.message);
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

module.exports = {
  connectDatabase,
  disconnectDatabase,
};