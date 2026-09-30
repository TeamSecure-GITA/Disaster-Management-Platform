/**
 * alertEscalationService.js
 *
 * Scans active alerts whose ackSlaMinutes has elapsed without acknowledgement
 * from all required authority roles and escalates them up the chain:
 *
 *   village_fp  → SDRF  → DDMA  → State EOC  → NDMA
 *
 * Escalation actions:
 *  - Adds an escalation record to the Alert document
 *  - Re-notifies the next tier via all channels (push + email + SMS)
 *  - Broadcasts an updated alert via Socket.IO
 */

"use strict";

const Alert    = require("../models/Alert");
const User     = require("../models/User");
const { createNotification } = require("./notificationService");
const { resolveForRecipient } = require("../utils/alertI18n");
const { emitAlertUpdated }   = require("../sockets/alertSocket");

// Escalation ladder (each step escalates to higher authority)
const ESCALATION_LADDER = ["village_fp", "sdrf", "ddma", "operator", "admin"];

// Escalation email contacts for tiers that may not have DB users
const STATIC_ESCALATION_CONTACTS = {
  admin: {
    email: process.env.STATE_EOC_EMAIL || "state-eoc@ner-disaster.gov.in",
    name: "State Emergency Operations Centre",
  },
};

/**
 * Run one escalation pass – called from the cron job every 5 minutes.
 */
async function runEscalationPass() {
  const now = new Date();

  // Find all active landslide/authority alerts that:
  //  (a) have a non-null ackSlaMinutes
  //  (b) were created more than ackSlaMinutes ago
  //  (c) not all targetRoles have acknowledged
  const candidates = await Alert.find({
    status: "active",
    ackSlaMinutes: { $gt: 0 },
    targetRoles: { $in: ["ddma", "sdrf", "village_fp"] },
  }).lean();

  const results = [];

  for (const alert of candidates) {
    const ackDeadline = new Date(
      new Date(alert.createdAt).getTime() + alert.ackSlaMinutes * 60 * 1000
    );

    if (now < ackDeadline) continue;  // SLA not yet breached

    const pendingRoles = (alert.targetRoles || []).filter(
      (r) =>
        ESCALATION_LADDER.includes(r) &&
        !(alert.acknowledgedRoles || []).includes(r)
    );

    if (!pendingRoles.length) continue;  // all roles have acked

    // Determine next escalation tier
    const highestPending = pendingRoles.reduce(
      (best, r) =>
        ESCALATION_LADDER.indexOf(r) > ESCALATION_LADDER.indexOf(best) ? r : best,
      pendingRoles[0]
    );

    const nextTierIdx = ESCALATION_LADDER.indexOf(highestPending) + 1;
    const nextTier =
      nextTierIdx < ESCALATION_LADDER.length
        ? ESCALATION_LADDER[nextTierIdx]
        : "admin";

    // Avoid re-escalating to the same tier within 30 minutes
    const lastEsc = alert.escalations?.slice(-1)[0];
    if (lastEsc && lastEsc.escalatedTo === nextTier) {
      const msSinceLastEsc = now - new Date(lastEsc.escalatedAt);
      if (msSinceLastEsc < 30 * 60 * 1000) continue;
    }

    // ── Persist escalation record ─────────────────────────────────────────
    const escalationRecord = {
      escalatedAt: now,
      escalatedTo: nextTier,
      reason:      "no_ack_within_sla",
      triggeredBy: "system",
    };

    try {
      await Alert.findByIdAndUpdate(alert._id, {
        $push: { escalations: escalationRecord },
        $set:  { lastEscalatedAt: now },
      });
    } catch (err) {
      console.error("[Escalation] DB update failed:", err.message);
      continue;
    }

    // ── Notify next-tier users ────────────────────────────────────────────
    const nextTierUsers = await _getUsersByRole(nextTier, alert.targetDistricts || []);

    const locContent = alert.localizedContent || [];

    for (const user of nextTierUsers) {
      const lang = user.preferredLanguage || "en";
      const localised = resolveForRecipient(locContent, lang);
      const escalatedTitle = `[ESCALATED] ${localised.title || alert.title}`;
      const escalatedMsg   = `No acknowledgement from ${highestPending.toUpperCase()} within ${alert.ackSlaMinutes} min. Escalated to ${nextTier.toUpperCase()}.\n\n${localised.message || alert.message}`;

      try {
        await createNotification({
          recipient:    user._id,
          isBroadcast:  false,
          title:        escalatedTitle,
          message:      escalatedMsg,
          type:         "emergency_danger",
          priority:     "critical",
          channels:     ["in-app", "push", "email", "sms"],
          relatedId:    alert._id,
          relatedModel: "Alert",
          metadata: {
            alertId:      alert._id,
            escalationTier: nextTier,
            originalSeverity: alert.severity,
          },
        });
      } catch (err) {
        console.error(`[Escalation] Notify user ${user._id} failed:`, err.message);
      }
    }

    // Static email for State EOC / NDMA if we reach admin tier
    if (nextTier === "admin" && STATIC_ESCALATION_CONTACTS.admin.email) {
      const { sendEmail } = require("./emailService");
      await sendEmail({
        to:      STATIC_ESCALATION_CONTACTS.admin.email,
        subject: `[NDMA ESCALATION] Landslide Alert – ${alert.metadata?.zoneName || "NER Zone"} – ${alert.severity.toUpperCase()}`,
        text: `Alert ID: ${alert._id}\nZone: ${alert.metadata?.zoneName}\nSeverity: ${alert.severity.toUpperCase()}\nRisk Score: ${alert.landslideRiskScore}\nDistricts: ${(alert.targetDistricts || []).join(", ")}\n\nNo acknowledgement received from lower tiers within SLA. Immediate attention required.`,
        html:  `<b>Alert ID:</b> ${alert._id}<br><b>Zone:</b> ${alert.metadata?.zoneName}<br><b>Severity:</b> ${alert.severity.toUpperCase()}<br><b>Risk Score:</b> ${alert.landslideRiskScore}<br><b>Districts:</b> ${(alert.targetDistricts || []).join(", ")}<br><br><i>No acknowledgement received from lower tiers within ${alert.ackSlaMinutes} min SLA.</i>`,
      }).catch((e) => console.error("[Escalation] State EOC email failed:", e.message));
    }

    // ── Broadcast updated alert ───────────────────────────────────────────
    try {
      const updatedAlert = await Alert.findById(alert._id).lean();
      if (updatedAlert) emitAlertUpdated(updatedAlert);
    } catch (_) {}

    console.log(
      `[Escalation] Alert ${alert._id} | Escalated to: ${nextTier} | Pending roles: ${pendingRoles.join(", ")}`
    );

    results.push({
      alertId:     alert._id,
      escalatedTo: nextTier,
      pendingRoles,
      notified:    nextTierUsers.length,
    });
  }

  return results;
}

