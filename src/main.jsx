import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register'; // <-- ADD THIS
import { setupAutoSync } from './utils/syncService';

// Initialize auto-sync listener
setupAutoSync();
registerSW({ immediate: true }); // <-- ADD THIS

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);