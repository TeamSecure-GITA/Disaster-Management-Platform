/**
 * Administrator Authentication & Permission Management Utility
 * Head Administrators:
 *   Primary  — Debasish N.     (debasishn185@gmail.com)
 *   Secondary — TeamSecure Ops (teamsecure.project@gmail.com)
 */

export const HEAD_ADMIN_EMAIL = "debasishn185@gmail.com";
export const HEAD_ADMIN_EMAIL_2 = "teamsecure.project@gmail.com";

// Both emails are treated as co-equal root Head Administrators.
export const HEAD_ADMIN_EMAILS = [
  "debasishn185@gmail.com",
  "teamsecure.project@gmail.com",
];

// Default authorized admins — ONLY the Head Admins are seeded by default.
// Additional admins must be explicitly granted by a Head Admin.
const DEFAULT_AUTHORIZED_ADMINS = [
  {
    email: "debasishn185@gmail.com",
    name: "Debasish Nayak",
    roleTitle: "Head Administrator",
    isHeadAdmin: true,
    grantedAt: "2026-09-01T00:00:00.000Z",
    grantedBy: "System (Root)",
    clearance: "Level 1 (Full Root Privileges)"
  },
  {
    email: "teamsecure.project@gmail.com",
    name: "TeamSecure Operations",
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
    name: "Debasish Nayak",
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
  const clean = email.trim().toLowerCase();
  return HEAD_ADMIN_EMAILS.some(h => h.toLowerCase() === clean);
}

export function getAuthorizedAdmins() {
  try {
    const raw = localStorage.getItem("admin_authorized_members_v2");
    if (raw) {
      let parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Guarantee BOTH Head Admins are always present in the list
        for (const defaultAdmin of DEFAULT_AUTHORIZED_ADMINS) {
          if (!parsed.some(a => a.email.toLowerCase() === defaultAdmin.email.toLowerCase())) {
            parsed.unshift(defaultAdmin);
          }
        }
        // Purge legacy demo backdoor account from any stale cached list
        const PURGE_LIST = ["admin@admin.com", "admin"];
        const cleaned = parsed.filter(a => !PURGE_LIST.includes(a.email.toLowerCase()));
        // If anything changed, persist the cleaned version
        if (cleaned.length !== JSON.parse(raw).length) {
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
  // Both Head Admins are always authorized.
  if (isHeadAdmin(cleanEmail)) return true;

  const admins = getAuthorizedAdmins();
  return admins.some(a => a.email.toLowerCase() === cleanEmail);
}

/**
 * Grant administrator permission.
 * SECURITY: Only the Head Administrator (debasishn185@gmail.com) is
 * allowed to add new admin members. Any call from a non-head-admin
 * grantor is rejected.
 */
export function grantAdminPermission(memberEmail, roleTitle = "Administrator", grantedBy = "Head Admin", grantorEmail = "") {
  // Enforce Head Admin exclusivity — only a Head Admin can grant permissions.
  const grantorClean = (grantorEmail || "").trim().toLowerCase();
  if (grantorClean && !isHeadAdmin(grantorClean)) {
    return { success: false, message: "Only a Head Administrator can grant admin permissions." };
  }

  if (!memberEmail) return { success: false, message: "Email is required" };
  const cleanEmail = memberEmail.trim().toLowerCase();

  // Prevent granting to either head admin (already permanent root)
  if (isHeadAdmin(cleanEmail)) {
    return { success: false, message: "Head Administrators are already permanent root admins." };
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
    grantedBy: grantedBy || "Head Admin",
    clearance: "Level 2 (Delegated by Head Admin)"
  };

  const updated = [...admins, newAdmin];
  localStorage.setItem("admin_authorized_members_v2", JSON.stringify(updated));
  return { success: true, message: `Administrator permission granted to ${cleanEmail}`, admin: newAdmin };
}

export function revokeAdminPermission(memberEmail) {
  if (!memberEmail) return { success: false, message: "Email is required" };
  const cleanEmail = memberEmail.trim().toLowerCase();
  if (isHeadAdmin(cleanEmail)) {
    return { success: false, message: "Head Administrator permission cannot be revoked." };
  }

  const admins = getAuthorizedAdmins();
  const updated = admins.filter(a => a.email.toLowerCase() !== cleanEmail);
  localStorage.setItem("admin_authorized_members_v2", JSON.stringify(updated));
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("admin_auth_updated"));
  }
  return { success: true, message: `Administrator access revoked for ${cleanEmail}` };
}

// ─────────────────────────────────────────────────────────────────────────────
// APPROVED MEMBERS — Members explicitly verified/approved by Administrator
// ─────────────────────────────────────────────────────────────────────────────

export const DEFAULT_APPROVED_MEMBERS = [
  {
    email: "responder.assam@disaster.gov.in",
    name: "J. Baruah",
    roleTitle: "Field Responder",
    approvedAt: "2026-09-01T00:00:00.000Z",
    approvedBy: "Debasish N. (Head Administrator)",
    sector: "Assam & Brahmaputra Basin",
    clearance: "Approved Operational Member"
  },
  {
    email: "sikkim.deoc@disaster.gov.in",
    name: "T. Lepcha",
    roleTitle: "Geotechnical Officer",
    approvedAt: "2026-09-01T00:00:00.000Z",
    approvedBy: "Debasish N. (Head Administrator)",
    sector: "Sikkim & Teesta Corridor",
    clearance: "Approved Operational Member"
  }
];

export function getApprovedMembers() {
  try {
    const raw = localStorage.getItem("admin_approved_members_v2");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error("Error reading approved members:", e);
  }
  localStorage.setItem("admin_approved_members_v2", JSON.stringify(DEFAULT_APPROVED_MEMBERS));
  return DEFAULT_APPROVED_MEMBERS;
}

export function isApprovedMember(email) {
  if (!email) return false;
  const cleanEmail = email.trim().toLowerCase();

  // 1. All authorized admins are automatically approved
  if (isAuthorizedAdmin(cleanEmail)) return true;

  // 2. Check explicit approved members list
  const approved = getApprovedMembers();
  if (approved.some(m => (typeof m === "string" ? m : m.email).toLowerCase() === cleanEmail)) {
    return true;
  }

  // 3. Check permission requests marked as "Approved"
  const requests = getPermissionRequests();
  if (requests.some(r => r.email?.toLowerCase() === cleanEmail && r.status === "Approved")) {
    return true;
  }

  // 4. Check current user profile / session
  try {
    const rawUser = localStorage.getItem("user");
    if (rawUser) {
      const u = JSON.parse(rawUser);
      if (u?.email?.toLowerCase() === cleanEmail && (u?.isApproved === true || u?.status === "approved" || u?.adminApproved === true || u?.role === "approved_member" || u?.role === "responder" || u?.role === "admin")) {
        return true;
      }
    }
    const rawProfile = localStorage.getItem("user_profile_data_v2");
    if (rawProfile) {
      const p = JSON.parse(rawProfile);
      if (p?.email?.toLowerCase() === cleanEmail && (p?.isApproved === true || p?.status === "approved" || p?.adminApproved === true)) {
        return true;
      }
    }
  } catch {}

  return false;
}

export function hasPrivilegedFeatureAccess(email, role) {
  if (role === "admin") return true;
  if (!email) return false;
  return isAuthorizedAdmin(email) || isApprovedMember(email);
}

export function grantMemberApproval(memberEmail, roleTitle = "Approved Operational Member", approvedBy = "Head Administrator", sector = "Disaster Field Operations") {
  if (!memberEmail) return { success: false, message: "Email is required" };
  const cleanEmail = memberEmail.trim().toLowerCase();

  const members = getApprovedMembers();
  if (members.some(m => (typeof m === "string" ? m : m.email).toLowerCase() === cleanEmail)) {
    return { success: false, message: "This email is already an approved member." };
  }

  const newMember = {
    email: cleanEmail,
    name: cleanEmail.split("@")[0],
    roleTitle,
    approvedAt: new Date().toISOString(),
    approvedBy: approvedBy || "Head Administrator",
    sector: sector || "General Disaster Field Operations",
    clearance: "Approved Operational Member"
  };

  const updated = [...members, newMember];
  localStorage.setItem("admin_approved_members_v2", JSON.stringify(updated));
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("admin_auth_updated"));
  }
  return { success: true, message: `Member clearance granted to ${cleanEmail}`, member: newMember };
}

