const Incident = require("../models/Incident");
const {
    uploadFile,
    deleteFile,
    removeTemporaryFile,
} = require("./fileStorageService");

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Upload an array of multer files to the configured storage provider.
 * Returns the uploaded media array.  Cleans up temp files on failure.
 */
const uploadMediaFiles = async (files = [], folder) => {
    const uploaded = [];

    for (const file of files) {
        try {
            const result = await uploadFile(file, { folder });
            uploaded.push({
                url: result.url,
                filename: result.filename,
                provider: result.provider,
                publicId: result.publicId,
                resourceType: result.resourceType || "image",
                capturedAt: null, // EXIF extraction can be layered here later
            });
        } catch (err) {
            // Clean up already-uploaded files before re-throwing
            await Promise.all(uploaded.map(deleteFile));
            await Promise.all(files.map((f) => removeTemporaryFile(f.path)));
            throw err;
        }
    }

    return uploaded;
};

/**
 * Parse a raw JSON string location body field into { latitude, longitude }.
 * Accepts both plain objects and stringified JSON.
 */
const parseLocation = (rawLocation) => {
    if (!rawLocation) return null;

    if (typeof rawLocation === "string") {
        try {
            return JSON.parse(rawLocation);
        } catch {
            return null;
        }
    }

    return rawLocation;
};

/**
 * Build a GeoJSON Point from { latitude, longitude } or { coordinates }.
 */
const toGeoJsonPoint = (loc) => {
    if (!loc) return null;

    // Already GeoJSON
    if (loc.type === "Point" && Array.isArray(loc.coordinates)) {
        return loc;
    }

    // Plain lat/lng object
    const lat = Number(loc.latitude ?? loc.lat);
    const lng = Number(loc.longitude ?? loc.lng ?? loc.lon);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;

    return { type: "Point", coordinates: [lng, lat] };
};

// ─── Service functions ────────────────────────────────────────────────────────

/**
 * Create a new field incident report.
 * Handles media upload, offlineId deduplication, and location normalisation.
 */
const createIncident = async (bodyData, files = [], userId) => {
    // --- offlineId deduplication ---
    if (bodyData.offlineId) {
        const existing = await Incident.findOne({
            offlineId: bodyData.offlineId,
        });
        if (existing) {
            return { incident: existing, isDuplicate: true };
        }
    }

    // --- Upload media ---
    const media = await uploadMediaFiles(
        files,
        "disaster-management/incidents"
    );

    // --- Normalise location ---
    const rawLocation = parseLocation(bodyData.location);
    const geoLocation = toGeoJsonPoint(rawLocation);

    if (!geoLocation) {
        const err = new Error(
            "A valid location is required. Provide { latitude, longitude } or a GeoJSON Point."
        );
        err.statusCode = 400;
        throw err;
    }

    // --- Parse locationMeta if sent as JSON string ---
    let locationMeta = bodyData.locationMeta || {};
    if (typeof locationMeta === "string") {
        try {
            locationMeta = JSON.parse(locationMeta);
        } catch {
            locationMeta = {};
        }
    }

    // --- Parse affectedVillages array (may arrive as comma-separated string) ---
    let affectedVillages = bodyData.affectedVillages || [];
    if (typeof affectedVillages === "string") {
        affectedVillages = affectedVillages
            .split(",")
            .map((v) => v.trim())
            .filter(Boolean);
    }

    const incident = await Incident.create({
        reportedBy: userId,
        incidentType: bodyData.incidentType,
        severity: bodyData.severity || "medium",
        description: bodyData.description,
        location: geoLocation,
        locationMeta,
        witnessCount: Number(bodyData.witnessCount) || 1,
        isRoadBlocked: bodyData.isRoadBlocked === "true" || bodyData.isRoadBlocked === true,
        affectedVillages,
        media,
        offlineId: bodyData.offlineId || null,
        syncedAt: new Date(),
    });

    return { incident, isDuplicate: false };
};

/**
 * Retrieve all incidents with optional filtering and pagination.
 */
