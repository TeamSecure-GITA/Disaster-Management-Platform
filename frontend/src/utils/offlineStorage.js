// ─────────────────────────────────────────────────────────────────────────────
// src/utils/offlineStorage.js
//
// IndexedDB-backed offline storage via localforage.
// Covers:
//   1. Offline Hazard / Incident Reports (queue + media compression)
//   2. Offline Family-safety operations queue  (for /api/sync/batch)
//   3. User auth session cache
//   4. Generic key-value store for cached API responses
// ─────────────────────────────────────────────────────────────────────────────
import localforage from 'localforage';

// ── Stable per-device identifier ─────────────────────────────────────────────
export const DEVICE_ID = (() => {
  try {
    let id = localStorage.getItem('__device_id__');
    if (!id) {
      id = 'dev-' + Math.random().toString(36).slice(2) + '-' + Date.now();
      localStorage.setItem('__device_id__', id);
    }
    return id;
  } catch { return 'unknown-device'; }
})();

function genId() {
  return 'op-' + Math.random().toString(36).slice(2) + '-' + Date.now();
}

// ── Store instances (each in its own IDB object-store) ───────────────────────
const reportStore = localforage.createInstance({
  name: 'DisasterPlatformDB',
  storeName: 'pending_incident_reports',
});

const familyStore = localforage.createInstance({
  name: 'DisasterPlatformDB',
  storeName: 'pending_family_ops',
});

const sessionStore = localforage.createInstance({
  name: 'DisasterPlatformDB',
  storeName: 'user_session_v2',
});

const cacheStore = localforage.createInstance({
  name: 'DisasterPlatformDB',
  storeName: 'api_response_cache',
});

// ─────────────────────────────────────────────────────────────────────────────
// § 1. MEDIA COMPRESSION  (canvas-based, zero external deps)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Compress a File/Blob to a JPEG data-URL with bounded dimensions.
 * @param {File|Blob} file
 * @param {{ maxWidth?, maxHeight?, quality? }} opts
 * @returns {Promise<string>}  data:image/jpeg;base64,…
 */
export async function compressImage(file, { maxWidth = 1280, maxHeight = 960, quality = 0.72 } = {}) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result;
      if (!src || typeof document === 'undefined') { resolve(src); return; }
      const img = new Image();
      img.onload = () => {
        const ratio = Math.min(maxWidth / img.width, maxHeight / img.height, 1);
        const w = Math.round(img.width * ratio);
        const h = Math.round(img.height * ratio);
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => resolve(src);
      img.src = src;
    };
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
}

/** Compress up to maxFiles File objects in parallel. Returns [{name,type,dataUrl,compressed}] */
export async function compressMediaFiles(files = [], maxFiles = 3) {
  const limited = Array.from(files).slice(0, maxFiles);
  return Promise.all(limited.map(async (f) => {
    const isImage = f.type.startsWith('image/');
    const dataUrl = isImage ? await compressImage(f) : await _toDataUrl(f);
    return { name: f.name, type: f.type, dataUrl, compressed: isImage };
  }));
}

function _toDataUrl(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result ?? null);
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// § 2. OFFLINE INCIDENT REPORTS QUEUE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Enqueue an incident report. Media files are compressed before IDB storage.
 * @param {Object}  reportData  – form fields (type, description, location, …)
 * @param {File[]}  mediaFiles  – raw File objects
 * @returns {Promise<string>}   operationId for dedup / tracking
 */
export async function saveOfflineReport(reportData, mediaFiles = []) {
  try {
    const operationId = reportData.operationId || genId();
    const media = await compressMediaFiles(mediaFiles);
    const entry = {
      ...reportData,
      media: (reportData.media && reportData.media.length) ? reportData.media : media,
      operationId,
      deviceId: DEVICE_ID,
      clientCreatedAt: reportData.clientCreatedAt || new Date().toISOString(),
      resource: reportData.resource || (reportData.type === 'sos' ? 'sos' : 'incident'),
      action: reportData.action || 'create',
      status: 'pending',
    };
    const queue = (await reportStore.getItem('queue')) || [];
    queue.push(entry);
    await reportStore.setItem('queue', queue);
    return operationId;
  } catch (e) { console.error('[OfflineStorage] saveOfflineReport:', e); throw e; }
}

