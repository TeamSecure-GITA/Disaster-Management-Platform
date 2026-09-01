const {
    createIncident,
    getIncidents,
    getMyIncidents,
    getIncidentById,
    getNearbyIncidents,
    getIncidentHeatmapData,
    updateIncidentStatus,
    deleteIncidentMedia,
} = require("../services/incidentService");

// ─── POST /api/incidents ───────────────────────────────────────────────────────
/**
 * Submit a new geo-tagged field incident report.
 * Accepts multipart/form-data with up to 5 media files (images + short videos).
 *
 * Body fields:
 *   incidentType  {string}  required
 *   severity      {string}  low|medium|high|critical
 *   description   {string}  required
 *   location      {string}  JSON: { latitude, longitude } or GeoJSON Point
 *   locationMeta  {string}  JSON: { address, district, state, altitude, slopeAngle }
 *   witnessCount  {number}
 *   isRoadBlocked {boolean}
 *   affectedVillages {string} comma-separated or JSON array
 *   offlineId     {string}  client UUID for offline-sync deduplication
 */
const submitIncident = async (req, res, next) => {
    try {
        const { incident, isDuplicate } = await createIncident(
            req.body,
            req.files || [],
            req.user._id
        );

        if (isDuplicate) {
            return res.status(200).json({
                success: true,
                message: "Incident already recorded (offline sync deduplicated).",
                data: incident,
                isDuplicate: true,
            });
        }

        res.status(201).json({
            success: true,
            message: "Field incident report submitted successfully.",
            data: incident,
        });
    } catch (error) {
        next(error);
    }
};

// ─── GET /api/incidents ────────────────────────────────────────────────────────
/**
 * Retrieve all incidents (admin / operator only).
 * Query params: incidentType, severity, status, district, state, from, to, page, limit
 */
const listIncidents = async (req, res, next) => {
    try {
        const result = await getIncidents(req.query);

        res.status(200).json({
            success: true,
            data: result.incidents,
            pagination: {
                total: result.total,
                page: result.page,
                limit: result.limit,
                pages: result.pages,
            },
        });
    } catch (error) {
        next(error);
    }
};

// ─── GET /api/incidents/mine ───────────────────────────────────────────────────
/**
 * Retrieve the authenticated user's own incident reports.
 * Query params: status, page, limit
 */
const listMyIncidents = async (req, res, next) => {
    try {
        const result = await getMyIncidents(req.user._id, req.query);

        res.status(200).json({
            success: true,
            data: result.incidents,
            pagination: {
                total: result.total,
                page: result.page,
                limit: result.limit,
            },
        });
    } catch (error) {
        next(error);
    }
};

// ─── GET /api/incidents/nearby ─────────────────────────────────────────────────
/**
 * Find active incidents near a GPS coordinate.
 * Query params: lat {number}, lng {number}, radius {number} (km, default 25)
 *
 * Returns incidents sorted nearest-first (MongoDB $near).
 */
const listNearbyIncidents = async (req, res, next) => {
    try {
        const { lat, lng, radius } = req.query;

        if (!lat || !lng) {
            return res.status(400).json({
                success: false,
                message: "Query parameters 'lat' and 'lng' are required.",
            });
        }

        const parsedLat = Number(lat);
        const parsedLng = Number(lng);

        if (
            !Number.isFinite(parsedLat) ||
            !Number.isFinite(parsedLng) ||
            parsedLat < -90 ||
            parsedLat > 90 ||
            parsedLng < -180 ||
            parsedLng > 180
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid latitude or longitude values.",
            });
        }

        const incidents = await getNearbyIncidents(parsedLng, parsedLat, radius);

        res.status(200).json({
            success: true,
            count: incidents.length,
            data: incidents,
        });
    } catch (error) {
        next(error);
    }
};

// ─── GET /api/incidents/heatmap ────────────────────────────────────────────────
/**
 * Return a GeoJSON FeatureCollection for heatmap rendering.
 * Query params: incidentType, severity, from, to
 *
 * Compatible with Leaflet.heat and Mapbox GL heatmap layer.
 */
const getHeatmapData = async (req, res, next) => {
    try {
        const featureCollection = await getIncidentHeatmapData(req.query);

        res.status(200).json({
            success: true,
            data: featureCollection,
        });
    } catch (error) {
        next(error);
    }
};

// ─── GET /api/incidents/:id ────────────────────────────────────────────────────
/**
 * Retrieve a single incident by ID.
 * Accessible by the reporter (owner) or any admin/operator.
 */
const fetchIncidentById = async (req, res, next) => {
    try {
        const incident = await getIncidentById(req.params.id);

        if (!incident) {
            return res.status(404).json({
                success: false,
                message: "Incident report not found.",
            });
        }

        const isOwner =
            incident.reportedBy?._id?.toString() === req.user._id.toString();
        const isOperator = ["admin", "operator"].includes(req.user.role);

        if (!isOwner && !isOperator) {
            return res.status(403).json({
                success: false,
                message: "You do not have permission to view this incident.",
            });
        }

        res.status(200).json({
            success: true,
            data: incident,
        });
    } catch (error) {
        next(error);
    }
};

// ─── PATCH /api/incidents/:id/status ──────────────────────────────────────────
/**
 * Update an incident's workflow status (admin / operator only).
 * Body: { status, remarks?, assignedTo? }
 *
 * Allowed transitions: pending → verified | escalated | rejected
 *                      verified → escalated | resolved
 *                      escalated → resolved
 */
const patchIncidentStatus = async (req, res, next) => {
    try {
        const { status, remarks, assignedTo } = req.body;

        const allowedStatuses = [
            "pending",
            "verified",
            "escalated",
            "resolved",
            "rejected",
        ];

        if (!status || !allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Status must be one of: ${allowedStatuses.join(", ")}.`,
            });
        }

        const incident = await updateIncidentStatus(
            req.params.id,
            { status, remarks, assignedTo },
            req.user._id
        );

        if (!incident) {
            return res.status(404).json({
                success: false,
                message: "Incident report not found.",
            });
        }

        // Clean up media when an incident is rejected
        if (status === "rejected") {
            await deleteIncidentMedia(incident);
        }

        res.status(200).json({
            success: true,
            message: `Incident status updated to '${status}'.`,
            data: incident,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    submitIncident,
    listIncidents,
    listMyIncidents,
    listNearbyIncidents,
    getHeatmapData,
    fetchIncidentById,
    patchIncidentStatus,
};
