const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");
const fs = require("fs");
const axios = require("axios");
const mongoose = require("mongoose");
const mongoSanitize = require("express-mongo-sanitize");
const rateLimit = require("express-rate-limit");
const environment = require("./config/environment");

const corsOptions = require("./config/cors");
const { errorHandler } = require("./middleware/errorMiddleware");
const requestLogger = require("./middleware/requestLogger");
const { generalLimiter } = require("./middleware/rateLimitMiddleware");
const { protect } = require("./middleware/authMiddleware");
const { firewallMiddleware } = require("./middleware/firewallMiddleware");

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
const syncRoutes = require("./routes/syncRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

// New routes
const familyRoutes = require("./routes/familyRoutes");
const rescueIdRoutes = require("./routes/rescueIdRoutes");
const damageAssessmentRoutes = require("./routes/damageAssessmentRoutes");
const evacuationRoutes = require("./routes/evacuationRoutes");
const incidentRoutes = require("./routes/incidentRoutes");
const newsRoutes = require("./routes/newsRoutes");
const nerLandslideRoutes = require("./routes/nerLandslideRoutes");
const maintenanceRoutes = require("./routes/maintenanceRoutes");
const firewallRoutes = require("./routes/firewallRoutes");
const meshRoutes = require("./routes/meshRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const wifiCsiRoutes = require("./routes/wifiCsiRoutes");
const pqcLedgerRoutes = require("./routes/pqcLedgerRoutes");
const bleSpitRoutes = require("./routes/bleSpitRoutes");
const nfcTriageRoutes = require("./routes/nfcTriageRoutes");
const riskRoutes = require("./routes/riskRoutes");
const responseRoutes = require("./routes/responseRoutes");
const aiRoute = require("./routes/aiRoute");

const app = express();

app.disable("x-powered-by");
app.set("trust proxy", process.env.TRUST_PROXY === "true" ? 1 : false);

// ================================
// GLOBAL MIDDLEWARE
// ================================

app.use(cors(corsOptions));
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
}));
app.use(firewallMiddleware);
app.use(requestLogger);
app.use(generalLimiter);

app.use(express.json({ limit: "10mb" }));

app.use(
    express.urlencoded({
        extended: true,
        limit: "10mb",
    })
);

// Sanitise user-supplied data to prevent MongoDB operator injection attacks (Express 5 compatible)
app.use((req, res, next) => {
    if (req.body) mongoSanitize.sanitize(req.body);
    if (req.params) mongoSanitize.sanitize(req.params);
    next();
});

// Normalize repeated slashes in URLs (e.g. //api/sos -> /api/sos)
app.use((req, res, next) => {
    if (req.url && req.url.includes("//")) {
        req.url = req.url.replace(/\/+/g, "/");
    }
    next();
});

// ================================
// STATIC & FRONTEND SPA SERVING
// ================================

const frontendDistPath = path.resolve(__dirname, "../frontend/dist");
const hasFrontendBuild = fs.existsSync(frontendDistPath);

app.use(
    "/uploads",
    protect,
    express.static(path.join(__dirname, environment.uploadDirectory))
);

if (hasFrontendBuild) {
    app.use(express.static(frontendDistPath, { index: false }));
}

// ================================
// HEALTH CHECK
// ================================

app.get("/", (req, res) => {
    if (hasFrontendBuild && req.headers.accept && req.headers.accept.includes("text/html")) {
        return res.sendFile(path.join(frontendDistPath, "index.html"));
    }
    res.status(200).json({
        message: "Disaster Management API is running",
    });
});

app.get("/api/health", (req, res) => {
    const databaseReady = mongoose.connection.readyState === 1;
    res.status(200).json({
        success: true,
        message: "Backend is healthy",
        database: databaseReady ? "connected" : "disconnected",
        timestamp: new Date().toISOString(),
    });
});

app.get("/api/ready", (req, res) => {
    const databaseReady = mongoose.connection.readyState === 1;
    res.status(databaseReady ? 200 : 503).json({
        success: databaseReady,
        message: databaseReady ? "Backend is ready" : "Database is unavailable",
        database: databaseReady ? "connected" : "disconnected",
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
app.use("/api/incidents", incidentRoutes);
app.use("/api/sync", syncRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/news", newsRoutes);
app.use("/api/ner", nerLandslideRoutes);
app.use("/api/maintenance", maintenanceRoutes);
app.use("/api/firewall", firewallRoutes);
app.use("/api/mesh", meshRoutes);
app.use("/api/reviews", reviewRoutes);

// World-First Deep-Tech APIs
app.use("/api/wifi-csi", wifiCsiRoutes);
app.use("/api/pqc-ledger", pqcLedgerRoutes);
app.use("/api/ble-spit", bleSpitRoutes);
app.use("/api/nfc-triage", nfcTriageRoutes);

// Working Architecture Core: Risk Engine & Unified Response System
app.use("/api/risk", riskRoutes);
app.use("/api/response", responseRoutes);

// Unified AI & ML Bridge
app.use("/api/ai", aiRoute);

// ================================
// AI / ML FASTAPI REVERSE PROXY
// ================================
app.use("/ml-api", async (req, res) => {
    const targetBase = (environment.aiChatbotUrl || "http://localhost:8000").replace(/\/$/, "");
    const targetPath = req.originalUrl.replace(/^\/ml-api/, "") || "/";
    const targetUrl = `${targetBase}${targetPath}`;

    try {
        const response = await axios({
            method: req.method,
            url: targetUrl,
            data: req.method !== "GET" && req.method !== "HEAD" ? req.body : undefined,
            params: req.query,
            headers: {
                "Content-Type": req.headers["content-type"] || "application/json",
                "Accept": req.headers["accept"] || "application/json",
            },
            timeout: 30000,
            validateStatus: () => true,
        });

        return res.status(response.status).json(response.data);
    } catch (err) {
        return res.status(503).json({
            success: false,
            message: "AI / ML Engine is currently initializing or unreachable",
            error: err.message,
            targetUrl,
        });
    }
});

// ================================
// SPA CLIENT-SIDE ROUTING FALLBACK
// ================================
if (hasFrontendBuild) {
    app.use((req, res, next) => {
        if (req.method !== "GET" && req.method !== "HEAD") {
            return next();
        }
        if (
            req.path.startsWith("/api") ||
            req.path.startsWith("/ml-api") ||
            req.path.startsWith("/uploads")
        ) {
            return next();
        }
        res.sendFile(path.join(frontendDistPath, "index.html"));
    });
}

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

app.use(errorHandler);

module.exports = app;