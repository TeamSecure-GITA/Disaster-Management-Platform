// ─────────────────────────────────────────────────────────────────────────────
// Backend/middleware/firewallMiddleware.js
//
// Application-level firewall that detects and blocks illegal access attempts:
//  1. Tracks per-IP violation counts (auth failures, injection patterns, etc.)
//  2. Auto-blocks IPs exceeding the threshold for 30 minutes
//  3. Sends email alert to Head Administrator on every block event
//  4. Logs all security events for audit
// ─────────────────────────────────────────────────────────────────────────────
const { sendSecurityAlert } = require("../services/securityEmailService");

// ─── In-memory stores ────────────────────────────────────────────────────────
// Map<ip, { count, firstViolation, lastViolation, reasons[] }>
const violations = new Map();
// Map<ip, { blockedAt, expiresAt, reason }>
const blockedIPs = new Map();

// ─── Configuration ───────────────────────────────────────────────────────────
const MAX_VIOLATIONS = 10;            // block after 10 violations
const BLOCK_DURATION_MS = 30 * 60 * 1000;  // 30 minutes
const VIOLATION_WINDOW_MS = 15 * 60 * 1000; // 15 minute rolling window
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;  // clean expired entries every 5 min

// ─── Suspicious patterns (SQL injection, NoSQL injection, path traversal) ────
const SUSPICIOUS_PATTERNS = [
  /(\b(union|select|insert|update|delete|drop|alter|create|exec|execute)\b.*\b(from|into|table|database|where)\b)/i,
  /(\$gt|\$lt|\$ne|\$eq|\$regex|\$where|\$exists)/i,
  /(\.\.\/|\.\.\\|%2e%2e)/i,
  /(<script|javascript:|on\w+\s*=)/i,
  /(;\s*(ls|cat|rm|chmod|wget|curl|bash|sh|python|node|eval)\b)/i,
];

// ─── Head admin emails (exempt from blocking) ───────────────────────────────
const HEAD_ADMIN_EMAILS = [
  "debasishn185@gmail.com",
  "teamsecure.project@gmail.com",
];

/**
 * Get the real client IP, respecting proxy headers.
 */
function getClientIP(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return req.ip || req.connection?.remoteAddress || "unknown";
}

/**
 * Check if a string contains suspicious injection patterns.
 */
function containsSuspiciousPatterns(str) {
  if (!str || typeof str !== "string") return false;
  return SUSPICIOUS_PATTERNS.some((pattern) => pattern.test(str));
}

/**
 * Deep-scan an object's values for suspicious patterns.
 */
function scanObject(obj) {
  if (!obj || typeof obj !== "object") return false;
  for (const value of Object.values(obj)) {
    if (typeof value === "string" && containsSuspiciousPatterns(value)) {
      return true;
    }
    if (typeof value === "object" && value !== null && scanObject(value)) {
      return true;
    }
  }
  return false;
}

/**
 * Record a violation for an IP. Returns true if the IP is now blocked.
 */
function recordViolation(ip, reason) {
  const now = Date.now();
  let entry = violations.get(ip);

  if (!entry || (now - entry.firstViolation) > VIOLATION_WINDOW_MS) {
    // Start fresh window
    entry = { count: 0, firstViolation: now, lastViolation: now, reasons: [] };
  }

  entry.count += 1;
  entry.lastViolation = now;
  if (!entry.reasons.includes(reason)) {
    entry.reasons.push(reason);
  }
  violations.set(ip, entry);

  if (entry.count >= MAX_VIOLATIONS) {
    blockIP(ip, entry);
    return true;
  }
  return false;
}

/**
 * Block an IP and send security alert email.
 */
function blockIP(ip, violationEntry) {
  const now = Date.now();
  blockedIPs.set(ip, {
    blockedAt: now,
    expiresAt: now + BLOCK_DURATION_MS,
    reason: violationEntry.reasons.join("; "),
  });

  // Clear violations since IP is now blocked
  violations.delete(ip);

  console.error(`[FIREWALL] 🚫 BLOCKED IP: ${ip} — Reason: ${violationEntry.reasons.join("; ")} — Violations: ${violationEntry.count}`);

  // Send email alert (non-blocking)
  sendSecurityAlert({
    ip,
    reason: violationEntry.reasons.join("; "),
    endpoint: "Multiple endpoints",
    method: "Various",
    violations: violationEntry.count,
    timestamp: new Date().toISOString(),
  }).catch(() => {});
}

/**
 * Check if an IP is currently blocked.
 */
function isBlocked(ip) {
  const block = blockedIPs.get(ip);
  if (!block) return false;

  if (Date.now() > block.expiresAt) {
    blockedIPs.delete(ip);
    return false;
  }
  return true;
}

