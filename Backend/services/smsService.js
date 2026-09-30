/**
 * smsService.js  –  Production SMS gateway for NER Disaster Management Platform
 *
 * Provider priority chain (fail-over in order):
 *   1. MSG91  – Primary for India (DLT-native, OTP + transactional)
 *   2. Twilio – Fallback (global, reliable, strong DLR support)
 *   3. Simulation log – Final fallback when neither is configured
 *
 * India DLT compliance (TRAI, 2023):
 *   - All SMS must carry a DLT-registered Template ID (PE_ID + Template ID).
 *   - Sender header must be the 6-char DLT-registered sender ID (e.g. NERDMP).
 *   - Only consented recipients may be messaged (scrubbed against TRAI DND list).
 *   - Delivery receipts (DLR) must be stored.
 *
 * Environment variables required:
 *   MSG91_AUTH_KEY       – MSG91 auth key
 *   MSG91_SENDER_ID      – 6-char DLT sender ID (e.g. NERDMP)
 *   MSG91_DLT_PE_ID      – Principal Entity (PE) ID from DLT portal
 *   MSG91_ROUTE          – Route number: 4 = transactional, 1 = promotional
 *   TWILIO_ACCOUNT_SID   – Twilio Account SID
 *   TWILIO_AUTH_TOKEN    – Twilio Auth Token
 *   TWILIO_FROM_NUMBER   – Twilio sending number (E.164 format, e.g. +12025551234)
 *   SMS_WEBHOOK_BASE_URL – Public URL for DLR callbacks (e.g. https://api.nerdmp.in)
 *
 * DLT Template IDs (per-template per-language, registered with operator):
 *   DLT_TMPL_LANDSLIDE_CRITICAL_EN, DLT_TMPL_LANDSLIDE_CRITICAL_HI, etc.
 *   (See Backend/utils/smsTemplates.js for full list)
 */

"use strict";

const axios        = require("axios");
const SmsConsent   = require("../models/SmsConsent");
const SmsDeliveryReceipt = require("../models/SmsDeliveryReceipt");

// ---------------------------------------------------------------------------
// Provider config (read at call time to pick up hot-reloaded env)
// ---------------------------------------------------------------------------

function _msg91Config() {
  return {
    authKey:  process.env.MSG91_AUTH_KEY,
    senderId: process.env.MSG91_SENDER_ID || "NERDMP",
    peId:     process.env.MSG91_DLT_PE_ID,
    route:    process.env.MSG91_ROUTE || "4",   // 4 = transactional
  };
}

function _twilioConfig() {
  return {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken:  process.env.TWILIO_AUTH_TOKEN,
    from:       process.env.TWILIO_FROM_NUMBER,
  };
}

function _isMsg91Configured()  { const c = _msg91Config();  return !!(c.authKey && c.senderId); }
function _isTwilioConfigured() { const c = _twilioConfig(); return !!(c.accountSid && c.authToken && c.from); }

// ---------------------------------------------------------------------------
// Phone number normalisation → E.164 (India default +91)
// ---------------------------------------------------------------------------

function _normalisePhone(phone) {
  if (!phone) return null;
  const raw = String(phone).replace(/[\s\-().]/g, "");
  if (raw.startsWith("+")) return raw;
  // Indian 10-digit mobile number
  if (/^[6-9]\d{9}$/.test(raw)) return `+91${raw}`;
  // Already has country code without +
  if (/^91[6-9]\d{9}$/.test(raw)) return `+${raw}`;
  return raw;   // return as-is for international numbers
}

// ---------------------------------------------------------------------------
// Consent check
// ---------------------------------------------------------------------------

async function _checkConsent(phone) {
  try {
    const record = await SmsConsent.findOne({ phone }).lean();
    if (!record) return true;   // no record = not explicitly opted out
    return record.consented === true;
  } catch (_err) {
    return true;   // on DB error, allow send (fail-open for emergency alerts)
  }
}

// ---------------------------------------------------------------------------
// Persist delivery receipt (called by send functions with provider message ID)
// ---------------------------------------------------------------------------

