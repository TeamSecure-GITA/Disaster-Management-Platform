/**
 * smsRoutes.js
 *
 * Routes:
 *   POST /api/sms/dlr/twilio   – Twilio delivery receipt webhook
 *   POST /api/sms/dlr/msg91    – MSG91 delivery receipt webhook
 *   POST /api/sms/consent      – Opt-in / opt-out via API
 *   POST /api/sms/inbound      – Inbound STOP / START reply handling (MSG91 / Twilio)
 *   GET  /api/sms/receipts     – Admin: view delivery receipts (protected)
 */

"use strict";

const express = require("express");
const { protect }         = require("../middleware/authMiddleware");
const { operationsOnly }  = require("../middleware/adminMiddleware");
const {
  processDeliveryReceipt,
  handleConsentChange,
}  = require("../services/smsService");
const SmsDeliveryReceipt  = require("../models/SmsDeliveryReceipt");

const router = express.Router();

// ---------------------------------------------------------------------------
// DLR Webhooks (no auth – providers POST here; validate via shared secret)
// ---------------------------------------------------------------------------

/** Validate a simple shared-secret header for webhook security */
function _webhookGuard(req, res, next) {
  const secret = process.env.SMS_WEBHOOK_SECRET;
  if (!secret) return next();   // secret not configured → open (dev mode)

  const provided =
    req.headers["x-webhook-secret"] ||
    req.query.secret ||
    req.body?.secret;

  if (provided !== secret) {
    return res.status(403).json({ success: false, message: "Forbidden" });
  }
  next();
}

/**
 * POST /api/sms/dlr/twilio
 * Twilio posts DLR as application/x-www-form-urlencoded
 */
router.post("/dlr/twilio", _webhookGuard, async (req, res) => {
  try {
    const result = await processDeliveryReceipt("twilio", req.body);
    // Twilio expects a 200 with empty TwiML or plain text
    res.set("Content-Type", "text/xml");
    res.status(200).send("<?xml version=\"1.0\" encoding=\"UTF-8\"?><Response></Response>");
    console.log("[SMS DLR] Twilio:", result.providerMessageId, "→", result.deliveryStatus);
  } catch (err) {
    console.error("[SMS DLR] Twilio webhook error:", err.message);
    res.status(200).send("<?xml version=\"1.0\" encoding=\"UTF-8\"?><Response></Response>");
  }
});

/**
 * POST /api/sms/dlr/msg91
 * MSG91 posts DLR as JSON
 */
router.post("/dlr/msg91", _webhookGuard, async (req, res) => {
  try {
    const result = await processDeliveryReceipt("msg91", req.body);
    res.status(200).json({ success: true, ...result });
    console.log("[SMS DLR] MSG91:", result.providerMessageId, "→", result.deliveryStatus);
  } catch (err) {
    console.error("[SMS DLR] MSG91 webhook error:", err.message);
    res.status(200).json({ success: false });
  }
});

const mongoose = require("mongoose");
const Incident = require("../models/Incident");
const User = require("../models/User");

// ---------------------------------------------------------------------------
// Inbound SMS – STOP / START / DISASTER REPORT handling
// ---------------------------------------------------------------------------

async function _parseAndSaveSmsReport(rawBody, phone) {
  const text = (rawBody || "").trim();
  const parts = text.split(/\s+/);
  const keyword = parts[0]?.toUpperCase();
  if (!["REPORT", "DISASTER", "INCIDENT", "SOS", "LANDSLIDE", "FLOOD"].includes(keyword)) {
    return null;
  }

  let user = null;
  const cleanPhone = String(phone).replace(/\D/g, "").slice(-10);
  if (cleanPhone) {
    user = await User.findOne({ phone: new RegExp(cleanPhone + "$") });
  }
  if (!user) {
    user = await User.findOne({ role: "admin" });
  }

  let type = "other";
  let severity = "high";
  let remaining = parts.slice(1);

  if (["LANDSLIDE", "FLOOD"].includes(keyword)) {
    type = keyword === "LANDSLIDE" ? "slope_movement" : "flooding";
  } else if (remaining[0]) {
    const candidateType = remaining[0].toLowerCase();
    if (candidateType.includes("landslide")) {
      type = "slope_movement";
      remaining.shift();
    } else if (candidateType.includes("flood")) {
      type = "flooding";
      remaining.shift();
    } else if (candidateType.includes("road") || candidateType.includes("block")) {
      type = "blocked_road";
      remaining.shift();
    } else if (candidateType.includes("bridge")) {
      type = "bridge_damage";
      remaining.shift();
    } else if (candidateType.includes("crack")) {
      type = "landslide_crack";
      remaining.shift();
    }
  }

  if (remaining[0] && ["low", "medium", "high", "critical"].includes(remaining[0].toLowerCase())) {
    severity = remaining[0].toLowerCase();
    remaining.shift();
  }

  let coordinates = [91.7362, 26.1445];
  let address = "";
  if (remaining[0] && remaining[0].includes(",")) {
    const [latStr, lngStr] = remaining[0].split(",");
    const lat = parseFloat(latStr);
    const lng = parseFloat(lngStr);
    if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      coordinates = [lng, lat];
      remaining.shift();
    }
  }

  const description = remaining.join(" ") || `Emergency incident reported via SMS from ${phone}`;
  if (!address) address = `Reported via SMS (${phone})`;

  const incident = await Incident.create({
    reportedBy: user?._id || new mongoose.Types.ObjectId(),
    incidentType: type,
    severity,
    description: `[SMS Inbound Fallback]: ${description}`,
    location: { type: "Point", coordinates },
    locationMeta: { address, district: "", state: "" },
    witnessCount: 1,
    offlineId: `sms-${cleanPhone || "anon"}-${Date.now()}`,
    syncedAt: new Date(),
  });

  return incident;
}

