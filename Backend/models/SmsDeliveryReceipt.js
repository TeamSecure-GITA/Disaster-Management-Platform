const mongoose = require("mongoose");

/**
 * SmsDeliveryReceipt – stores carrier DLR (Delivery Report) callbacks.
 *
 * Both Twilio and MSG91 POST a DLR webhook when a message is delivered,
 * failed, or undelivered. This model persists that for:
 *  - Alert effectiveness auditing
 *  - SLA compliance tracking (who got the message, when)
 *  - Regulatory accountability (NDMA / TRAI)
 */
const smsDeliveryReceiptSchema = new mongoose.Schema(
  {
    /** Provider message SID / message ID */
    providerMessageId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    provider: {
      type: String,
      enum: ["twilio", "msg91", "simulated"],
      required: true,
    },

    phone: {
      type: String,
      required: true,
      index: true,
    },

    /** Status reported by the carrier DLR */
    deliveryStatus: {
      type: String,
      enum: [
        "queued",
        "sent",
        "delivered",
        "undelivered",
        "failed",
        "received",
        "read",
        "unknown",
      ],
      default: "queued",
      index: true,
    },

    /** Raw DLR payload from the provider (for debugging) */
    rawWebhookPayload: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    /** Link back to the Notification document that triggered this SMS */
    notificationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Notification",
      default: null,
      index: true,
    },

    /** Link back to the Alert document (if disaster alert) */
    alertId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Alert",
      default: null,
      index: true,
    },

    /** Error code returned by provider on failure */
    errorCode: {
      type: String,
      default: null,
    },

    errorMessage: {
      type: String,
      default: null,
    },

    /** Carrier DLR timestamp */
    deliveredAt: {
      type: Date,
      default: null,
    },

    /** Template ID used (for DLT audit) */
    dltTemplateId: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("SmsDeliveryReceipt", smsDeliveryReceiptSchema);
