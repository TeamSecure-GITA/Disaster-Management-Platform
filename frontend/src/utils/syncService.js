// ─────────────────────────────────────────────────────────────────────────────
// src/utils/syncService.js
//
// Offline-to-online synchronisation for the Disaster Management Platform.
//
// Strategy
// ────────
//  Primary:  Web Background Sync API (SyncManager) — fires in the background
//            as soon as connectivity is restored, even when tab is closed.
//  Fallback: window 'online' event — uploads the queue immediately in-tab.
//
// Queues managed
// ──────────────
//  - Incident reports  → POST /api/sync/batch (resource: incident) with fallback to POST /api/incidents
//  - Family-safety ops → POST /api/sync/batch (resource: family)
//
// Conflict resolution
// ───────────────────
//  - Every item carries operationId, deviceId, and clientCreatedAt timestamp.
//  - Deduplicated idempotently by operationId on the server.
//  - Concurrent updates are resolved via Last-Write-Wins (LWW) with authoritative
//    operator/authority override for escalated/resolved statuses.
//  - Incremental sync pulls server updates via GET /api/sync/changes.
// ─────────────────────────────────────────────────────────────────────────────

import {
  getOfflineReports,
  removeOfflineReports,
  markReportsUploading,
  revertReportsUploading,
  getOfflineFamilyOps,
  removeOfflineFamilyOps,
  cacheApiResponse,
  DEVICE_ID,
} from './offlineStorage';

/** Background Sync tag names — must match the SW listener */
export const SYNC_TAG_INCIDENTS = 'offline-incident-sync';
export const SYNC_TAG_FAMILY    = 'offline-family-sync';

// ─────────────────────────────────────────────────────────────────────────────
// § 1. REGISTER WITH BACKGROUND SYNC API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Ask the SW to fire a 'sync' event for the given tag when online.
 */
async function requestBackgroundSync(tag) {
  try {
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      const reg = await navigator.serviceWorker.ready;
      await reg.sync.register(tag);
      console.log(`[Sync] Background Sync registered: ${tag}`);
    }
  } catch (e) {
    console.warn('[Sync] BackgroundSync registration failed (will rely on online event):', e);
  }
}

/** Call after saving any offline item to schedule a background sync. */
export async function scheduleSync() {
  await requestBackgroundSync(SYNC_TAG_INCIDENTS);
  await requestBackgroundSync(SYNC_TAG_FAMILY);
}

// ─────────────────────────────────────────────────────────────────────────────
// § 2. UPLOAD INCIDENT QUEUE  →  POST /api/sync/batch & POST /api/incidents
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Upload all "pending" incident reports.
 * Uses /api/sync/batch for batched transactional processing with conflict handling.
 * Fallbacks to individual /api/incidents if batch fails.
 */
export async function flushIncidentQueue(authToken) {
  const reports = (await getOfflineReports()).filter((r) => r.status === 'pending');
  if (reports.length === 0) return { uploaded: [], failed: [], conflicts: [] };

  const ids = reports.map((r) => r.operationId);
  await markReportsUploading(ids);

  const uploaded = [];
  const failed   = [];
  const conflicts = [];

  // Try /api/sync/batch first
  try {
    const operations = reports.map((r) => ({
      operationId: r.operationId,
      resource: 'incident',
      action: r.action || 'create',
      payload: {
        incidentType: r.type || r.incidentType,
        severity: (r.severity || 'medium').toLowerCase(),
        description: r.description,
        location: r.location,
        locationMeta: r.locationMeta || {},
        affectedPeople: r.affectedPeople,
        witnessCount: r.affectedPeople || r.witnessCount,
        isRoadBlocked: r.roadStatus === 'Completely Blocked' || r.isRoadBlocked,
        crackWidth: r.crackWidth,
        crackLength: r.crackLength,
        slopeTrend: r.slopeTrend,
        roadStatus: r.roadStatus,
        media: r.media || [],
      },
      clientCreatedAt: r.clientCreatedAt || new Date().toISOString(),
    }));

    const headers = { 'Content-Type': 'application/json' };
    if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

    const batchRes = await fetch('/api/sync/batch', {
      method: 'POST',
      headers,
      body: JSON.stringify({ deviceId: DEVICE_ID, operations }),
    });

    if (batchRes.ok) {
      const json = await batchRes.json();
      const data = json.data || json;
      const acceptedOps = data.accepted || [];
      const rejectedOps = data.rejected || [];

      for (const op of acceptedOps) {
        uploaded.push(op.operationId);
        if (op.status === 'conflict' || op.conflictResolution === 'server_wins') {
          conflicts.push(op);
        }
      }
      for (const op of rejectedOps) {
        failed.push(op.operationId);
      }

      if (uploaded.length) await removeOfflineReports(uploaded);
      if (failed.length) await revertReportsUploading(failed);

      return { uploaded, failed, conflicts };
    }
  } catch (batchErr) {
    console.warn('[Sync] /api/sync/batch error, attempting individual endpoints:', batchErr);
  }

  // Fallback: Individual POST /api/incidents
  for (const report of reports) {
    try {
      const body = JSON.stringify({
        ...report,
        _offlineSync: true,
        deviceId: DEVICE_ID,
      });

      const headers = { 'Content-Type': 'application/json' };
      if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

      const res = await fetch('/api/incidents', {
        method: 'POST',
        headers,
        body,
      });

      if (res.ok || res.status === 409 /* duplicate */) {
        uploaded.push(report.operationId);
      } else {
        failed.push(report.operationId);
      }
    } catch (netErr) {
      console.error('[Sync] Incident network error:', netErr);
      failed.push(report.operationId);
    }
  }

  if (uploaded.length) await removeOfflineReports(uploaded);
  if (failed.length)   await revertReportsUploading(failed);

  return { uploaded, failed, conflicts };
}