/**
 * Record an acknowledgement from a user.
 * @param {string} alertId
 * @param {Object} user  – { _id, role, preferredLanguage }
 * @param {string} [remarks]
 * @returns {Object} updated alert
 */
async function acknowledgeAlert(alertId, user, remarks = "") {
  const ackRecord = {
    userId:          user._id,
    role:            user.role,
    acknowledgedAt:  new Date(),
    remarks,
  };

  const alert = await Alert.findByIdAndUpdate(
    alertId,
    {
      $push:    { acknowledgements: ackRecord },
      $addToSet: { acknowledgedRoles: user.role },
    },
    { new: true }
  );

  if (!alert) throw new Error(`Alert ${alertId} not found`);

  // Broadcast the update so dashboards show the ack in real time
  emitAlertUpdated(alert.toObject());

  return alert;
}

// ---------------------------------------------------------------------------
// Internal helper
// ---------------------------------------------------------------------------
async function _getUsersByRole(role, districts = []) {
  try {
    const query = { isActive: true };
    if (["ddma", "sdrf", "village_fp"].includes(role)) {
      // Map custom roles to the User schema's role field
      const dbRoleMap = { ddma: "operator", sdrf: "admin", village_fp: "volunteer" };
      query.role = dbRoleMap[role] || role;
    } else {
      query.role = role;
    }
    return await User.find(query)
      .select("_id name email phone role preferredLanguage fcmToken")
      .limit(50)
      .lean();
  } catch (err) {
    console.error("[Escalation] _getUsersByRole error:", err.message);
    return [];
  }
}

module.exports = { runEscalationPass, acknowledgeAlert };
