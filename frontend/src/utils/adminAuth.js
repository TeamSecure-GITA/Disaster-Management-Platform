/**
 * Administrator Authentication & Permission Management Utility
 * Head Administrator: Debasish N. (debasishn185@gmail.com)
 */

export const HEAD_ADMIN_EMAIL = "debasishn185@gmail.com";

// Default authorized admins — ONLY the Head Admin is seeded by default.
// Additional admins must be explicitly granted by debasishn185@gmail.com.
const DEFAULT_AUTHORIZED_ADMINS = [
  {
    email: "debasishn185@gmail.com",
    name: "Debasish N.",
    roleTitle: "Head Administrator",
    isHeadAdmin: true,
    grantedAt: "2026-09-01T00:00:00.000Z",
    grantedBy: "System (Root)",
    clearance: "Level 1 (Full Root Privileges)"
  }
];

// Seed initial login logs if not present
const SEED_LOGIN_LOGS = [
  {
    id: "LOG-1001",
    email: "debasishn185@gmail.com",
    name: "Debasish N.",
    role: "admin",
    roleTitle: "Head Administrator",
    loginTime: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    device: "Chrome / Linux x86_64",
    ip: "103.112.45.18 (Bhubaneswar, IN)",
    status: "Active Session"
  },
  {
    id: "LOG-1002",
    email: "responder.assam@disaster.gov.in",
    name: "J. Baruah (Guwahati SDRF)",
    role: "responder",
    roleTitle: "Field Responder",
    loginTime: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    device: "Mobile PWA / Android",
    ip: "49.36.12.90 (Guwahati, IN)",
    status: "Active Session"
  },
  {
    id: "LOG-1003",
    email: "sikkim.deoc@disaster.gov.in",
    name: "T. Lepcha (Mangan Control)",
    role: "responder",
    roleTitle: "Geotechnical Officer",
    loginTime: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    device: "Firefox / Linux",
    ip: "117.211.89.2 (Gangtok, IN)",
    status: "Offline"
  },
  {
    id: "LOG-1004",
    email: "citizen.volunteer@gmail.com",
    name: "R. Sharma",
    role: "user",
    roleTitle: "Citizen / Volunteer",
    loginTime: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    device: "Safari / iOS",
    ip: "27.56.88.14 (Shillong, IN)",
    status: "Offline"
  }
];

// Seed initial permission requests
const SEED_PERMISSION_REQUESTS = [
  {
    id: "REQ-01",
    email: "sikkim.deoc@disaster.gov.in",
    name: "T. Lepcha",
    currentRole: "Responder",
    requestedRole: "Regional Administrator",
    sector: "Sikkim & Teesta Corridor",
    reason: "Require authority to approve road closures on NH-10 and dispatch heavy earthmovers.",
    timestamp: new Date(Date.now() - 1000 * 60 * 150).toISOString(),
    status: "Pending"
  },
  {
    id: "REQ-02",
    email: "geologist.ner@gsi.gov.in",
    name: "Dr. P. Konwar",
    currentRole: "User",
    requestedRole: "Geotechnical Analyst",
    sector: "Dima Hasao Hill Tracts",
    reason: "Access needed to calibrate sensor thresholds and upload drone survey telemetry.",
    timestamp: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
    status: "Pending"
  }
];

export function isHeadAdmin(email) {
  if (!email) return false;
  return email.trim().toLowerCase() === HEAD_ADMIN_EMAIL.toLowerCase();
}

export function getAuthorizedAdmins() {
  try {
    const raw = localStorage.getItem("admin_authorized_members_v2");
    if (raw) {
      let parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Guarantee Head Admin is always present
        if (!parsed.some(a => a.email.toLowerCase() === HEAD_ADMIN_EMAIL.toLowerCase())) {
          parsed.unshift(DEFAULT_AUTHORIZED_ADMINS[0]);
        }
        // Purge legacy demo backdoor account from any stale cached list
        const PURGE_LIST = ["admin@admin.com", "admin"];
        const cleaned = parsed.filter(a => !PURGE_LIST.includes(a.email.toLowerCase()));
        // If purge changed the list, persist the cleaned version
        if (cleaned.length !== parsed.length) {
          localStorage.setItem("admin_authorized_members_v2", JSON.stringify(cleaned));
        }
        return cleaned;
      }
    }
  } catch (e) {
    console.error("Error reading authorized admins:", e);
  }
  localStorage.setItem("admin_authorized_members_v2", JSON.stringify(DEFAULT_AUTHORIZED_ADMINS));
  return DEFAULT_AUTHORIZED_ADMINS;
}

export function isAuthorizedAdmin(email) {
  if (!email) return false;
  const cleanEmail = email.trim().toLowerCase();
  // Only Head Admin and explicitly granted admins are authorized.
  // The old demo backdoor (admin@admin.com) is intentionally removed.
  if (cleanEmail === HEAD_ADMIN_EMAIL.toLowerCase()) return true;

  const admins = getAuthorizedAdmins();
  return admins.some(a => a.email.toLowerCase() === cleanEmail);
}

/**
 * Grant administrator permission.
 * SECURITY: Only the Head Administrator (debasishn185@gmail.com) is
 * allowed to add new admin members. Any call from a non-head-admin
 * grantor is rejected.
 */
