# Disaster Management Platform — Frontend Client

A high-performance, offline-first Progressive Web App (PWA) engineered for extreme disaster resilience, geotechnical hazard monitoring, and real-time search & rescue coordination.

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Framework** | React 19 | Component-driven UI with hooks and lazy-loaded code-splitting |
| **Bundler & Dev Server** | Vite 6 | Lightning-fast HMR and optimized production bundling |
| **Routing** | React Router DOM 7 | Declarative client-side routing with URL query-parameter state sync |
| **Styling** | TailwindCSS + Vanilla CSS | Curated HSL dark palette, glassmorphism, responsive grid |
| **Icons** | Lucide React | Clean, accessible SVG iconography |
| **Geospatial Mapping** | Leaflet.js & React-Leaflet | Interactive disaster zones, evacuation routes, and shelter overlays |
| **Data Visualization** | Recharts & HTML5 Canvas | Real-time sensor charts, FFT audio spectrograms, and magnetic void maps |
| **Offline Storage** | IndexedDB (`idb` + `localforage`) | Client-side persistent cache for offline maps, triage records, and queued reports |
| **Service Worker** | `vite-plugin-pwa` (Workbox) | Offline-first asset caching, background sync, and push notifications |
| **Post-Quantum Cryptography** | NIST ML-DSA / ML-KEM | Browser-native lattice cryptography for offline verification |

---

## 📂 Source Directory Structure

```
frontend/src/
├── main.jsx                          # App entry point with ServiceWorker registration
├── App.jsx                           # Master route definitions, RBAC guards, and splash screen
├── App.css / index.css               # Global theme tokens, keyframe animations, low-bandwidth styles
│
├── assets/                           # Official seal and disaster graphics
├── components/                       # Shared UI and tactical components
│   ├── DashboardLayout.jsx           # Main shell with responsive topbar & sidebar
│   ├── Sidebar.jsx                   # Navigation drawer with RBAC access badges
│   ├── ApprovedMemberProtectedRoute.jsx # Tactical clearance gate for high-stakes features
│   ├── SplashScreen.jsx              # WhatsApp-style animated application intro
│   └── worldfirst/                   # World-First Deep-Tech Innovation modules
│       ├── AtmosphericWifiBendingTab.jsx   # 802.11 CSI passive human density mapping
│       ├── BarometricFlashFloodTab.jsx     # Bernoulli vacuum flash-flood wave warning
│       ├── BleSpittingProtocolTab.jsx      # 15ms high-gain BLE burst debris penetration
│       ├── MagnetometerLocatorTab.jsx      # 3D geomagnetic rubble cavity void locator
│       ├── PqcOfflineLedgerTab.jsx         # NIST ML-DSA / ML-KEM lattice offline ledger
│       ├── QuantumGossipRoutingTab.jsx     # Epidemic gossip P2P protocol with Bloom filters
│       ├── ThermoelectricTapTab.jsx        # Seebeck effect sub-1% deep sleep SOS engine
│       ├── WebNfcTriageTab.jsx             # Contactless skin-safe digital triage stamps
│       └── ZeroInfrastructureDataFlowTab.jsx # 4-phase unified disaster data lifecycle
│
├── pages/                            # Page-level route views (35+ screens)
│   ├── WorldFirstInnovationsSuite.jsx # Master 14-in-1 deep-tech disaster suite
│   ├── ExtremeResilienceSuite.jsx    # WASM supercomputing, E-Ink canvas, Li-Fi receiver
│   ├── DecentralizedResilienceSuite.jsx # Ultrasonic chirp, AM/FM trilateration, SAR radar
│   ├── HyperSpeedRescueSuite.jsx     # Autonomous drone swarms, AR rescue HUD, LEO bridge
│   ├── NERTopographySuite.jsx        # North East India extreme terrain command suite
│   ├── NERLandslideMonitor.jsx       # 8-State live geotechnical landslide risk dashboard
│   ├── Dashboard.jsx                 # Live command center overview & statistics
│   ├── ClimateChronicle.jsx          # Trilingual live disaster news feed (EN / HI / OR)
│   ├── Alerts.jsx                    # Real-time disaster alert broadcasts & filters
│   ├── Map.jsx / AdvancedMap.jsx     # Interactive GIS disaster & shelter mapping
│   ├── SOSCenter.jsx                 # 1-Tap emergency SOS beacon with GPS broadcasting
│   ├── ShelterFinder.jsx             # Real-time shelter directory with live occupancy
│   ├── FamilySafety.jsx              # Family safety circle check-ins & locator
│   ├── DroneAnalytics.jsx            # Live UAV flight feeds with YOLOv8 & FLIR thermal
│   ├── LiveReliefTracker.jsx         # Live GPS supply convoy tracking & blockchain aid ledger
│   ├── Reviews.jsx                   # Citizen & responder review submission hub
│   ├── AdministratorHub.jsx          # Admin command center & review management
│   └── ...
│
└── utils/                            # Core client-side utility libraries
    ├── adminAuth.js                  # Client RBAC credential and clearance verification
    ├── LowBandwidthContext.jsx       # Global context toggling 2G/Emergency low-bandwidth state
    ├── bleSpittingProtocol.js        # 18-byte packed binary BLE packet encoder/decoder
    ├── pqcCrypto.js                  # NIST ML-DSA-65 & ML-KEM-768 lattice crypto routines
    ├── offlineStorage.js             # IndexedDB transaction wrappers
    └── socket.js                     # Authenticated Socket.IO client instance
```