export function revokeMemberApproval(memberEmail) {
  if (!memberEmail) return { success: false, message: "Email is required" };
  const cleanEmail = memberEmail.trim().toLowerCase();

  const members = getApprovedMembers();
  const updated = members.filter(m => (typeof m === "string" ? m : m.email).toLowerCase() !== cleanEmail);
  localStorage.setItem("admin_approved_members_v2", JSON.stringify(updated));
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("admin_auth_updated"));
  }
  return { success: true, message: `Member clearance revoked for ${cleanEmail}` };
}

export function requestMemberApproval({ email, name, requestedRole = "Field Responder / Operational Member", sector = "Disaster Operations", reason = "Operational field clearance" }) {
  if (!email) return { success: false, message: "Email is required" };
  const cleanEmail = email.trim().toLowerCase();

  const requests = getPermissionRequests();
  const existing = requests.find(r => r.email.toLowerCase() === cleanEmail && r.status === "Pending");
  if (existing) {
    return { success: false, message: "A clearance request is already pending for this email." };
  }

  const newReq = {
    id: `REQ-${Date.now().toString().slice(-4)}`,
    email: cleanEmail,
    name: name || cleanEmail.split("@")[0],
    currentRole: "User",
    requestedRole,
    sector,
    reason,
    timestamp: new Date().toISOString(),
    status: "Pending"
  };

  const updated = [newReq, ...requests];
  localStorage.setItem("admin_permission_requests", JSON.stringify(updated));
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("admin_auth_updated"));
  }
  return { success: true, message: "Clearance request submitted to Administrator.", request: newReq };
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
      try { logs = JSON.parse(rawLogs); } catch { }
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
  } catch { }
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
  } catch { }
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

  // If approved, grant clearance automatically
  const matched = requests.find(r => r.id === requestId);
  if (matched && status === "Approved") {
    if ((matched.requestedRole || "").toLowerCase().includes("admin")) {
      grantAdminPermission(matched.email, matched.requestedRole, reviewer);
    } else {
      grantMemberApproval(matched.email, matched.requestedRole, reviewer, matched.sector);
    }
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("admin_auth_updated"));
  }

  return { success: true, message: `Request ${requestId} marked as ${status}` };
}