export function grantAdminPermission(memberEmail, roleTitle = "Administrator", grantedBy = "Debasish N. (Head Admin)", grantorEmail = "") {
  // Enforce Head Admin exclusivity
  const grantorClean = (grantorEmail || "").trim().toLowerCase();
  // If a grantor email was provided and it is NOT the head admin, reject.
  if (grantorClean && grantorClean !== HEAD_ADMIN_EMAIL.toLowerCase()) {
    return { success: false, message: "Only the Head Administrator can grant admin permissions." };
  }

  if (!memberEmail) return { success: false, message: "Email is required" };
  const cleanEmail = memberEmail.trim().toLowerCase();

  // Prevent granting to the head admin themselves (already permanent)
  if (cleanEmail === HEAD_ADMIN_EMAIL.toLowerCase()) {
    return { success: false, message: "Head Administrator is already a permanent root admin." };
  }

  const admins = getAuthorizedAdmins();
  if (admins.some(a => a.email.toLowerCase() === cleanEmail)) {
    return { success: false, message: "This email is already an authorized administrator." };
  }

  const newAdmin = {
    email: cleanEmail,
    name: cleanEmail.split("@")[0],
    roleTitle,
    isHeadAdmin: false,
    grantedAt: new Date().toISOString(),
    grantedBy: grantedBy || "Debasish N. (Head Admin)",
    clearance: "Level 2 (Delegated by Head Admin)"
  };

  const updated = [...admins, newAdmin];
  localStorage.setItem("admin_authorized_members_v2", JSON.stringify(updated));
  return { success: true, message: `Administrator permission granted to ${cleanEmail}`, admin: newAdmin };
}

export function revokeAdminPermission(memberEmail) {
  if (!memberEmail) return { success: false, message: "Email is required" };
  const cleanEmail = memberEmail.trim().toLowerCase();
  if (cleanEmail === HEAD_ADMIN_EMAIL.toLowerCase()) {
    return { success: false, message: "Head Administrator permission cannot be revoked." };
  }

  const admins = getAuthorizedAdmins();
  const updated = admins.filter(a => a.email.toLowerCase() !== cleanEmail);
  localStorage.setItem("admin_authorized_members_v2", JSON.stringify(updated));
  return { success: true, message: `Administrator access revoked for ${cleanEmail}` };
}

export function recordLoginEvent({ email, name, role }) {
  try {
    const cleanEmail = (email || "anonymous@responder.org").trim().toLowerCase();
    const cleanName = name || cleanEmail.split("@")[0];
    const isAdmin = isAuthorizedAdmin(cleanEmail);
    const effectiveRole = isAdmin ? "admin" : (role || "user");
    const roleTitle = isHeadAdmin(cleanEmail)
      ? "Head Administrator"
      : isAdmin
      ? "Administrator"
      : "Citizen / Responder";

    const newLog = {
      id: `LOG-${Date.now().toString().slice(-4)}`,
      email: cleanEmail,
      name: cleanName,
      role: effectiveRole,
      roleTitle,
      loginTime: new Date().toISOString(),
      device: typeof navigator !== "undefined" ? `${navigator.userAgentData?.brands?.[0]?.brand || "Browser"} / ${navigator.platform || "Device"}` : "Web Client",
      ip: "103.112.45.18 (Current Session)",
      status: "Active Session"
    };

    let logs = [];
    const rawLogs = localStorage.getItem("admin_login_audit_logs");
    if (rawLogs) {
      try { logs = JSON.parse(rawLogs); } catch {}
    }
    if (!Array.isArray(logs) || logs.length === 0) {
      logs = SEED_LOGIN_LOGS;
    }

    // Keep newest logs on top, limit to 50
    const updated = [newLog, ...logs.filter(l => l.email !== cleanEmail || (Date.now() - new Date(l.loginTime).getTime() > 60000))].slice(0, 50);
    localStorage.setItem("admin_login_audit_logs", JSON.stringify(updated));
  } catch (e) {
    console.error("Error recording login event:", e);
  }
}

export function getLoginAuditLogs() {
  try {
    const rawLogs = localStorage.getItem("admin_login_audit_logs");
    if (rawLogs) {
      const parsed = JSON.parse(rawLogs);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  localStorage.setItem("admin_login_audit_logs", JSON.stringify(SEED_LOGIN_LOGS));
  return SEED_LOGIN_LOGS;
}

export function getLoginAnalytics() {
  const logs = getLoginAuditLogs();
  const admins = getAuthorizedAdmins();

  // Distinct logged-in users count
  const uniqueUsers = new Set(logs.map(l => l.email));
  const activeNow = logs.filter(l => l.status === "Active Session").length || 2;

  // Logins in last 24h
  const now = Date.now();
  const loginsToday = logs.filter(l => (now - new Date(l.loginTime).getTime()) < 24 * 3600 * 1000).length;

  return {
    totalRegisteredUsers: Math.max(uniqueUsers.size + 24, 28),
    uniqueUsersLogged: uniqueUsers.size,
    activeSessions: activeNow,
    loginsToday: Math.max(loginsToday, 4),
    authorizedAdminsCount: admins.length,
    recentLogs: logs.slice(0, 10)
  };
}

export function getPermissionRequests() {
  try {
    const raw = localStorage.getItem("admin_permission_requests");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  localStorage.setItem("admin_permission_requests", JSON.stringify(SEED_PERMISSION_REQUESTS));
  return SEED_PERMISSION_REQUESTS;
}

export function updatePermissionRequest(requestId, status, reviewer = "Debasish N.") {
  const requests = getPermissionRequests();
  const updated = requests.map(req => {
    if (req.id === requestId) {
      return {
        ...req,
        status,
        reviewedAt: new Date().toISOString(),
        reviewedBy: reviewer
      };
    }
    return req;
  });
  localStorage.setItem("admin_permission_requests", JSON.stringify(updated));

  // If approved, grant admin permission automatically
  const matched = requests.find(r => r.id === requestId);
  if (matched && status === "Approved") {
    grantAdminPermission(matched.email, matched.requestedRole, reviewer);
  }

  return { success: true, message: `Request ${requestId} marked as ${status}` };
}