---

## 🌐 Complete Route Directory

### 1. Citizen Emergency Lifelines (Public Access)
- `/` — Landing page with strategic competitive benchmark
- `/dashboard` — High-level incident command dashboard
- `/emergency-sos` — 1-Tap emergency distress beacon with GPS coordinate propagation
- `/alerts` — Active regional alerts with severity badges
- `/map` — Live disaster overlay with shelter markers
- `/shelter-finder` — Locate safe evacuation centers with live occupancy
- `/family-safety` — Family circle check-in beacon
- `/qr-rescue-id` — Offline cryptographic QR medical identity card
- `/climate-chronicle` — Trilingual (English, Hindi, Odia) aggregated disaster news
- `/low-bandwidth` — Ultra-low bandwidth (<50KB) emergency text portal
- `/reviews` — Citizen feedback, ratings, and field reviews

### 2. World-First Deep-Tech Innovation Suites
- `/world-first-innovations` — 14 Deep-Tech innovations & Zero-Grid data lifecycle
- `/extreme-resilience` — WASM distributed supercomputer, E-Ink low-refresh canvas, Web-NFC dead-drop lockers, Li-Fi receiver
- `/decentralized-resilience` — Ultrasonic audio chirp mesh, terrestrial FM radio trilateration, WebHID vitals, IPFS mirroring, SAR radar engine
- `/hyper-speed-rescue` — Autonomous drone swarms, AR tactical HUD, acoustic scream/thump triangulation, LEO satellite micro-bridge

### 3. Geotechnical & North East Region (NER) Intelligence
- `/ner-topography-suite` — Extreme terrain command suite (seismic early warning, HAM gateway, local dialect voice-SOS, bamboo drone delivery router)
- `/ner-landslide-monitor` — 8-State real-time geotechnical dashboard, highway blockage tracker, and Landslide Susceptibility Index (LSI) calculator
- `/incident-report` — Field geotechnical reporting (crack width/length, slope creep trend)

### 4. Tactical Operations (RBAC Protected: Admin or Approved Responder)
- `/drone-analytics` — Live UAV video analytics feed with YOLOv8 object detection & FLIR thermal switch
- `/satellite` — Synthetic Aperture Radar (SAR) backscatter analysis and flood boundary mapping
- `/dynamic-evacuation` — Anti-herd load-balancing router across highway corridors
- `/digital-twin` — Real-time 3D physics catastrophe simulation
- `/sensors` — IoT environmental sensor network telemetry
- `/drones` — Drone fleet management and autonomous mission planning
- `/vulnerability-map` — Crowdsourced infrastructure defect heatmap
- `/reconstruction-map` — Post-disaster reconstruction progress audit
- `/relief-tracker` — Live GPS supply truck tracking & transparent blockchain aid ledger
- `/zero-internet-mesh` — P2P WebRTC & BLE browser-to-browser mesh console

### 5. Administration & Governance
- `/administrator` — Administrator Command Hub: tactical member credential approvals, real-time WAF firewall status, broadcast alerts, and permanent review moderation

---

## ⚡ Native Hardware & Browser APIs

1. **Web Sensor API (`window.Magnetometer`)** — Detects microtesla magnetic anomalies in collapsed concrete to locate trapped humans in subterranean air voids.
2. **Generic Sensor API (`window.PressureSensor`)** — Monitors atmospheric micro-pressure to detect Bernoulli vacuum shockwaves ahead of flash floods.
3. **Web-NFC API (`NDEFReader` / `NDEFWriter`)** — Contactless on-skin digital triage stamp programming and offline relief locker unlocking.
4. **Web Audio API (`AudioContext`, `AnalyserNode`)** — Encodes and decodes acoustic FSK tones (1.8–19.8 kHz) for zero-RF screen-to-screen communication.
5. **MediaDevices API (`getUserMedia`)** — Front camera optical pulse receiver for emergency shelter Li-Fi downlinks and photoplethysmography (PPG) vitals monitoring.
6. **WebHID & Web-Bluetooth APIs** — Ingests live pulse oximeter telemetry and executes 15ms high-gain BLE micro-bursting.
7. **BroadcastChannel & WebRTC DataChannels** — Browser-native peer-to-peer epidemic gossip mesh networking.
8. **Network Information API** — Automatically senses `2g` or high-latency network conditions to seamlessly engage Low-Bandwidth Mode.

---

## 🚀 Running Locally

```bash
# Install dependencies
npm install

# Start development server with Vite HMR
npm run dev

# Build production bundle
npm run build

# Preview production build locally
npm run preview
```