async function _saveInitialReceipt({ providerMessageId, provider, phone, dltTemplateId, notificationId, alertId }) {
  try {
    await SmsDeliveryReceipt.create({
      providerMessageId,
      provider,
      phone,
      deliveryStatus: "queued",
      dltTemplateId:  dltTemplateId || null,
      notificationId: notificationId || null,
      alertId:        alertId || null,
    });
  } catch (err) {
    console.warn("[SMS] Could not save initial delivery receipt:", err.message);
  }
}

// ---------------------------------------------------------------------------
// MSG91 send
// ---------------------------------------------------------------------------

async function _sendViaMSG91(phone, message, dltTemplateId, opts = {}) {
  const cfg = _msg91Config();

  const webhookBase = process.env.SMS_WEBHOOK_BASE_URL || "";
  const dlrCallback = webhookBase ? `${webhookBase}/api/sms/dlr/msg91` : undefined;

  const payload = {
    sender:  cfg.senderId,
    route:   cfg.route,
    country: "91",
    dlt_te_id: dltTemplateId,
    sms: [
      {
        message,
        to: [phone.replace("+91", "").replace("+", "")],
      },
    ],
    ...(dlrCallback ? { dlr: 1, dlr_url: dlrCallback } : {}),
  };

  const response = await axios.post(
    "https://api.msg91.com/api/v5/flow/",
    payload,
    {
      headers: {
        "authkey":     cfg.authKey,
        "content-type": "application/json",
      },
      timeout: 10000,
    }
  );

  const data = response.data;
  const msgId = data?.request_id || data?.message_id || `msg91-${Date.now()}`;

  await _saveInitialReceipt({
    providerMessageId: msgId,
    provider:          "msg91",
    phone,
    dltTemplateId,
    ...opts,
  });

  return {
    success:           true,
    provider:          "msg91",
    providerMessageId: msgId,
    raw:               data,
  };
}

// ---------------------------------------------------------------------------
// Twilio send
// ---------------------------------------------------------------------------

async function _sendViaTwilio(phone, message, dltTemplateId, opts = {}) {
  const cfg = _twilioConfig();

  const webhookBase = process.env.SMS_WEBHOOK_BASE_URL || "";
  const dlrCallback = webhookBase ? `${webhookBase}/api/sms/dlr/twilio` : undefined;

  const params = new URLSearchParams({
    To:   phone,
    From: cfg.from,
    Body: message,
    ...(dlrCallback ? { StatusCallback: dlrCallback } : {}),
  });

  const response = await axios.post(
    `https://api.twilio.com/2010-04-01/Accounts/${cfg.accountSid}/Messages.json`,
    params.toString(),
    {
      auth: { username: cfg.accountSid, password: cfg.authToken },
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      timeout: 10000,
    }
  );

  const data = response.data;
  const msgSid = data?.sid || `twilio-${Date.now()}`;

  await _saveInitialReceipt({
    providerMessageId: msgSid,
    provider:          "twilio",
    phone,
    dltTemplateId,
    ...opts,
  });

  return {
    success:           true,
    provider:          "twilio",
    providerMessageId: msgSid,
    raw:               data,
  };
}

// ---------------------------------------------------------------------------
// Public: sendSMS – main entry point (drop-in replacement for old stub)
// ---------------------------------------------------------------------------

/**
 * Send an SMS to a phone number.
 *
 * @param {string} phoneNumber       Raw phone number (any format)
 * @param {string} message           SMS body (DLT-compliant)
 * @param {Object} [options]
 * @param {string} [options.dltTemplateId]   DLT Template ID (required for India)
 * @param {string} [options.notificationId]  Notification._id for DLR tracking
 * @param {string} [options.alertId]         Alert._id for DLR tracking
 * @param {boolean} [options.bypassConsent]  Skip consent check (emergency override)
 * @returns {Promise<Object>}
 */
