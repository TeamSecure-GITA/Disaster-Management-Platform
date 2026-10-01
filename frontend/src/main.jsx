import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';
import { setupAutoSync, flushAllQueues } from './utils/syncService';
import { initFCM } from './services/fcmService';

// Initialize offline auto-sync listener for queued reports and tickets
setupAutoSync();

// Register PWA Service Worker for zero-latency offline operation
const updateSW = registerSW({
  onNeedRefresh() {
    console.log('[PWA] New platform version available. Updating service worker...');
    updateSW(true);
  },
  onOfflineReady() {
    console.log('[PWA] Disaster Management Platform is ready to work fully offline.');
  },
  immediate: true,
});

// ── Background Sync relay ────────────────────────────────────────────────────
// The SW cannot run localforage directly, so it postMessages us when the
// browser fires its 'sync' event, and we perform the actual queue flush here.
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('message', async (event) => {
    if (event.data?.type === 'DMP_BACKGROUND_SYNC') {
      console.log('[App] SW-delegated Background Sync received:', event.data.tag);
      const token = localStorage.getItem('authToken') || localStorage.getItem('token') || null;
      const result = await flushAllQueues(token);

      // Acknowledge to SW
      event.source?.postMessage({ type: 'DMP_SYNC_ACK', result });

      // Notify UI components (toast / status bar)
      window.dispatchEvent(new CustomEvent('dmp:sync-complete', { detail: result }));
    }
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Initialize Firebase Cloud Messaging after app mounts.
// Requests notification permission and registers FCM token with backend.
// Done after render so it doesn't block the initial paint.
initFCM().catch((err) => {
  console.warn('[FCM] Background init failed (non-fatal):', err);
});