// ─── Periodic cleanup of expired entries ─────────────────────────────────────
setInterval(() => {
  const now = Date.now();

  for (const [ip, block] of blockedIPs.entries()) {
    if (now > block.expiresAt) {
      blockedIPs.delete(ip);
    }
  }

  for (const [ip, entry] of violations.entries()) {
    if ((now - entry.lastViolation) > VIOLATION_WINDOW_MS) {
      violations.delete(ip);
    }
  }
}, CLEANUP_INTERVAL_MS);

// ═════════════════════════════════════════════════════════════════════════════
// EXPRESS MIDDLEWARE
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Main firewall middleware — runs on every request.
 * 1. Checks if IP is blocked → 403
 * 2. Scans request for injection patterns → records violation
 * 3. Hooks into response to detect auth failures → records violation
 */
function firewallMiddleware(req, res, next) {
  const ip = getClientIP(req);

  // ── 1. Check if IP is currently blocked ──────────────────────────────────
  if (isBlocked(ip)) {
    const block = blockedIPs.get(ip);
    const remainingMs = block ? block.expiresAt - Date.now() : 0;
    const remainingMin = Math.ceil(remainingMs / 60000);

    return res.status(403).json({
      success: false,
      blocked: true,
      message: `Your IP has been blocked due to suspicious activity. Block expires in ~${remainingMin} minute(s). Contact the Head Administrator if you believe this is an error.`,
      contact: "teamsecure.project@gmail.com",
    });
  }

  // ── 2. Scan request for suspicious patterns (injection attempts) ─────────
  let suspiciousDetected = false;
  let suspiciousReason = "";

  // Scan URL / query string
  if (containsSuspiciousPatterns(req.originalUrl)) {
    suspiciousDetected = true;
    suspiciousReason = "Suspicious URL pattern (possible injection)";
  }

  // Scan request body
  if (!suspiciousDetected && req.body && scanObject(req.body)) {
    suspiciousDetected = true;
    suspiciousReason = "Suspicious request body (possible injection)";
  }

  // Scan query parameters
  if (!suspiciousDetected && req.query && scanObject(req.query)) {
    suspiciousDetected = true;
    suspiciousReason = "Suspicious query parameters (possible injection)";
  }

  if (suspiciousDetected) {
    const nowBlocked = recordViolation(ip, suspiciousReason);
    console.warn(`[FIREWALL] ⚠️ Suspicious request from ${ip}: ${suspiciousReason} — ${req.method} ${req.originalUrl}`);

    if (nowBlocked) {
      return res.status(403).json({
        success: false,
        blocked: true,
        message: "Your IP has been blocked due to detected malicious activity. A security alert has been sent to the system administrator.",
        contact: "teamsecure.project@gmail.com",
      });
    }
  }

  // ── 3. Hook into response to detect auth failures (401/403) ──────────────
  const originalJson = res.json.bind(res);
  res.json = function (body) {
    // Only track failures on auth-sensitive endpoints
    if (res.statusCode === 401 || res.statusCode === 403) {
      const isAuthEndpoint = req.originalUrl.includes("/api/auth");
      const reason = isAuthEndpoint
        ? "Repeated authentication failure"
        : `Unauthorized access attempt (${res.statusCode})`;

      // Don't track known head admins
      const userEmail = req.user?.email || req.body?.email || "";
      const isHeadAdmin = HEAD_ADMIN_EMAILS.some(
        (e) => e.toLowerCase() === userEmail.toLowerCase()
      );

      if (!isHeadAdmin) {
        const nowBlocked = recordViolation(ip, reason);
        if (nowBlocked) {
          // Override the response to indicate the block
          return originalJson({
            success: false,
            blocked: true,
            message: "Your IP has been blocked due to repeated unauthorized access attempts. A security alert has been sent to the Head Administrator.",
            contact: "teamsecure.project@gmail.com",
          });
        }
      }
    }

    return originalJson(body);
  };

  next();
}

/**
 * Get current firewall status (for admin dashboard).
 */
function getFirewallStatus() {
  return {
    blockedIPs: Array.from(blockedIPs.entries()).map(([ip, data]) => ({
      ip,
      blockedAt: new Date(data.blockedAt).toISOString(),
      expiresAt: new Date(data.expiresAt).toISOString(),
      reason: data.reason,
    })),
    activeViolations: Array.from(violations.entries()).map(([ip, data]) => ({
      ip,
      count: data.count,
      reasons: data.reasons,
      lastViolation: new Date(data.lastViolation).toISOString(),
    })),
    totalBlocked: blockedIPs.size,
    totalTracked: violations.size,
  };
}

module.exports = {
  firewallMiddleware,
  getFirewallStatus,
  isBlocked,
  recordViolation,
};