// ─────────────────────────────────────────────────────────────────────────────
// § 3. UPLOAD FAMILY OPS QUEUE  →  POST /api/sync/batch
// ─────────────────────────────────────────────────────────────────────────────

export async function flushFamilyOpsQueue(authToken) {
  const ops = await getOfflineFamilyOps();
  if (ops.length === 0) return { accepted: [], rejected: [] };

  try {
    const headers = { 'Content-Type': 'application/json' };
    if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

    const res = await fetch('/api/sync/batch', {
      method: 'POST',
      headers,
      body: JSON.stringify({ deviceId: DEVICE_ID, operations: ops }),
    });

    if (!res.ok) {
      console.warn('[Sync] /api/sync/batch HTTP', res.status);
      return { accepted: [], rejected: ops.map((o) => o.operationId) };
    }

    const data = await res.json();
    const accepted = (data.data?.accepted || data.accepted || []).map((r) => r.operationId);
    await removeOfflineFamilyOps(accepted);

    return { accepted, rejected: data.data?.rejected || data.rejected || [] };
  } catch (netErr) {
    console.error('[Sync] /api/sync/batch network error:', netErr);
    return { accepted: [], rejected: ops.map((o) => o.operationId) };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// § 4. 2-WAY SYNC & CONFLICT PULL  →  GET /api/sync/changes
// ─────────────────────────────────────────────────────────────────────────────

export async function pullServerChanges(authToken) {
  try {
    const lastSync = localStorage.getItem('dmp_last_sync_timestamp') || new Date(0).toISOString();
    const headers = {};
    if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

    const res = await fetch(`/api/sync/changes?since=${encodeURIComponent(lastSync)}`, { headers });
    if (!res.ok) return null;

    const json = await res.json();
    const changes = json.data || json;

    if (changes.serverTime) {
      localStorage.setItem('dmp_last_sync_timestamp', changes.serverTime);
    }

    // Cache latest incident and family state in offline cache
    if (changes.incidents?.length) {
      await cacheApiResponse('latest_incidents', changes.incidents);
    }
    if (changes.family) {
      await cacheApiResponse('family_safety_status', changes.family);
    }

    return changes;
  } catch (e) {
    console.warn('[Sync] pullServerChanges error:', e);
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// § 5. FULL FLUSH
// ─────────────────────────────────────────────────────────────────────────────

export async function flushAllQueues(authToken) {
  const [incResult, famResult] = await Promise.allSettled([
    flushIncidentQueue(authToken),
    flushFamilyOpsQueue(authToken),
  ]);

  // Pull latest updates for 2-way sync
  let serverChanges = null;
  try {
    serverChanges = await pullServerChanges(authToken);
  } catch {}

  const result = {
    incidents: incResult.status === 'fulfilled' ? incResult.value : { uploaded: [], failed: [] },
    family: famResult.status === 'fulfilled' ? famResult.value : { accepted: [], rejected: [] },
    serverChanges,
  };

  return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// § 6. RECONNECT HANDLER  (called once at app boot from main.jsx)
// ─────────────────────────────────────────────────────────────────────────────

function _getToken() {
  try { return localStorage.getItem('authToken') || localStorage.getItem('token') || null; }
  catch { return null; }
}

export function setupAutoSync() {
  window.addEventListener('online', async () => {
    console.log('[Sync] Connection restored — flushing offline queues…');

    // Notify UI
    window.dispatchEvent(new CustomEvent('dmp:reconnected'));

    const token = _getToken();
    const result = await flushAllQueues(token);

    // Notify UI with outcome so toast/banner can be shown
    window.dispatchEvent(new CustomEvent('dmp:sync-complete', { detail: result }));
  });

  // Register Background Sync on load so the SW is primed
  scheduleSync();
}
