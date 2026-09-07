// ─────────────────────────────────────────────────────────────────────────────
// Backend/routes/firewallRoutes.js
//
// Endpoints for Security Firewall status, inspect permission requests,
// and Head Administrator security alerts.
// ─────────────────────────────────────────────────────────────────────────────
const express = require("express");
const router = express.Router();
const { getFirewallStatus } = require("../middleware/firewallMiddleware");
const { sendSecurityAlert } = require("../services/securityEmailService");

// POST /api/firewall/request-inspect
// Non-admin user requests inspection clearance
router.post("/request-inspect", async (req, res) => {
  const { userAgent, href, email, reason } = req.body;
  const ip = req.headers["x-forwarded-for"] || req.ip || "unknown";

  try {
    await sendSecurityAlert({
      ip,
      userId: email || "Anonymous Visitor",
      reason: `Inspect Permission Requested for page: ${href || "Unknown"} (Reason: ${reason || "Developer inspection request"})`,
      endpoint: "/api/firewall/request-inspect",
      method: "INSPECT_REQUEST",
      violations: 1,
      timestamp: new Date().toISOString(),
      recipient: "teamsecure.project@gmail.com",
    });

    res.json({
      success: true,
      message: "Inspection permission request dispatched to Head Administrator (teamsecure.project@gmail.com).",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to dispatch request." });
  }
});

// GET /api/firewall/status
router.get("/status", (req, res) => {
  res.json({ success: true, data: getFirewallStatus() });
});

module.exports = router;