async function sendSMS(phoneNumber, message, options = {}) {
  // ── 1. Normalise phone ────────────────────────────────────────────────────
  const phone = _normalisePhone(phoneNumber);
  if (!phone) {
    return { success: false, skipped: true, message: "No phone number provided" };
  }

  // ── 2. Consent check ──────────────────────────────────────────────────────
  if (!options.bypassConsent) {
    const consented = await _checkConsent(phone);
    if (!consented) {
      console.log(`[SMS] Skipped – phone ${phone} has opted out.`);
      return {
        success: false,
        skipped: true,
        reason:  "opted_out",
        phone,
      };
    }
  }

  const dltTemplateId = options.dltTemplateId || null;
  const opts = {
    notificationId: options.notificationId || null,
    alertId:        options.alertId || null,
  };

  // ── 3. Provider chain ─────────────────────────────────────────────────────
  const errors = [];

  // 3a. MSG91 (India primary)
  if (_isMsg91Configured()) {
    try {
      return await _sendViaMSG91(phone, message, dltTemplateId, opts);
    } catch (err) {
      const msg = err?.response?.data
        ? JSON.stringify(err.response.data)
        : err.message;
      errors.push(`MSG91: ${msg}`);
      console.warn("[SMS] MSG91 failed, trying Twilio:", msg);
    }
  }

  // 3b. Twilio (global fallback)
  if (_isTwilioConfigured()) {
    try {
      return await _sendViaTwilio(phone, message, dltTemplateId, opts);
    } catch (err) {
      const msg = err?.response?.data
        ? JSON.stringify(err.response.data)
        : err.message;
      errors.push(`Twilio: ${msg}`);
      console.warn("[SMS] Twilio failed:", msg);
    }
  }

  // 3c. Simulation fallback (no gateway configured)
  if (!_isMsg91Configured() && !_isTwilioConfigured()) {
    console.log(`[SMS SIMULATED] → ${phone} | ${message.slice(0, 60)}…`);
    return {
      success:   false,
      skipped:   true,
      simulated: true,
      message:   "SMS provider is not configured – message logged only",
      provider:  "simulated",
      phone,
    };
  }

  // All providers failed
  console.error("[SMS] All providers failed:", errors.join(" | "));
  return {
    success:  false,
    provider: "none",
    errors,
    phone,
  };
}

// ---------------------------------------------------------------------------
// Public: sendBulkSMS – disaster broadcast (respects consent, deduplicates)
// ---------------------------------------------------------------------------

/**
 * Send the same alert SMS to an array of recipients.
 * Consent-filtered, deduplicated by phone, rate-limited to 10 req/sec.
 *
 * @param {Array<{phone, name, lang}>} recipients
 * @param {Function} bodyFn   (recipient) => { body, dltTemplateId }
 * @param {Object}   opts     forwarded to sendSMS
 * @returns {Promise<{sent, skipped, failed}>}
 */
async function sendBulkSMS(recipients, bodyFn, opts = {}) {
  const seen   = new Set();
  const result = { sent: 0, skipped: 0, failed: 0, errors: [] };
  const BATCH  = 10;  // concurrent sends per batch

  const unique = recipients.filter((r) => {
    const p = _normalisePhone(r.phone);
    if (!p || seen.has(p)) return false;
    seen.add(p);
    return true;
  });

  for (let i = 0; i < unique.length; i += BATCH) {
    const batch = unique.slice(i, i + BATCH);

    await Promise.all(
      batch.map(async (recipient) => {
        try {
          const { body, dltTemplateId } = bodyFn(recipient);
          const res = await sendSMS(recipient.phone, body, {
            ...opts,
            dltTemplateId,
          });

          if (res.success)       result.sent++;
          else if (res.skipped)  result.skipped++;
          else                   result.failed++;
        } catch (err) {
          result.failed++;
          result.errors.push(err.message);
        }
      })
    );

    // Small throttle between batches (avoid provider rate limits)
    if (i + BATCH < unique.length) {
      await new Promise((r) => setTimeout(r, 100));
    }
  }

  return result;
}

// ---------------------------------------------------------------------------
// Public: handleConsentChange – opt-in / opt-out
// ---------------------------------------------------------------------------

/**
 * Update SMS consent for a phone number.
 * Called from the webhook route when a user replies STOP / START.
 *
 * @param {string} phone
 * @param {boolean} consented    true = opt-in, false = opt-out
 * @param {string}  source       "sms_reply_start" | "sms_reply_stop" | "admin" | "api"
 * @param {string}  [ip]
 */
