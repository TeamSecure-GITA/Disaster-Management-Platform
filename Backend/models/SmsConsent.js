const mongoose = require("mongoose");

/**
 * SmsConsent – tracks opt-in / opt-out state per phone number.
 *
 * India TRAI DLT regulations require:
 *  - Explicit consent before sending promotional/service SMS.
 *  - An auditable record of when consent was given or revoked.
 *  - Delivery-receipt correlation for accountability.
 *
 * Consent is indexed by normalised E.164 phone number.
 */
const smsConsentSchema = new mongoose.Schema(
  {
    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },

    /** true = opted in, false = opted out */
    consented: {
      type: Boolean,
      default: true,
      index: true,
    },

    /** Source of the consent action */
    consentSource: {
      type: String,
      enum: ["registration", "sms_reply_start", "admin", "api", "import"],
      default: "registration",
    },

    /** Timestamp of most recent consent change */
    consentUpdatedAt: {
      type: Date,
      default: Date.now,
    },

    /** Running history of consent changes for audit */
    history: [
      {
        action:    { type: String, enum: ["optin", "optout"] },
        source:    { type: String },
        timestamp: { type: Date, default: Date.now },
        ip:        { type: String, default: null },
      },
    ],

    /** DLT scrubbing list reference (for telecom operator portals) */
    dltScrubRef: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("SmsConsent", smsConsentSchema);
