// ─────────────────────────────────────────────────────────────────────────────
// Backend/services/securityEmailService.js
//
// Sends security alert emails to Head Administrator(s) when the firewall
// detects and blocks suspicious / illegal access attempts.
// ─────────────────────────────────────────────────────────────────────────────
const nodemailer = require("nodemailer");

const HEAD_ADMIN_EMAIL = process.env.MAINTENANCE_ALERT_EMAIL || "teamsecure.project@gmail.com";

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587", 10),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER || "",
      pass: process.env.SMTP_PASSWORD || "",
    },
    // Prevent long hangs if SMTP is misconfigured
    connectionTimeout: 10000,
    greetingTimeout: 8000,
    socketTimeout: 15000,
  });

  return transporter;
}

/**
 * Send a security alert email to the Head Administrator.
 *
 * @param {Object} details
 * @param {string} details.ip          - Blocked IP address
 * @param {string} details.reason      - Reason for the block
 * @param {string} details.endpoint    - The endpoint that was targeted
 * @param {string} details.method      - HTTP method (GET, POST, etc.)
 * @param {string} details.userId      - User ID if authenticated (optional)
 * @param {string} details.userEmail   - User email if known (optional)
 * @param {number} details.violations  - Number of violations recorded
 * @param {string} details.timestamp   - ISO timestamp of the event
 */
async function sendSecurityAlert(details) {
  const {
    ip = "Unknown",
    reason = "Suspicious activity detected",
    endpoint = "Unknown",
    method = "Unknown",
    userId = "N/A",
    userEmail = "N/A",
    violations = 0,
    timestamp = new Date().toISOString(),
  } = details;

  const htmlBody = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 640px; margin: 0 auto; background: #0f172a; color: #e2e8f0; border-radius: 12px; overflow: hidden; border: 1px solid #1e293b;">
      <div style="background: linear-gradient(135deg, #dc2626, #991b1b); padding: 20px 28px;">
        <h1 style="margin: 0; font-size: 22px; color: #ffffff;">🚨 SECURITY ALERT — Firewall Triggered</h1>
        <p style="margin: 4px 0 0; font-size: 14px; color: #fecaca;">Disaster Management Platform — Automated Security System</p>
      </div>

      <div style="padding: 24px 28px;">
        <p style="font-size: 15px; color: #94a3b8; margin: 0 0 18px;">
          The platform firewall has detected and <strong style="color: #f87171;">blocked</strong> a suspicious access attempt. Details below:
        </p>

        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr><td style="padding: 10px 12px; border-bottom: 1px solid #1e293b; color: #64748b; width: 140px;">Blocked IP</td>
              <td style="padding: 10px 12px; border-bottom: 1px solid #1e293b; color: #f87171; font-weight: 700;">${ip}</td></tr>
          <tr><td style="padding: 10px 12px; border-bottom: 1px solid #1e293b; color: #64748b;">Reason</td>
              <td style="padding: 10px 12px; border-bottom: 1px solid #1e293b; color: #fbbf24; font-weight: 600;">${reason}</td></tr>
          <tr><td style="padding: 10px 12px; border-bottom: 1px solid #1e293b; color: #64748b;">Target Endpoint</td>
              <td style="padding: 10px 12px; border-bottom: 1px solid #1e293b; color: #e2e8f0;">${method} ${endpoint}</td></tr>
          <tr><td style="padding: 10px 12px; border-bottom: 1px solid #1e293b; color: #64748b;">User ID</td>
              <td style="padding: 10px 12px; border-bottom: 1px solid #1e293b; color: #e2e8f0;">${userId}</td></tr>
          <tr><td style="padding: 10px 12px; border-bottom: 1px solid #1e293b; color: #64748b;">User Email</td>
              <td style="padding: 10px 12px; border-bottom: 1px solid #1e293b; color: #e2e8f0;">${userEmail}</td></tr>
          <tr><td style="padding: 10px 12px; border-bottom: 1px solid #1e293b; color: #64748b;">Total Violations</td>
              <td style="padding: 10px 12px; border-bottom: 1px solid #1e293b; color: #f87171; font-weight: 700;">${violations}</td></tr>
          <tr><td style="padding: 10px 12px; color: #64748b;">Timestamp</td>
              <td style="padding: 10px 12px; color: #e2e8f0;">${timestamp}</td></tr>
        </table>

        <div style="margin-top: 22px; padding: 14px; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 8px;">
          <p style="margin: 0; font-size: 13px; color: #fca5a5;">
            ⚠️ <strong>Action Taken:</strong> The IP address <code style="background: #1e293b; padding: 2px 6px; border-radius: 4px;">${ip}</code>
            has been blocked for 30 minutes. Repeated violations will extend the block duration automatically.
          </p>
        </div>
      </div>

      <div style="padding: 14px 28px; background: #0b1120; border-top: 1px solid #1e293b; font-size: 12px; color: #475569; text-align: center;">
        Disaster Management Platform — Security Monitoring System<br/>
        This is an automated alert. Do not reply to this email.
      </div>
    </div>
  `;

  try {
    const transport = getTransporter();
    await transport.sendMail({
      from: `"DM Platform Security" <${process.env.SMTP_FROM || process.env.SMTP_USER || "noreply@disaster-platform.com"}>`,
      to: HEAD_ADMIN_EMAIL,
      subject: `🚨 FIREWALL ALERT: Illegal Access Blocked — ${ip}`,
      html: htmlBody,
    });
    console.log(`[SECURITY] Alert email sent to ${HEAD_ADMIN_EMAIL} for blocked IP: ${ip}`);
  } catch (err) {
    // Log but never crash the server because of email failures
    console.error("[SECURITY] Failed to send alert email:", err.message);
  }
}

module.exports = { sendSecurityAlert };