async function handleConsentChange(phone, consented, source = "api", ip = null) {
  const normPhone = _normalisePhone(phone);
  if (!normPhone) throw new Error("Invalid phone number");

  const action = consented ? "optin" : "optout";

  await SmsConsent.findOneAndUpdate(
    { phone: normPhone },
    {
      $set: {
        consented,
        consentSource:    source,
        consentUpdatedAt: new Date(),
      },
      $push: {
        history: { action, source, timestamp: new Date(), ip },
      },
    },
    { upsert: true, new: true }
  );

  // Send confirmation SMS if opting in
  if (consented && (_isMsg91Configured() || _isTwilioConfigured())) {
    const { buildSmsBody } = require("../utils/smsTemplates");
    const { body, dltTemplateId } = buildSmsBody({
      alertType: "optin_confirmation",
      severity:  "INFO",
      lang:      "en",
      vars:      { name: "" },
    });
    // Use the specific optin template
    const { getTemplate } = require("../utils/smsTemplates");
    const tmpl = getTemplate("optin_confirmation_en");
    await sendSMS(normPhone, tmpl.build({ name: "" }), {
      dltTemplateId: tmpl.dltTemplateId,
      bypassConsent: true,
    });
  }

  return { phone: normPhone, consented, action };
}

// ---------------------------------------------------------------------------
// Public: processDeliveryReceipt – called from webhook controller
// ---------------------------------------------------------------------------

/**
 * Update a delivery receipt from a provider DLR webhook payload.
 * @param {string} provider   "twilio" | "msg91"
 * @param {Object} payload    Raw webhook body
 */
async function processDeliveryReceipt(provider, payload) {
  let providerMessageId;
  let deliveryStatus;
  let deliveredAt = null;
  let errorCode   = null;
  let errorMessage = null;

  if (provider === "twilio") {
    providerMessageId = payload.MessageSid || payload.SmsSid;
    const raw = (payload.MessageStatus || payload.SmsStatus || "unknown").toLowerCase();
    deliveryStatus = _normaliseTwilioStatus(raw);
    if (deliveryStatus === "delivered") deliveredAt = new Date();
    errorCode    = payload.ErrorCode   || null;
    errorMessage = payload.ErrorMessage || null;

  } else if (provider === "msg91") {
    providerMessageId = payload.requestId || payload.request_id;
    deliveryStatus = _normaliseMsg91Status(payload.status || payload.report?.[0]?.status || "unknown");
    if (deliveryStatus === "delivered") deliveredAt = new Date();
    errorCode    = payload.desc || null;
  }

  if (!providerMessageId) {
    console.warn("[SMS DLR] No message ID in webhook payload:", payload);
    return { saved: false };
  }

  try {
    await SmsDeliveryReceipt.findOneAndUpdate(
      { providerMessageId },
      {
        $set: {
          deliveryStatus,
          rawWebhookPayload: payload,
          ...(deliveredAt ? { deliveredAt } : {}),
          ...(errorCode    ? { errorCode }    : {}),
          ...(errorMessage ? { errorMessage } : {}),
        },
      },
      { upsert: true }
    );
    return { saved: true, providerMessageId, deliveryStatus };
  } catch (err) {
    console.error("[SMS DLR] Failed to update receipt:", err.message);
    return { saved: false, error: err.message };
  }
}

// ---------------------------------------------------------------------------
// Status normalisers
// ---------------------------------------------------------------------------

function _normaliseTwilioStatus(s) {
  const map = {
    queued:       "queued",
    sending:      "queued",
    sent:         "sent",
    delivered:    "delivered",
    undelivered:  "undelivered",
    failed:       "failed",
    received:     "received",
    read:         "read",
  };
  return map[s] || "unknown";
}

function _normaliseMsg91Status(s) {
  const lower = String(s).toLowerCase();
  if (lower.includes("deliver")) return "delivered";
  if (lower.includes("sent")  || lower.includes("submit")) return "sent";
  if (lower.includes("fail")  || lower.includes("reject")) return "failed";
  if (lower.includes("queue") || lower.includes("pending")) return "queued";
  return "unknown";
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

module.exports = {
  sendSMS,
  sendBulkSMS,
  handleConsentChange,
  processDeliveryReceipt,
};