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

// ---------------------------------------------------------------------------
// Inbound SMS – STOP / START handling
// ---------------------------------------------------------------------------

/**
 * POST /api/sms/inbound
 * Handles STOP (opt-out) and START (opt-in) replies from users.
 * Twilio and MSG91 both POST inbound messages to a webhook URL.
 */
router.post("/inbound", _webhookGuard, async (req, res) => {
  try {
    // Twilio: Body / From fields; MSG91: message / mobile fields
    const body  = (req.body.Body || req.body.message || "").trim().toUpperCase();
    const phone = req.body.From || req.body.mobile || req.body.from;

    if (!phone) {
      return res.status(200).send("<?xml version=\"1.0\" encoding=\"UTF-8\"?><Response></Response>");
    }

    const ip = req.ip || null;

    if (body === "STOP" || body === "UNSUBSCRIBE" || body === "OPT-OUT") {
      await handleConsentChange(phone, false, "sms_reply_start", ip);
      console.log(`[SMS Inbound] STOP from ${phone}`);
    } else if (body === "START" || body === "SUBSCRIBE" || body === "OPT-IN" || body === "YES") {
      await handleConsentChange(phone, true, "sms_reply_start", ip);
      console.log(`[SMS Inbound] START from ${phone}`);
    }

    // Return empty TwiML (Twilio expects this)
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