export const getOfflineReports = async () => {
  try { return (await reportStore.getItem('queue')) || []; }
  catch (e) { console.error('[OfflineStorage] getOfflineReports:', e); return []; }
};

/** Remove reports whose operationIds or ids are in `ids`. */
export async function removeOfflineReports(ids = []) {
  try {
    const s = new Set((ids || []).filter(Boolean));
    const remaining = ((await reportStore.getItem('queue')) || []).filter(
      (r) => !s.has(r.operationId) && !s.has(r.id)
    );
    await reportStore.setItem('queue', remaining);
  } catch (e) { console.error('[OfflineStorage] removeOfflineReports:', e); }
}

/** Mark reports as "uploading" to prevent double-submit. */
export async function markReportsUploading(ids = []) {
  try {
    const s = new Set(ids);
    const queue = (await reportStore.getItem('queue')) || [];
    queue.forEach((r) => { if (s.has(r.operationId)) r.status = 'uploading'; });
    await reportStore.setItem('queue', queue);
  } catch (e) { console.error('[OfflineStorage] markReportsUploading:', e); }
}

/** Revert "uploading" → "pending" after a network error. */
export async function revertReportsUploading(ids = []) {
  try {
    const s = new Set(ids);
    const queue = (await reportStore.getItem('queue')) || [];
    queue.forEach((r) => { if (s.has(r.operationId) && r.status === 'uploading') r.status = 'pending'; });
    await reportStore.setItem('queue', queue);
  } catch (e) { console.error('[OfflineStorage] revertReportsUploading:', e); }
}

/** Legacy alias. */
export const clearOfflineReports = async () => {
  try { await reportStore.removeItem('queue'); }
  catch (e) { console.error('[OfflineStorage] clearOfflineReports:', e); }
};

// ─────────────────────────────────────────────────────────────────────────────
// § 3. OFFLINE FAMILY-SAFETY OPERATIONS QUEUE
// ─────────────────────────────────────────────────────────────────────────────

export async function saveOfflineFamilyOp(action, payload) {
  try {
    const entry = {
      operationId: genId(), deviceId: DEVICE_ID,
      clientCreatedAt: new Date().toISOString(),
      resource: 'family', action, payload, status: 'pending',
    };
    const queue = (await familyStore.getItem('queue')) || [];
    queue.push(entry);
    await familyStore.setItem('queue', queue);
    return entry.operationId;
  } catch (e) { console.error('[OfflineStorage] saveOfflineFamilyOp:', e); throw e; }
}

export const getOfflineFamilyOps = async () => {
  try { return (await familyStore.getItem('queue')) || []; }
  catch (e) { console.error('[OfflineStorage] getOfflineFamilyOps:', e); return []; }
};

export async function removeOfflineFamilyOps(ids = []) {
  try {
    const s = new Set(ids);
    const remaining = ((await familyStore.getItem('queue')) || []).filter((op) => !s.has(op.operationId));
    await familyStore.setItem('queue', remaining);
  } catch (e) { console.error('[OfflineStorage] removeOfflineFamilyOps:', e); }
}

// ─────────────────────────────────────────────────────────────────────────────
// § 4. USER AUTH SESSION
// ─────────────────────────────────────────────────────────────────────────────

export const saveOfflineSession = async (userData) => {
  try {
    await sessionStore.setItem('user_session', userData);
    await sessionStore.setItem('user_preferences', userData.preferences || {});
  } catch (e) { console.error('[OfflineStorage] saveOfflineSession:', e); }
};

export const getOfflineSession = async () => {
  try { return await sessionStore.getItem('user_session'); }
  catch (e) { console.error('[OfflineStorage] getOfflineSession:', e); return null; }
};

export const clearOfflineSession = async () => {
  try {
    await sessionStore.removeItem('user_session');
    await sessionStore.removeItem('user_preferences');
  } catch (e) { console.error('[OfflineStorage] clearOfflineSession:', e); }
};

// ─────────────────────────────────────────────────────────────────────────────
// § 5. GENERIC API RESPONSE CACHE
// ─────────────────────────────────────────────────────────────────────────────

export const cacheApiResponse = async (key, data, ttlSeconds = 86400) => {
  try {
    await cacheStore.setItem(key, { data, expiresAt: Date.now() + ttlSeconds * 1000 });
  } catch (e) { console.error('[OfflineStorage] cacheApiResponse:', e); }
};

