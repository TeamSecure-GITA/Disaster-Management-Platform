// ─────────────────────────────────────────────────────────────────────────────
// src/utils/sosService.js
//
// Handles the full SOS submission pipeline:
//
//  1. Attaches the Firebase ID token (or JWT from localStorage as fallback)
//     so the backend's `protect` middleware can identify the user.
//
//  2. Calls POST /api/sos — the correct backend route (not /api/v1/sos).
//
//  3. Handles the 403 + data.blocked threat-block response: shows an alert
//     and redirects to the CERT-In cyber security portal.
//
//  4. Falls back to offline queue (localforage) when the device has no network
//     OR when the backend returns 503 (DB unavailable), so the SOS is synced
//     automatically when connectivity/service is restored.
//
// Bug-fixes applied:
//   - AbortSignal.timeout() not available in Safari <16.4 / Node <17.3
//     → replaced with AbortController + setTimeout fallback
//   - flushOfflineSOSQueue cleared ALL pending records even when some failed
//     → now only removes records that successfully synced
//   - getAuthToken() read user_session from localStorage but offlineStorage.js
//     stores sessions in localforage (IndexedDB), not localStorage
//     → now checks both sources
//   - 503 (DB unavailable) was surfaced as a generic error to the user
//     → now queued offline the same way as a network failure
// ─────────────────────────────────────────────────────────────────────────────

import { auth } from "../firebase";
import { saveOfflineReport, getOfflineReports, clearOfflineReports } from "./offlineStorage";

// CERT-In (Indian Computer Emergency Response Team) portal — used as the
// official redirect destination when a security threat is detected.
const CERT_IN_URL = "https://www.cert-in.org.in";

// Backend base URL — sanitized and stripped of any trailing slashes.
const getBaseApiUrl = () => {
  let url = (import.meta.env.VITE_API_URL || "").trim();
  if (!url && import.meta.env.DEV) {
    url = "http://localhost:5000";
  }
  return url.replace(/\/+$/, "");
};

const API_BASE = getBaseApiUrl();

const buildApiUrl = (endpoint) => {
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const normalizedEndpoint = cleanEndpoint.replace(/^\/+/, "/");
  return API_BASE ? `${API_BASE}${normalizedEndpoint}` : normalizedEndpoint;
};

// ─── Timeout helper ────────────────────────────────────────────────────────────
// AbortSignal.timeout() was introduced in Chrome 103 / Safari 16 / Node 17.3.
// Use a manual AbortController fallback for older environments.

const timeoutSignal = (ms) => {
  // Use the native API when available
  if (typeof AbortSignal.timeout === "function") {
    return AbortSignal.timeout(ms);
  }

  const controller = new AbortController();
  setTimeout(() => controller.abort(), ms);
  return controller.signal;
};

// ─── Token resolution ─────────────────────────────────────────────────────────

const getAuthToken = async () => {
  try {
    // 1. Direct JWT stored in localStorage / sessionStorage
    const directToken =
      localStorage.getItem("token") ||
      sessionStorage.getItem("token") ||
      localStorage.getItem("jwtToken");
    if (directToken) return directToken;

    // 2. JWT in user_session JSON stored in localStorage
    const sessionStr = localStorage.getItem("user_session");
    if (sessionStr) {
      try {
        const session = JSON.parse(sessionStr);
        if (session?.token) return session.token;
      } catch (_) {}
    }

    // 3. JWT in user_session stored via localforage (IndexedDB)
    //    — offlineStorage.saveOfflineSession() writes here, NOT to localStorage
    try {
      const { default: localforage } = await import("localforage");
      const session = await localforage.getItem("user_session");
      if (session?.token) return session.token;
    } catch (_) {}

    // 4. Firebase Auth Token
    if (auth && auth.currentUser) {
      return await auth.currentUser.getIdToken(/* forceRefresh */ false);
    }
  } catch (err) {
    console.warn("[sosService] Token resolution error:", err.message);
  }

  return null;
};

// ─── Threat-block handler ─────────────────────────────────────────────────────

/**
 * Show an alert and redirect to CERT-In when the backend returns a
 * 403 + { blocked: true } threat-block response.
 *
 * @param {{ message?: string, redirectUrl?: string }} data
 */
const handleThreatBlock = (data) => {
  const message =
    data.message ||
    "Suspicious activity detected. Redirecting to Cyber Security Authority...";
  const destination = data.redirectUrl || CERT_IN_URL;

  alert(`🔒 SECURITY ALERT\n\n${message}`);
  window.location.href = destination;
};

// ─── Core send function ───────────────────────────────────────────────────────

/**
 * Send SOS payload to the backend.
 *
 * @param {object}  payload           - SOS data (latitude, longitude, message, emergencyType, …)
 * @param {object}  [options]
 * @param {boolean} [options.skipAuth=false] - Skip token injection (e.g. anonymous mode)
 * @returns {Promise<{ success: boolean, data?: object, error?: string, offline?: boolean }>}
 */
