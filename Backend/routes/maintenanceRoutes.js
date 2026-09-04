const express = require("express");
const { sendEmail } = require("../services/emailService");

const router = express.Router();

// POST /api/maintenance/notify-error
// Called by the frontend ErrorBoundary when a React crash is caught.
// Sends a formatted HTML report to teamsecure.project@gmail.com.
// No authentication required — fires in degraded state when auth may be unavailable.
router.post("/notify-error", async (req, res) => {
  const { error, stack, recipient } = req.body;

  const to = recipient || "teamsecure.project@gmail.com";
  const timestamp = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <style>
    body { font-family: Arial, sans-serif; background: #0f172a; color: #e2e8f0; padding: 0; margin: 0; }
    .container { max-width: 620px; margin: 0 auto; background: #1e293b; border-radius: 12px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #dc2626, #b91c1c); padding: 24px 28px; }
    .header h1 { margin: 0; font-size: 1.3rem; color: #fff; }
    .header p { margin: 4px 0 0 0; color: #fca5a5; font-size: 0.9rem; }
    .body { padding: 24px 28px; }
    .badge { display: inline-block; background: #dc2626; color: #fff; font-size: 0.7rem;
             font-weight: 700; padding: 2px 8px; border-radius: 4px; text-transform: uppercase;
             margin-bottom: 16px; }
    .label { font-size: 0.8rem; color: #94a3b8; font-weight: 600; text-transform: uppercase;
             margin-bottom: 6px; margin-top: 18px; }
    .value { background: #0f172a; border: 1px solid #334155; border-radius: 6px; padding: 12px;
             font-size: 0.85rem; color: #f1f5f9; white-space: pre-wrap; word-break: break-word; }
    .footer { border-top: 1px solid #334155; padding: 16px 28px; font-size: 0.78rem; color: #64748b; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🚨 Automated Maintenance Alert</h1>
      <p>Disaster Management Platform — Auto-Recovery System</p>
    </div>
    <div class="body">
      <span class="badge">Critical Error Detected</span>
      <div class="label">Timestamp (IST)</div>
      <div class="value">${timestamp}</div>
      <div class="label">Error Message</div>
      <div class="value">${error || "Unknown error"}</div>
      <div class="label">Component Stack / Details</div>
      <div class="value">${stack || "No stack trace available"}</div>
    </div>
    <div class="footer">
      Auto-fix permissions have been granted. The system will self-restart in 60 seconds.<br/>
      Head Admins: debasishn185@gmail.com · teamsecure.project@gmail.com
    </div>
  </div>
</body>
</html>`;

  const text = `[DISASTER PLATFORM - AUTO MAINTENANCE]\nTimestamp: ${timestamp}\n\nError: ${error || "Unknown"}\n\nStack:\n${stack || "N/A"}\n\nAuto-fix granted. System restarting in 60s.`;

  try {
    await sendEmail({
      to,
      subject: `🚨 [Auto-Maintenance] Platform Error Detected — ${timestamp}`,
      text,
      html,
    });

    return res.status(200).json({
      success: true,
      message: `Error report sent to ${to}`,
    });
  } catch (err) {
    console.error("[Maintenance] Email send failed:", err.message);
    // Still return 200 so ErrorBoundary doesn't loop on failures
    return res.status(200).json({
      success: false,
      message: "Email delivery failed but error was logged server-side",
    });
  }
});

// GET /api/maintenance/status  — public health check
router.get("/status", (req, res) => {
  res.status(200).json({
    success: true,
    status: "operational",
    maintainers: [
      "teamsecure.project@gmail.com",
      "debasishn185@gmail.com",
    ],
    autoRecovery: true,
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