const getIncidents = async (filters = {}) => {
    const {
        incidentType,
        severity,
        status,
        district,
        state,
        from,
        to,
        page = 1,
        limit = 50,
    } = filters;

    const safePage = Math.max(Number(page) || 1, 1);
    const safeLimit = Math.min(Math.max(Number(limit) || 50, 1), 100);
    const query = {};

    if (incidentType) query.incidentType = incidentType;
    if (severity) query.severity = severity;
    if (status) query.status = status;
    if (district) query["locationMeta.district"] = district;
    if (state) query["locationMeta.state"] = state;

    if (from || to) {
        query.createdAt = {};
        if (from) query.createdAt.$gte = new Date(from);
        if (to) query.createdAt.$lte = new Date(to);
    }

    const [incidents, total] = await Promise.all([
        Incident.find(query)
            .populate("reportedBy", "name email phone")
            .populate("verifiedBy", "name email")
            .populate("assignedTo", "name email")
            .sort({ riskScore: -1, createdAt: -1 })
            .skip((safePage - 1) * safeLimit)
            .limit(safeLimit),
        Incident.countDocuments(query),
    ]);

    return {
        incidents,
        total,
        page: safePage,
        limit: safeLimit,
        pages: Math.ceil(total / safeLimit),
    };
};

/**
 * Retrieve incidents reported by a specific user.
 */
const getMyIncidents = async (userId, filters = {}) => {
    const { status, page = 1, limit = 20 } = filters;
    const safePage = Math.max(Number(page) || 1, 1);
    const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 50);
    const query = { reportedBy: userId };
    if (status) query.status = status;

    const [incidents, total] = await Promise.all([
        Incident.find(query)
            .sort({ createdAt: -1 })
            .skip((safePage - 1) * safeLimit)
            .limit(safeLimit),
        Incident.countDocuments(query),
    ]);

    return { incidents, total, page: safePage, limit: safeLimit };
};

/**
 * Retrieve a single incident by ID.
 */
const getIncidentById = async (id) => {
    return Incident.findById(id)
        .populate("reportedBy", "name email phone")
        .populate("verifiedBy", "name email")
        .populate("assignedTo", "name email");
};

/**
 * Spatial query — find incidents within `radiusKm` of a point.
 * Returns results sorted by proximity (nearest first).
 */
const getNearbyIncidents = async (lng, lat, radiusKm = 25) => {
    const radiusMetres = Number(radiusKm) * 1000;

    return Incident.find({
        location: {
            $near: {
                $geometry: { type: "Point", coordinates: [Number(lng), Number(lat)] },
                $maxDistance: radiusMetres,
            },
        },
        status: { $ne: "resolved" },
    })
        .limit(200)
        .populate("reportedBy", "name phone");
};

/**
 * Build a GeoJSON FeatureCollection for heatmap rendering (Leaflet / Mapbox).
 * Each feature carries severity, riskScore, and incidentType as properties.
 */
const getIncidentHeatmapData = async (filters = {}) => {
    const { from, to, incidentType, severity } = filters;
    const match = { status: { $ne: "rejected" } };

    if (incidentType) match.incidentType = incidentType;
    if (severity) match.severity = severity;
    if (from || to) {
        match.createdAt = {};
        if (from) match.createdAt.$gte = new Date(from);
        if (to) match.createdAt.$lte = new Date(to);
    }

    const incidents = await Incident.find(match).select(
        "location incidentType severity riskScore status createdAt locationMeta.district"
    );

    const features = incidents.map((inc) => ({
        type: "Feature",
        geometry: inc.location,
        properties: {
            id: inc._id,
            incidentType: inc.incidentType,
            severity: inc.severity,
            riskScore: inc.riskScore,
            status: inc.status,
            district: inc.locationMeta?.district || "",
            reportedAt: inc.createdAt,
        },
    }));

    return {
        type: "FeatureCollection",
        features,
        meta: {
            total: features.length,
            generatedAt: new Date().toISOString(),
        },
    };
};

/**
 * Update incident status (verify / escalate / resolve / reject).
 * Sets verifiedBy and verifiedAt when status becomes "verified".
 */
const updateIncidentStatus = async (id, { status, remarks, assignedTo }, operatorId) => {
    const update = { status };
    if (remarks !== undefined) update.remarks = remarks;
    if (assignedTo) update.assignedTo = assignedTo;

    if (status === "verified") {
        update.verifiedBy = operatorId;
        update.verifiedAt = new Date();
    }

    const incident = await Incident.findByIdAndUpdate(id, update, {
        new: true,
        runValidators: true,
    })
        .populate("reportedBy", "name email phone")
        .populate("verifiedBy", "name email")
        .populate("assignedTo", "name email");

    return incident;
};

/**
 * Delete all stored media files for a rejected/deleted incident.
 */
const deleteIncidentMedia = async (incident) => {
    if (!incident?.media?.length) return;
    await Promise.all(incident.media.map(deleteFile));
};

module.exports = {
    createIncident,
    getIncidents,
    getMyIncidents,
    getIncidentById,
    getNearbyIncidents,
    getIncidentHeatmapData,
    updateIncidentStatus,
    deleteIncidentMedia,
};