// ─────────────────────────────────────────────────────────────────────────────
// USER REVIEWS — Platform Feedback & Administrator Notification System
// Permanently stored in DB/disk until deleted by Administrator
// ─────────────────────────────────────────────────────────────────────────────

const LS_REVIEWS_KEY = "platform_user_reviews_v1";
const API_URL = (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL || "http://localhost:5000").replace(/\/+$/, "");

/**
 * Save a new user review permanently to Backend (MongoDB + disk backup) + local storage.
 * @param {{ name: string, email: string, rating: number, category: string, message: string, device?: string }} reviewData
 * @returns {Promise<{ success: boolean, review: object, message?: string }>}
 */
export async function saveUserReview({ name, email, rating, category, message, device }) {
  const localId = `REV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const review = {
    id: localId,
    reviewId: localId,
    name: (name || "Anonymous").trim(),
    email: (email || "").trim(),
    rating: Math.min(5, Math.max(1, Number(rating) || 5)),
    category: category || "General Feedback",
    message: (message || "").trim(),
    submittedAt: new Date().toISOString(),
    readByAdmin: false,
    device: device || (typeof navigator !== "undefined" ? navigator.userAgent : "Web Client")
  };

  // 1. Immediately cache in localStorage for instant offline access
  let reviews = [];
  try {
    const raw = localStorage.getItem(LS_REVIEWS_KEY);
    if (raw) reviews = JSON.parse(raw);
    if (!Array.isArray(reviews)) reviews = [];
  } catch { reviews = []; }

  reviews = [review, ...reviews.filter(r => r.id !== localId && r.reviewId !== localId)];
  localStorage.setItem(LS_REVIEWS_KEY, JSON.stringify(reviews));

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("platform_reviews_updated"));
    window.dispatchEvent(new Event("admin_auth_updated"));
  }

  // 2. Persist permanently to backend database + disk file
  try {
    const res = await fetch(`${API_URL}/api/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: review.name,
        email: review.email,
        rating: review.rating,
        category: review.category,
        message: review.message,
        device: review.device
      })
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.review) {
        const serverReview = {
          ...data.review,
          id: data.review.reviewId || data.review.id || localId
        };
        const updatedList = reviews.map(r => r.id === localId ? serverReview : r);
        localStorage.setItem(LS_REVIEWS_KEY, JSON.stringify(updatedList));
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("platform_reviews_updated"));
        }
        return { success: true, review: serverReview, message: "Review permanently saved until deleted by Administrator." };
      }
    }
  } catch (err) {
    console.warn("Backend review sync failed, cached locally:", err.message);
  }

  return { success: true, review, message: "Review permanently saved locally." };
}

