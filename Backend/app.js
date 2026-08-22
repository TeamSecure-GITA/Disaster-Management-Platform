const express = require("express");
const cors = require("cors");
const path = require("path");

const corsOptions = require("./config/cors");
const errorMiddleware = require("./middleware/errorMiddleware");

// Existing routes
const authRoute = require("./routes/authRoute");
const userRoute = require("./routes/userRoute");
const alertRoute = require("./routes/alertRoute");
const disasterRoute = require("./routes/disasterRoute");
const shelterRoutes = require("./routes/shelterRoutes");
const resourceRoutes = require("./routes/resourceRoutes");
const volunteerRoutes = require("./routes/volunteerRoutes");
const taskRoutes = require("./routes/taskRoutes");
const sosRoutes = require("./routes/sosRoutes");
const chatRoutes = require("./routes/chatRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const sensorRoutes = require("./routes/sensorRoutes");
const droneRoutes = require("./routes/droneRoutes");
const satelliteRoutes = require("./routes/satelliteRoutes");
const predictionRoutes = require("./routes/predictionRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");

// New routes
const familyRoutes = require("./routes/familyRoutes");
const rescueIdRoutes = require("./routes/rescueIdRoutes");
const damageAssessmentRoutes = require("./routes/damageAssessmentRoutes");
const evacuationRoutes = require("./routes/evacuationRoutes");

const app = express();

// ================================
// GLOBAL MIDDLEWARE
// ================================

app.use(cors(corsOptions));

app.use(express.json({ limit: "10mb" }));

app.use(
    express.urlencoded({
        extended: true,
        limit: "10mb",
    })
);

// ================================
// STATIC FILES
// ================================

app.use(
    "/uploads",
    express.static(path.join(__dirname, "uploads"))
);

// ================================
// HEALTH CHECK
// ================================

app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Disaster Management Platform API is running",
    });
});

app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Backend is healthy",
        timestamp: new Date().toISOString(),
    });
});

// ================================
// API ROUTES
// ================================

app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/alerts", alertRoute);
app.use("/api/disasters", disasterRoute);
app.use("/api/shelters", shelterRoutes);
app.use("/api/resources", resourceRoutes);
app.use("/api/volunteers", volunteerRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/sos", sosRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/sensors", sensorRoutes);
app.use("/api/drones", droneRoutes);
app.use("/api/satellite", satelliteRoutes);
app.use("/api/predictions", predictionRoutes);
app.use("/api/analytics", analyticsRoutes);

// New feature APIs
app.use("/api/family", familyRoutes);
app.use("/api/rescue-id", rescueIdRoutes);
app.use("/api/damage-assessment", damageAssessmentRoutes);
app.use("/api/evacuation", evacuationRoutes);

// ================================
// 404 HANDLER
// ================================

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.method} ${req.originalUrl}`,
    });
});

// ================================
// GLOBAL ERROR HANDLER
// ================================

app.use(errorMiddleware);

module.exports = app;