/**
 * POST /api/sms/inbound
 * Handles STOP (opt-out), START (opt-in), and SMS fallback disaster incident reports.
 * Twilio and MSG91 both POST inbound messages to a webhook URL.
 */
router.post("/inbound", _webhookGuard, async (req, res) => {
  try {
    const rawBody = (req.body.Body || req.body.message || "").trim();
    const bodyUpper = rawBody.toUpperCase();
    const phone = req.body.From || req.body.mobile || req.body.from;

    if (!phone) {
      return res.status(200).send("<?xml version=\"1.0\" encoding=\"UTF-8\"?><Response></Response>");
    }

    const ip = req.ip || null;

    if (bodyUpper === "STOP" || bodyUpper === "UNSUBSCRIBE" || bodyUpper === "OPT-OUT") {
      await handleConsentChange(phone, false, "sms_reply_start", ip);
      console.log(`[SMS Inbound] STOP from ${phone}`);
      res.set("Content-Type", "text/xml");
      return res.status(200).send("<?xml version=\"1.0\" encoding=\"UTF-8\"?><Response><Message>You have opted out of DMP alerts.</Message></Response>");
    } else if (bodyUpper === "START" || bodyUpper === "SUBSCRIBE" || bodyUpper === "OPT-IN" || bodyUpper === "YES") {
      await handleConsentChange(phone, true, "sms_reply_start", ip);
      console.log(`[SMS Inbound] START from ${phone}`);
      res.set("Content-Type", "text/xml");
      return res.status(200).send("<?xml version=\"1.0\" encoding=\"UTF-8\"?><Response><Message>You are subscribed to DMP emergency alerts.</Message></Response>");
    }

    // Check for incident reporting SMS fallback
    const incident = await _parseAndSaveSmsReport(rawBody, phone);
    if (incident) {
      console.log(`[SMS Inbound] Disaster report logged from ${phone}: ${incident._id}`);
      res.set("Content-Type", "text/xml");
      return res.status(200).send(
        `<?xml version="1.0" encoding="UTF-8"?><Response><Message>DMP Alert: Report received &amp; logged (ID: ${incident._id.toString().slice(-6)}). Emergency teams notified.</Message></Response>`
      );
    }

    // Default reply
    res.set("Content-Type", "text/xml");
    res.status(200).send("<?xml version=\"1.0\" encoding=\"UTF-8\"?><Response></Response>");
  } catch (err) {
    console.error("[SMS Inbound] Error:", err.message);
    res.status(200).send("<?xml version=\"1.0\" encoding=\"UTF-8\"?><Response></Response>");
  }
});

// ---------------------------------------------------------------------------
// Consent management API (for frontend / admin panel)
// ---------------------------------------------------------------------------

/**
 * POST /api/sms/consent
 * Body: { phone, consented: true|false }
 * Public – users can self-opt-out; no auth required.
 */
router.post("/consent", async (req, res, next) => {
  try {
    const { phone, consented } = req.body;

    if (!phone || consented === undefined) {
      return res.status(400).json({
        success: false,
        message: "phone and consented fields are required",
      });
    }

    const result = await handleConsentChange(
      phone,
      Boolean(consented),
      "api",
      req.ip
    );

    res.status(200).json({
      success: true,
      message: consented
        ? "You have been subscribed to SMS alerts."
        : "You have been unsubscribed from SMS alerts.",
      data: result,
    });
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// Admin: delivery receipts
// ---------------------------------------------------------------------------

/**
 * GET /api/sms/receipts?phone=&status=&limit=50
 */
router.get("/receipts", protect, operationsOnly, async (req, res, next) => {
  try {
    const { phone, status, alertId, limit = 50, page = 1 } = req.query;
    const filter = {};
    if (phone)   filter.phone = phone;
    if (status)  filter.deliveryStatus = status;
    if (alertId) filter.alertId = alertId;

    const receipts = await SmsDeliveryReceipt.find(filter)
      .sort({ createdAt: -1 })
      .limit(Math.min(Number(limit), 200))
      .skip((Number(page) - 1) * Math.min(Number(limit), 200))
      .lean();

    const total = await SmsDeliveryReceipt.countDocuments(filter);

    // Summary stats
    const stats = await SmsDeliveryReceipt.aggregate([
      { $match: filter },
      { $group: { _id: "$deliveryStatus", count: { $sum: 1 } } },
    ]);

    res.status(200).json({
      success: true,
      total,
      data: receipts,
      stats: Object.fromEntries(stats.map((s) => [s._id, s.count])),
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