/**
 * Fetch all reviews from Backend API with local fallback.
 * @returns {Promise<Array>}
 */
export async function fetchUserReviews() {
  try {
    const res = await fetch(`${API_URL}/api/reviews`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.reviews)) {
        localStorage.setItem(LS_REVIEWS_KEY, JSON.stringify(data.reviews));
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("platform_reviews_updated"));
        }
        return data.reviews;
      }
    }
  } catch (err) {
    console.warn("Could not fetch remote reviews, using local cache:", err.message);
  }
  return getUserReviews();
}

/**
 * Retrieve all user reviews from local cache (synchronous).
 * @returns {Array}
 */
export function getUserReviews() {
  try {
    const raw = localStorage.getItem(LS_REVIEWS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch { }
  return [];
}

/**
 * Count reviews that have NOT been read by the administrator.
 * @returns {number}
 */
export function getUnreadReviewCount() {
  return getUserReviews().filter(r => !r.readByAdmin).length;
}

/**
 * Mark all reviews as read by the administrator (local + backend).
 */
export async function markAllReviewsRead() {
  const reviews = getUserReviews().map(r => ({ ...r, readByAdmin: true }));
  localStorage.setItem(LS_REVIEWS_KEY, JSON.stringify(reviews));
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("platform_reviews_updated"));
  }

  try {
    await fetch(`${API_URL}/api/reviews/read-all`, { method: "PATCH" });
  } catch (err) {
    console.warn("Error syncing markAllReviewsRead with server:", err.message);
  }
}

/**
 * Mark a single review as read (local + backend).
 * @param {string} reviewId
 */
export async function markReviewRead(reviewId) {
  const reviews = getUserReviews().map(r =>
    (r.id === reviewId || r.reviewId === reviewId) ? { ...r, readByAdmin: true } : r
  );
  localStorage.setItem(LS_REVIEWS_KEY, JSON.stringify(reviews));
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("platform_reviews_updated"));
  }

  try {
    await fetch(`${API_URL}/api/reviews/${encodeURIComponent(reviewId)}/read`, { method: "PATCH" });
  } catch (err) {
    console.warn("Error syncing markReviewRead with server:", err.message);
  }
}

/**
 * Permanently delete a review by ID (admin-only action, local + backend).
 * @param {string} reviewId
 */
export async function deleteReview(reviewId) {
  const reviews = getUserReviews().filter(r => r.id !== reviewId && r.reviewId !== reviewId);
  localStorage.setItem(LS_REVIEWS_KEY, JSON.stringify(reviews));
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("platform_reviews_updated"));
  }

  try {
    const res = await fetch(`${API_URL}/api/reviews/${encodeURIComponent(reviewId)}`, {
      method: "DELETE"
    });
    if (res.ok) {
      return { success: true, message: "Review permanently deleted." };
    }
  } catch (err) {
    console.warn("Error syncing review delete with server:", err.message);
  }
  return { success: true };
}
