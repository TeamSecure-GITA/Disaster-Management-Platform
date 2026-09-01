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
//     so the SOS is synced automatically when connectivity is restored.
// ─────────────────────────────────────────────────────────────────────────────

import { auth } from "../firebase";
import { saveOfflineReport } from "./offlineStorage";

// CERT-In (Indian Computer Emergency Response Team) portal — used as the
// official redirect destination when a security threat is detected.
const CERT_IN_URL = "https://www.cert-in.org.in";

// Backend base URL — reads from Vite env so it works in dev and production.
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

// ─── Token resolution ─────────────────────────────────────────────────────────

/**
 * Get a fresh Firebase ID token for the currently signed-in Firebase user.
 * Falls back to the JWT stored in localStorage (set by the custom auth flow)
 * so the function works even when the user didn't sign in with Firebase directly.
 *
 * @returns {Promise<string|null>}
 */
const getAuthToken = async () => {
  try {
    const firebaseUser = auth.currentUser;
    if (firebaseUser) {
      // forceRefresh=true ensures an expired token is renewed automatically.
      return await firebaseUser.getIdToken(/* forceRefresh */ true);
    }
  } catch (err) {
    console.warn("[sosService] Firebase getIdToken failed:", err.message);
  }

  // Fallback: JWT from the platform's own login stored in offlineStorage/localStorage
  const session = JSON.parse(localStorage.getItem("user_session") || "null");
  return session?.token || null;
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
    response = await fetch(`${API_BASE}/api/sos`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(15_000), // 15 s timeout
    });

    data = await response.json();
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

  // ── 6. Generic HTTP error ───────────────────────────────────────────────────
  if (!response.ok) {
    return {
      success: false,
      error: data?.message || `Server error (${response.status}).`,
    };
  }

  // ── 7. Success ──────────────────────────────────────────────────────────────
  console.log("[sosService] SOS submitted successfully:", data);
  return { success: true, data };
};

// ─── Offline sync flush ───────────────────────────────────────────────────────

/**
 * Flush any SOS reports queued while offline.
 * Call this once on app load after the network-online event fires.
 *
 * @returns {Promise<number>} Number of records successfully synced
 */
const flushOfflineSOSQueue = async () => {
  const { getOfflineReports, clearOfflineReports } = await import("./offlineStorage");
  const pending = await getOfflineReports();
  const sosPending = pending.filter((r) => r.type === "sos");

  if (sosPending.length === 0) return 0;

  let synced = 0;
  for (const record of sosPending) {
    const result = await sendDataToBackend(record.payload);
    if (result.success) synced++;
  }

  // Clear the whole queue — successfully synced items are done, failed items
  // will be re-queued on the next offline → online cycle.
  await clearOfflineReports();

  console.log(`[sosService] Offline flush complete — ${synced}/${sosPending.length} synced.`);
  return synced;
};

export { sendDataToBackend, flushOfflineSOSQueue, getAuthToken };
