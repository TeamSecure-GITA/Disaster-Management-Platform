const mongoose = require("mongoose");
const environment = require("./environment");

const connectDatabase = async () => {
  try {
    mongoose.set("strictQuery", true);

    await mongoose.connect(environment.mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log("MongoDB connected successfully");
    console.log(`Database: ${mongoose.connection.name}`);

    return mongoose.connection;
  } catch (error) {
    console.error("MongoDB connection failed");
    console.error(error.message);

    throw error;
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