export const getCachedApiResponse = async (key) => {
  try {
    const entry = await cacheStore.getItem(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) { await cacheStore.removeItem(key); return null; }
    return entry.data;
  } catch (e) { console.error('[OfflineStorage] getCachedApiResponse:', e); return null; }
};

// ─────────────────────────────────────────────────────────────────────────────
// § 6. NE-REGION TILE BBOX
// ─────────────────────────────────────────────────────────────────────────────
// Bounding box for all 8 North-East Indian states (Assam, Arunachal Pradesh,
// Manipur, Meghalaya, Mizoram, Nagaland, Sikkim, Tripura).
export const NE_REGION_BBOX = {
  minLat: 21.9, maxLat: 29.5,
  minLng: 88.0, maxLng: 97.5,
  minZoom: 6,   maxZoom: 10,
};

/**
 * Enumerate OSM tile URLs covering NE_REGION_BBOX at zoom levels 6–10.
 * Used by vite.config to populate the SW precache list.
 */
export function listNERegionTileUrls(subdomains = ['a', 'b', 'c']) {
  const { minLat, maxLat, minLng, maxLng, minZoom, maxZoom } = NE_REGION_BBOX;
  const urls = [];
  for (let z = minZoom; z <= maxZoom; z++) {
    const xMin = _lngToTile(minLng, z), xMax = _lngToTile(maxLng, z);
    const yMin = _latToTile(maxLat, z), yMax = _latToTile(minLat, z); // y inverted
    for (let x = xMin; x <= xMax; x++) {
      for (let y = yMin; y <= yMax; y++) {
        const sub = subdomains[(x + y) % subdomains.length];
        urls.push(`https://${sub}.tile.openstreetmap.org/${z}/${x}/${y}.png`);
      }
    }
  }
  return urls;
}

function _lngToTile(lng, z) { return Math.floor((lng + 180) / 360 * 2 ** z); }
function _latToTile(lat, z) {
  const r = lat * Math.PI / 180;
  return Math.floor((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2 * 2 ** z);
}

/**
 * Pre-cache OSM map tiles for the North-East Region (NER) into CacheStorage.
 * Stores in the 'offline-map-tiles' cache so Leaflet/OSM maps work without internet.
 *
 * @param {Function} [onProgress] - (cachedCount, totalCount) => void
 * @param {number} [maxZoom=8]    - Target zoom level (zoom 6-8 covers all NER state boundaries & major towns)
 * @returns {Promise<{ total: number, cached: number }>}
 */
export async function preCacheNERegionTiles(onProgress, maxZoom = 8) {
  if (typeof window === 'undefined' || !('caches' in window)) {
    return { total: 0, cached: 0 };
  }

  const { minLat, maxLat, minLng, maxLng, minZoom } = NE_REGION_BBOX;
  const targetMaxZoom = Math.min(maxZoom, 9);
  const urls = [];

  for (let z = minZoom; z <= targetMaxZoom; z++) {
    const xMin = _lngToTile(minLng, z);
    const xMax = _lngToTile(maxLng, z);
    const yMin = _latToTile(maxLat, z);
    const yMax = _latToTile(minLat, z);
    for (let x = xMin; x <= xMax; x++) {
      for (let y = yMin; y <= yMax; y++) {
        urls.push(`https://a.tile.openstreetmap.org/${z}/${x}/${y}.png`);
      }
    }
  }

  const cache = await caches.open('offline-map-tiles');
  let cached = 0;
  const total = urls.length;

  // Fetch in batches of 6 concurrent requests to prevent network saturation
  const batchSize = 6;
  for (let i = 0; i < urls.length; i += batchSize) {
    const batch = urls.slice(i, i + batchSize);
    await Promise.all(
      batch.map(async (url) => {
        try {
          const match = await cache.match(url);
          if (!match) {
            const resp = await fetch(url, { mode: 'no-cors' });
            await cache.put(url, resp);
          }
          cached++;
          if (onProgress) onProgress(cached, total);
        } catch (e) {
          // Ignore individual tile failure (e.g. flaky connection)
          cached++;
        }
      })
    );
  }

  console.log(`[OfflineStorage] Pre-cached ${cached}/${total} NER map tiles.`);
  return { total, cached };
}
