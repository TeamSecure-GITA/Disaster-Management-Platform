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
// Map<userId, { blockedAt, expiresAt, reason, ip }>
const blockedUserIds = new Map();

// ─── Configuration ───────────────────────────────────────────────────────────
const MAX_VIOLATIONS = 3;             // block quickly after 3 violations or immediately on severe attacks
const BLOCK_DURATION_MS = 24 * 60 * 60 * 1000;  // 24 hours block
const VIOLATION_WINDOW_MS = 30 * 60 * 1000; // 30 minute rolling window
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;  // clean expired entries every 5 min

// ─── Suspicious patterns (SQL injection, NoSQL injection, path traversal, XSS) ────
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
 * Get client IP respecting proxies.
 */
function getClientIP(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return req.ip || req.connection?.remoteAddress || "unknown";
}

/**
 * Extract User ID from request if available.
 */
function getRequestUserId(req) {
  return (
    req.user?.id ||
    req.user?._id?.toString?.() ||
    req.body?.userId ||
    req.headers["x-user-id"] ||
    null
  );
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
 * Record a violation for an IP and optional userId. Returns true if blocked.
 */
function recordViolation(ip, reason, userId = null, forceBlock = false) {
  const now = Date.now();
  let entry = violations.get(ip);

  if (!entry || (now - entry.firstViolation) > VIOLATION_WINDOW_MS) {
    entry = { count: 0, firstViolation: now, lastViolation: now, reasons: [], userIds: [] };
  }

  entry.count += 1;
  entry.lastViolation = now;
  if (!entry.reasons.includes(reason)) {
    entry.reasons.push(reason);
  }
  if (userId && !entry.userIds.includes(userId)) {
    entry.userIds.push(userId);
  }
  violations.set(ip, entry);

  if (forceBlock || entry.count >= MAX_VIOLATIONS) {
    blockTarget(ip, entry, userId);
    return true;
  }
  return false;
}

/**
 * Block an IP and user ID, and send immediate security alert email.
 */
function blockTarget(ip, violationEntry, userId = null) {
  const now = Date.now();
  const reasonText = violationEntry?.reasons?.join("; ") || "Repeated security violations";

  blockedIPs.set(ip, {
    blockedAt: now,
    expiresAt: now + BLOCK_DURATION_MS,
    reason: reasonText,
    userId: userId || violationEntry?.userIds?.[0] || null,
  });

  if (userId) {
    blockedUserIds.set(userId, {
      blockedAt: now,
      expiresAt: now + BLOCK_DURATION_MS,
      reason: reasonText,
      ip,
    });
  }

  violations.delete(ip);

  console.error(
    `[FIREWALL] 🚫 BLOCKED: IP=${ip} UserID=${userId || "N/A"} — Reason: ${reasonText}`
  );

  // Send email alert to teamsecure.project@gmail.com
  sendSecurityAlert({
    ip,
    userId: userId || "Anonymous / Unauthenticated",
    reason: reasonText,
    endpoint: "Security Firewall Barrier",
    method: "BLOCKED",
    violations: violationEntry?.count || 1,
    timestamp: new Date().toISOString(),
    recipient: "teamsecure.project@gmail.com",
  }).catch((err) => {
    console.error("[FIREWALL] Failed to send security email alert:", err?.message);
  });
}

/**
 * Check if an IP or User ID is currently blocked.
 */
function isBlocked(ip, userId = null) {
  const now = Date.now();

  // Check IP block
  const ipBlock = blockedIPs.get(ip);
  if (ipBlock) {
    if (now > ipBlock.expiresAt) {
      blockedIPs.delete(ip);
    } else {
      return { blocked: true, type: "IP", data: ipBlock };
    }
  }

  // Check User ID block
  if (userId) {
    const userBlock = blockedUserIds.get(userId);
    if (userBlock) {
      if (now > userBlock.expiresAt) {
        blockedUserIds.delete(userId);
      } else {
        return { blocked: true, type: "USER_ID", data: userBlock };
      }
    }
  }

  return { blocked: false };
}

// ─── Periodic cleanup of expired entries ─────────────────────────────────────
setInterval(() => {
  const now = Date.now();

  for (const [ip, block] of blockedIPs.entries()) {
    if (now > block.expiresAt) {
      blockedIPs.delete(ip);
    }
  }
  for (const [uid, block] of blockedUserIds.entries()) {
    if (now > block.expiresAt) {
      blockedUserIds.delete(uid);
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
 */
function firewallMiddleware(req, res, next) {
  const ip = getClientIP(req);
  const userId = getRequestUserId(req);

  // ── 1. Check if IP or User ID is blocked ─────────────────────────────────
  const blockCheck = isBlocked(ip, userId);
  if (blockCheck.blocked) {
    const remainingMs = blockCheck.data.expiresAt - Date.now();
    const remainingHours = Math.ceil(remainingMs / (60 * 60 * 1000));

    return res.status(403).json({
      success: false,
      blocked: true,
      blockType: blockCheck.type,
      message: `Access permanently restricted by TeamSecure Cyber Firewall. Your ${blockCheck.type === "USER_ID" ? "User Account ID" : "IP Address"} is blocked for ${remainingHours} hour(s) due to detected security violations.`,
      contact: "teamsecure.project@gmail.com",
    });
  }

  // ── 2. Scan request for suspicious patterns (SQLi, XSS, Path Traversal) ─
  let suspiciousDetected = false;
  let suspiciousReason = "";
  let isSevere = false;

  if (containsSuspiciousPatterns(req.originalUrl)) {
    suspiciousDetected = true;
    suspiciousReason = "Malicious URL pattern / SQLi / Path traversal detected";
    isSevere = true;
  } else if (req.body && scanObject(req.body)) {
    suspiciousDetected = true;
    suspiciousReason = "Malicious payload / SQL injection / Script tag in body";
    isSevere = true;
  } else if (req.query && scanObject(req.query)) {
    suspiciousDetected = true;
    suspiciousReason = "Malicious query parameters (Injection attempt)";
    isSevere = true;
  }

  if (suspiciousDetected) {
    // Severe attacks trigger immediate block on 1st/2nd try
    const nowBlocked = recordViolation(ip, suspiciousReason, userId, isSevere);
    console.warn(`[FIREWALL] 🚨 ${suspiciousReason} from IP=${ip} User=${userId || "N/A"} on ${req.method} ${req.originalUrl}`);

    if (nowBlocked) {
      return res.status(403).json({
        success: false,
        blocked: true,
        message: "Your IP and Account ID have been blocked by TeamSecure Cyber Firewall. A security incident alert has been dispatched to teamsecure.project@gmail.com.",
        contact: "teamsecure.project@gmail.com",
      });
    }
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
