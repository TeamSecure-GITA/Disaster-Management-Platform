import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';
import { setupAutoSync } from './utils/syncService';

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

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);