const sendDataToBackend = async (payload, { skipAuth = false } = {}) => {
  // ── 1. Offline guard ────────────────────────────────────────────────────────
  if (!navigator.onLine) {
    console.warn("[sosService] Device is offline — queuing SOS for later sync.");
    await saveOfflineReport({
      type: "sos",
      payload,
      queuedAt: new Date().toISOString(),
    });
    return {
      success: false,
      offline: true,
      error: "Device is offline. SOS saved locally and will sync automatically.",
    };
  }

  // ── 2. Build request headers ────────────────────────────────────────────────
  const headers = { "Content-Type": "application/json" };

  if (!skipAuth) {
    const token = await getAuthToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  // ── 3. Send to backend ──────────────────────────────────────────────────────
  let response;
  let data;

  try {
    const url = buildApiUrl("/api/sos");
    response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
      // BUG FIX: AbortSignal.timeout() crashes on Safari <16.4 and Node <17.3
      signal: timeoutSignal(15_000),
    });

    data = await response.json();

    // ── If backend rejected a stale or unrecognized auth token, retry anonymously ──
    if (response.status === 401 && !skipAuth) {
      console.warn("[sosService] Token rejected by backend. Retrying SOS as emergency guest...");
      return sendDataToBackend(payload, { skipAuth: true });
    }
  } catch (err) {
    // Network failure mid-flight — queue offline
    console.error("[sosService] Network error:", err);
    await saveOfflineReport({
      type: "sos",
      payload,
      queuedAt: new Date().toISOString(),
      error: err.message,
    });
    return {
      success: false,
      offline: true,
      error: "Network error — SOS queued for retry.",
    };
  }

  // ── 4. Security threat block (403 + data.blocked) ──────────────────────────
  if (response.status === 403 && data?.blocked) {
    handleThreatBlock(data);
    return { success: false, error: "Threat block — redirected to CERT-In." };
  }

  // ── 5. Rate-limit hit (429) ─────────────────────────────────────────────────
  if (response.status === 429) {
    return {
      success: false,
      error: data?.message || "Too many SOS requests. Please wait before trying again.",
      rateLimited: true,
    };
  }

  // ── 6. Service unavailable (503) — DB down, queue offline ──────────────────
  //    BUG FIX: previously this fell through to the generic error handler and
  //    surfaced a confusing "Internal server error." message to the user.
  if (response.status === 503) {
    console.warn("[sosService] Backend DB unavailable — queuing SOS offline.");
    await saveOfflineReport({
      type: "sos",
      payload,
      queuedAt: new Date().toISOString(),
      error: "Backend DB unavailable",
    });
    return {
      success: false,
      offline: true,
      error: data?.message || "Service temporarily unavailable. SOS queued locally and will sync automatically.",
    };
  }

  // ── 7. Generic HTTP error ───────────────────────────────────────────────────
  if (!response.ok) {
    return {
      success: false,
      error: data?.message || `Server error (${response.status}).`,
    };
  }

  // ── 8. Success ──────────────────────────────────────────────────────────────
  console.log("[sosService] SOS submitted successfully:", data);
  return { success: true, data };
};

// ─── Offline sync flush ───────────────────────────────────────────────────────

/**
 * Flush any SOS reports queued while offline.
 * Call this once on app load after the network-online event fires.
 *
 * BUG FIX: Previously cleared the ENTIRE queue after attempting syncs, so any
 * record that failed to sync was permanently lost. Now only removes records
 * that were successfully synced; failed records stay in the queue for the next
 * online event.
 *
 * @returns {Promise<number>} Number of records successfully synced
 */
const flushOfflineSOSQueue = async () => {
  const pending = await getOfflineReports();
  const sosPending = pending.filter((r) => r.type === "sos");

  if (sosPending.length === 0) return 0;

  let synced = 0;
  const failed = [];

  for (const record of sosPending) {
    const result = await sendDataToBackend(record.payload);
    if (result.success) {
      synced++;
    } else {
      // Keep failed records — they will be retried on the next online event.
      // Strip the offline-specific wrapper and preserve the original payload.
      failed.push(record);
    }
  }

  // Remove ALL SOS records from the queue…
  await clearOfflineReports();

  // …then re-add the ones that still failed (preserving non-SOS records
  // implicitly because clearOfflineReports only removes 'pending_reports').
  for (const record of failed) {
    await saveOfflineReport(record);
  }

  console.log(`[sosService] Offline flush complete — ${synced}/${sosPending.length} synced, ${failed.length} re-queued.`);
  return synced;
};

export { sendDataToBackend, flushOfflineSOSQueue, getAuthToken };
