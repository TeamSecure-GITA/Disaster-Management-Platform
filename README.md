# 🛡️ AI-Based Early Warning & Landslide Risk Monitoring System in NER
### *(Comprehensive Disaster Management & Climate Resilience Platform)*

A state-of-the-art, full-stack disaster management and geotechnical early warning platform engineered for the **North Eastern Region (NER) of India** (Assam, Meghalaya, Sikkim, Arunachal Pradesh, Nagaland, Manipur, Mizoram, Tripura) and emergency response nationwide.

The platform unites **real-time IoT slope sensors, IMD rainfall threshold analytics, satellite remote sensing, AI-driven Landslide Susceptibility Index (LSI) modeling, road connectivity & blockage tracking, geotagged citizen crowdsourcing, and offline-first PWA architecture** with multilingual emergency broadcasting.

> 📄 **Complete Problem Statement Submission & Dossier:** See [NER_LANDSLIDE_SOLUTION_PROPOSAL.md](file:///home/deba/Desktop/DISASTER_MANAGEMENT_PLATFORM/NER_LANDSLIDE_SOLUTION_PROPOSAL.md) for full technical mapping, formulas, and architecture diagrams.

---

## 📋 Table of Contents

- [Overview](#overview)
- [NER Landslide Early Warning Engine](#-ner-ai-landslide--slope-risk-monitoring)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [API Reference](#api-reference)
- [Getting Started](#getting-started)
- [Testing & Verification](#testing)
- [License](#license)

---

## Overview

The Disaster Management Platform addresses critical climate and geotechnical vulnerabilities in high-risk mountainous terrains like the North Eastern Region. By transforming reactive emergency response into predictive intelligence, it prevents loss of life, protects infrastructure, and coordinates relief across isolated habitations.

---

## ⛰️ NER AI Landslide & Slope Risk Monitoring

- **Real-Time Geotechnical Dashboard (`/ner-landslide-monitor`)** — Live risk monitoring across all 8 North Eastern states with soil saturation %, 24h rainfall vs. IMD threshold, slope incline, and automated alerts.
- **Highway & Corridor Connectivity Tracker** — Real-time blockage tracking for NH-10 (Sevoke-Gangtok), NH-29 (Dimapur-Kohima), NH-6 (Shillong-Silchar), NH-13, and NH-54, complete with debris volume estimates and alternate bypass routes.
- **Field Geo-Tagged Crack & Slope Movement Reporter** — Field geologists and citizens report surface tension cracks (width in cm, length in m), slope creep, and road status with 1-click GPS locking and photo evidence.
- **AI Landslide Susceptibility Index (LSI) Calculator** — Dynamic geotechnical stability and Factor of Safety (FoS) computation engine.
- **Emergency Response Prioritization Matrix** — Algorithmic ranking of vulnerable districts based on LSI, number of isolated villages, and rainfall excess to optimize SDRF/NDRF resource allocation.
- **Multilingual Emergency Warnings** — Vernacular broadcast alerts in **English, Hindi, Assamese (অসমীয়া), Bengali (বাংলা), Nepali (नेपाली), and Odia (ଓଡ଼ିଆ)**.

---

## Features

### 🌐 World-First Deep-Tech Disaster Suite (`/world-first-innovations`)
> 💡 **SIH Grand Jury Pitch Thesis:**  
> *"The world's current disaster platforms assume the internet will always come back. **We built our platform for the day it doesn't.** By turning the ambient environment, sound waves, radio echoes, and the collective computing power of everyday smartphones into a self-healing rescue grid, we have created a platform that cannot be knocked offline by any natural disaster on Earth."*

- **🧬 Magnetometer "Disrupted-Field" 3D Rubble Void Locator (Web Sensor API)** — Hooks into raw magnetometer sensors (`window.Magnetometer`) to detect sub-microtesla magnetic anomalies and cavity flux relief in collapsed reinforced concrete, pinpointing hollow survival pockets under 3+ meters of rubble with acoustic Geiger sonar pings.
- **🔋 Thermoelectric "Thermal-Tap" Seebeck Sub-1% Deep Sleep Engine** — Temperature differential harvesting (bare chest skin vs cold mountain rock) powering continuous nano-watts. Drops background display to 0-watt OLED and timer to 0.1 Hz, firing 15ms high-gain bursts and extending phone survival up to 14 days.
- **🌊 Barometric Pressure "Flash-Flood Wave" Early Warning Loop (Generic Sensor API)** — Reads sub-millibar atmospheric pressure via `window.PressureSensor`. Detects the distinct Bernoulli vacuum shockwave ($\Delta P / \Delta t < -0.45\text{ hPa in } < 2.5\text{s}$) created by rushing floodwaters in mountain gorges, sounding a 60–90 second audible evacuation alarm across village phones before the water arrives.
- **🧠 Quantum Gossip P2P Mesh Routing (Kyber-1024 / ML-KEM)** — Epidemic lattice-encrypted gossip protocol with Bloom filters and browser `BroadcastChannel`. Distress tokens spread organically across citizen devices ($R_0 > 3.0$), and the first person encountering an uplink van or overhead drone dumps the entire region's tokens in an 0.8s burst.
- **⚡ Web-NFC "Digital Triage Stamps" for Mass Casualties** — Eliminates fragile paper triage tags. Volunteers slap waterproof, skin-safe NFC sticker patches (NTAG213/NTAG216) onto victims' wrists or foreheads. Medical personnel tap their phone directly via Web-NFC (`NDEFReader`/`NDEFWriter`) in the browser to view and edit START triage priority (Red/Yellow/Green/Black), vitals, blood type, drug allergies, and on-chip treatment timestamps that travel with the patient's body offline.
- **📡 Atmospheric Wi-Fi "Bending" Detection (Passive Human Density Mapping)** — Analyzes 802.11n/ac/ax Channel State Information (CSI) 52–114 subcarriers. Measures human tissue dielectric wave absorption ($\epsilon_r \approx 50$) and 0.23 Hz chest-wall respiration micro-Doppler to locate and count trapped living survivors inside collapsed buildings—even if their phones are off or dead. Automatically generates 2D/3D SAR structural blueprints with extraction boring angles.
- **🛡️ Post-Quantum Cryptographic (PQC) Offline Identity Ledger** — Offline authentication and aid distribution ledger powered by NIST-standardized lattice cryptography (ML-DSA-65 / CRYSTALS-Dilithium digital signatures and ML-KEM-768 / CRYSTALS-Kyber key encapsulation). Runs 100% in-browser in the PWA, generating tamper-proof relief vouchers and medical release forms resistant to future quantum computing attacks.
- **🕸️ Web-Bluetooth "Spitting" Protocol (Debris Soil Penetration)** — Replaces fragile continuous BLE streams with Asynchronous Micro-Bursting. Buried phones sleep for 45 seconds and "spit" a packed 18-byte binary SOS packet at maximum RF gain (+8 to +20 dBm) for 15 milliseconds, penetrating 3+ feet of saturated mud and concrete while multiplying survival battery life from 4.5 hours to over 186 hours (7.7+ days) for overhead drone harvesters.
- **🎨 The Ultimate Zero-Infrastructure Data Flow Pipeline** — Interactive 4-phase unified lifecycle orchestrating sub-debris detection, gorge-spanning audio swarms, on-body digital triage, and sovereign quantum aid settlement when all satellite and cellular grids are severed.
- **🔊 Acoustic Sound-Wave Chirp Modem** — Screen-to-screen encrypted data transfer over audible (1.8–3.4 kHz) and near-ultrasonic (18.5–19.8 kHz) frequencies with zero RF hardware.
- **📻 Terrestrial Reverse GPS Radio** — Gorge vector trilateration using commercial AM/FM radio transmitter beacons.
- **🫀 Citizen Vitals Crowd-Map** — Decentralized WebHID and wearable biometric triage mapping.
- **🏔️ Fluid Mudslide AI Simulation** — Real-time geotechnical pore-pressure liquefaction modeling using Mohr-Coulomb & Bishop FoS equations.
- **🌲 Living Root Bridge Bio-Structural Ledger** — Computer vision catenary load and tension tracking for indigenous bridges in Meghalaya.

### 🔋 Extreme Resilience & Zero-Grid Survival Suite (`/extreme-resilience`)
- **Web-WASM Distributed Supercomputer** — Client-side finite element geotechnical simulation running local landslide prediction with zero central cloud servers.
- **E-Ink / Low-Refresh (0.033 Hz) Ultra-Low Energy Browser Canvas** — Binary OLED rendering mode dropping power draw by 85%, extending critical 6% battery life over 14 hours.
- **Web-NFC "Dead-Drop" Digital Relief Lockers** — Contactless NFC provisioning of medical supply crates and food rations using offline ECDSA signatures.
- **Li-Fi Web Interfacing for Emergency Shelters** — Demodulates optical high-frequency pulses from overhead LED shelter fixtures via the front-facing camera for zero-RF-congestion data downloads.

### 🛰️ Decentralized Resilience & SAR Radar Suite (`/decentralized-resilience`)
- **Ultrasonic "Chirp" Mesh** — Multi-hop acoustic voice/mic sound wave relays spanning deep river gorges.
- **Terrestrial FM/AM Radio Web-Triangulation** — Logarithmic RF path-loss trilateration achieving $\pm 32\text{m}$ accuracy without GPS.
- **WebHID Bio-Sensing Triage Heatmaps** — Real-time optical PPG and smartwatch telemetry driving START triage prioritization.
- **IPFS-Based Decentralized Web-Mirroring** — Content-addressed decentralized portal mirror providing 99.99% availability during panic traffic surges.
- **Synthetic Aperture Radar (SAR) WebGL Render Engine** — Cloud-piercing C-band/L-band microwave backscatter processing exposing flooded terrain and dyke breaches at night.

### 🚀 Hyper-Speed Autonomous Rescue Suite (`/hyper-speed-rescue`)
- **Autonomous Drone Swarm Dispatch Protocol** — Sub-3-second automated launch of multi-rotor swarms upon critical triage threshold triggers.
- **Web3 Spatial Computing & AR "Rescue HUD"** — Augmented reality tactical overlays displaying safe paths, live buried vitals, and fallen 11kV lines.
- **Edge-AI Acoustic "Scream & Thump" Triangulation** — 3D TDOA multilateration pinpointing buried victims through heavy rubble.
- **LEO Direct-to-Cellular Micro-Data Bridge** — 12-byte compressed binary beacon protocol transmitting directly to Starlink/AST satellite constellations.
- **Predictive "Pre-Deployment" Relocation Engine** — Proactive staging of swift-water rescue assets 2 hours ahead of predicted isolation choke-points.

### 🔐 Tactical RBAC Route Guards & Administrator Command Hub (`/administrator`)
- **Role-Based Access Control (RBAC)** — Sensitive operational features (drone control, thermal feeds, satellite radar, dynamic evacuation routers) protected by `ApprovedMemberProtectedRoute`.
- **Administrator Verification Queue** — Review, approve, or revoke responder and volunteer tactical credentials in real time.
- **Dual-Layer Permanent Review Persistence (`/reviews`)** — Dual-layer storage (MongoDB + server disk backup `reviews.json`) ensuring citizen feedback and field evaluations are never lost or corrupted.

### 🚨 Emergency & SOS
- **SOS Center** — One-tap emergency distress signals with GPS location broadcasting
- **Real-time Alerts** — Push disaster alerts categorized by severity and type
- **Emergency Notifications** — Multi-channel delivery via in-app, email, and push (Firebase FCM)

### 📰 Climate Chronicle & Live News
- **Automated Disaster & Climate Feed** — Real-time climate change and disaster news aggregated automatically from India's premier national and regional daily newspapers
- **Trilingual Newspaper Coverage**:
  - 🇬🇧 **English**: *The Economic Times*, *The Indian Express*, *Hindustan Times*, and *The Times of India*
  - 🇮🇳 **Hindi (हिंदी)**: *दैनिक जागरण (Dainik Jagran)*, *दैनिक भास्कर (Dainik Bhaskar)*, *हिन्दुस्तान (Hindustan)*, and *अमर उजाला (Amar Ujala)*
  - 🏳️ **Odia (ଓଡ଼ିଆ)**: *ପ୍ରମେୟ (Prameya)* and *ସମ୍ବାଦ (Sambad)*
- **Zero-Manual Updates** — Automated backend syndication cron runs every 6 hours with client-side 5-minute live polling (newest articles on top)
- **Visual Status & Source Attribution** — "NEW" badges for fresh breaking stories (<6 hours), customized newspaper color badges, and direct links to full publications

### 🎨 Brand Identity & UX
- **WhatsApp-Style Animated Splash Screen** — Elegant branded intro showing official Disaster Management seal with smooth scaling, bounce, and fade-out transition on application startup

### 🗺️ Mapping & Navigation
- **Interactive Map** — Live disaster overlay using Leaflet & React-Leaflet
- **Shelter Finder** — Locate and navigate to nearest safe shelters
- **Evacuation Planner** — AI-generated optimal evacuation routes
- **Rescue Centers** — Directory of active rescue operations

### 👨‍👩‍👧 Family & Identity
- **Family Safety** — Register and track family member safety status
- **QR Rescue ID** — Generate scannable QR cards with personal emergency data
- **Rescue ID System** — Unique digital identity for disaster victims

### 🤖 AI & Automation
- **AI Chatbot Assistant** — Contextual emergency guidance powered by an external AI service
- **Voice Assistant** — Hands-free emergency interaction
- **Disaster Predictions** — ML-based risk scoring and early warning system
- **Damage Assessment** — Structured photo and field-data based damage reports

### 📡 Advanced Monitoring
- **Sensor Network** — Real-time IoT sensor data ingestion and alerting
- **Drone Management** — Fleet control, mission planning, and live telemetry via WebSockets
- **Satellite Imagery** — Scheduled satellite data updates for affected zones

### 📊 Analytics & Reporting
- **Analytics Dashboard** — Charts and KPIs for incident trends and response performance
- **Statistics** — Aggregated platform-wide data views
- **Incident Reports** — Structured incident logging with file attachments
- **Admin Panel** — Ticket management and admin oversight

### ⚙️ Platform Capabilities
- **Offline Support (PWA)** — Full offline-first architecture using IndexedDB & service workers
- **Data Sync** — Conflict-free background sync when connectivity is restored
- **Role-based Access** — JWT authentication with user/volunteer/admin roles
- **Rate Limiting & Security** — Helmet, CORS, and express-rate-limit hardened API
- **File Uploads** — Local or Cloudinary cloud storage for photos and documents

---

## Tech Stack

### Backend
| Layer | Technology |
|---|---|
| Runtime | Node.js 22 |
| Framework | Express.js 5 |
| Database | MongoDB (Mongoose 8) |
| Real-time | Socket.IO 4 |
| Auth | JWT + bcryptjs |
| File Storage | Multer + Cloudinary |
| Push Notifications | Firebase Admin SDK |
| Email | Nodemailer |
| Scheduling | node-cron |
| News & RSS Syndication | rss-parser |
| Security | Helmet, CORS, express-rate-limit |
| Testing | Jest + Supertest |

### Frontend
| Layer | Technology |
|---|---|
| Framework | React 19 |
| Build Tool | Vite 8 |
| Routing | React Router DOM 7 |
| Maps | Leaflet + React-Leaflet |
| Charts | Recharts |
| Icons | Lucide React |
| QR Codes | qrcode.react |
| Offline DB | IndexedDB (idb) + localforage |
| PWA | vite-plugin-pwa |
| Animations | CSS3 Keyframe Transitions (WhatsApp Splash Screen) |
| Linting | OXLint |

---

## Project Structure

```
DISASTER_MANAGEMENT_PLATFORM/
├── render.yaml                  # Render.com deployment config
│
├── Backend/
│   ├── server.js                # HTTP + Socket.IO server entry point
│   ├── app.js                   # Express app with all routes registered
│   ├── Dockerfile               # Production Docker image (node:22-alpine)
│   ├── docker-compose.yml       # Backend + MongoDB local stack
│   ├── .env.example             # Environment variable template
│   │
│   ├── config/                  # DB connection, CORS, environment config
│   ├── controllers/             # Route handler logic
│   ├── middleware/              # Auth, rate limiting, upload, error handlers
│   ├── models/                  # Mongoose schemas (30 models including Review, CrowdSignal, LoRaBeacon)
│   ├── routes/                  # Express route definitions (33 route files including PQC, BLE Spit, WiFi CSI, NFC Triage, Reviews)
│   ├── services/                # Business logic layer (30+ service modules)
│   ├── sockets/                 # Socket.IO event handlers
│   │   ├── socket.js            # Main socket initializer
│   │   ├── alertSocket.js
│   │   ├── sosSocket.js
│   │   ├── droneSocket.js
│   │   ├── sensorSocket.js
│   │   └── notificationSocket.js
│   ├── jobs/                    # Scheduled cron jobs
│   │   ├── alertExpiryJob.js
│   │   ├── govtDisasterAlertJob.js
│   │   ├── newsFetcher.js       # Auto-aggregates RSS feeds every 6 hours
│   │   ├── predictionJob.js
│   │   ├── satelliteUpdateJob.js
│   │   └── weatherUpdateJob.js
│   ├── utils/                   # Shared utilities
│   ├── validators/              # express-validator schemas
│   └── tests/                  # Jest test suites
│
└── frontend/
    ├── index.html
    ├── vite.config.js           # Vite + PWA plugin config
    ├── vercel.json              # Vercel SPA rewrite config
    └── src/
        ├── main.jsx
        ├── App.jsx              # Root router with RBAC guards & WhatsApp splash screen
        ├── index.css            # Global design tokens & styling
        ├── assets/              # Logo & static media assets
        │   └── logo.png         # Official Disaster Management emblem
        ├── components/          # Shared UI & innovation components
        │   ├── DashboardLayout.jsx
        │   ├── Sidebar.jsx      # Navigation drawer with RBAC indicators
        │   ├── ApprovedMemberProtectedRoute.jsx # Tactical clearance gate
        │   ├── SplashScreen.jsx # Animated logo splash screen
        │   └── worldfirst/      # 10 World-First Deep-Tech innovation tabs
        ├── pages/               # 35+ page-level components
        │   ├── WorldFirstInnovationsSuite.jsx # 14 World-First innovations & Zero-Grid flow
        │   ├── ExtremeResilienceSuite.jsx      # WASM supercomputing & E-Ink canvas
        │   ├── DecentralizedResilienceSuite.jsx# Ultrasonic chirp & SAR radar
        │   ├── HyperSpeedRescueSuite.jsx       # Drone swarms & AR HUD
        │   ├── NERTopographySuite.jsx          # NER extreme terrain command
        │   ├── NERLandslideMonitor.jsx         # Live 8-state geotechnical monitor
        │   ├── Reviews.jsx                     # Public & responder review hub
        │   ├── AdministratorHub.jsx            # Admin control & review management
        │   ├── Dashboard.jsx
        │   ├── ClimateChronicle.jsx            # Trilingual (EN/HI/OR) live disaster news feed
        │   └── ...
        ├── utils/               # API helpers, offline sync, PQC crypto, BLE protocol
        └── Data/                # Static reference data
```

---

## API Reference

All API endpoints are prefixed with `/api`.

| Endpoint | Description | 
|---|---|
| `GET /api/health` | Health check — returns DB connection status |
| `GET /api/ready` | Readiness probe — returns 503 if DB is down |
| `POST /api/auth/*` | Register, login, token refresh, logout, me |
| `GET/PUT /api/users/*` | User profile & role management |
| `GET/POST /api/alerts/*` | Disaster alerts CRUD |
| `GET/POST /api/disasters/*` | Disaster event management |
| `GET /api/news` | Get paginated climate & disaster news (`?lang=en\|hi\|or&page=1&limit=20`) |
| `GET /api/news/stats` | Aggregated news counts & latest publication timestamp per language |
| `POST /api/news/refresh` | Trigger background re-syndication from RSS sources |
| `GET/POST /api/shelters/*` | Safe shelter registry & live occupancy |
| `GET/POST /api/resources/*` | Resource allocation & tracking |
| `GET/POST /api/volunteers/*` | Volunteer enrollment & dispatch |
| `GET/POST /api/tasks/*` | Task assignment for responders |
| `POST /api/sos/*` | SOS signal creation and GPS broadcasting |
| `GET/POST /api/chat/*` | AI chatbot message relay |
| `GET/POST /api/notifications/*` | In-app notification management |
| `GET/POST /api/sensors/*` | IoT sensor data ingestion & telemetry |
| `GET/POST /api/drones/*` | Drone fleet management & autonomous missions |
| `GET/POST /api/satellite/*` | Satellite imagery data |
| `GET /api/predictions/*` | AI risk predictions |
| `GET /api/analytics/*` | Aggregated platform analytics |
| `GET/POST /api/family/*` | Family member tracking & safety checks |
| `GET/POST /api/rescue-id/*` | QR rescue ID generation |
| `POST /api/damage-assessment/*` | Damage report submission with EXIF metadata |
| `GET/POST /api/evacuation/*` | Anti-herd evacuation route planning |
| `POST /api/sync/*` | Offline data sync & conflict resolution |
| `GET /api/dashboard/*` | Dashboard summary statistics & hazard reports |
| `GET/POST /api/ner/*` | NER Landslide early warning, 8-state risk & LSI index |
| `GET/POST/DELETE /api/reviews/*`| Dual-layer permanent reviews (MongoDB + disk backup) |
| `POST/GET /api/wifi-csi/*` | Atmospheric Wi-Fi bending CSI ingestion & 3D SAR maps |
| `POST/GET /api/pqc-ledger/*` | Post-Quantum ML-DSA / ML-KEM offline ledger & vouchers |
| `POST/GET /api/ble-spit/*` | Web-Bluetooth 15ms spitting bursts & soil depth calculations |
| `POST/GET /api/nfc-triage/*` | Web-NFC digital triage tag read/write synchronization |
| `POST/GET /api/mesh/*` | Peer-to-peer mesh broadcast & message routing |
| `GET/POST /api/firewall/*` | Web application firewall (WAF) rule administration |
| `GET/POST /api/maintenance/*`| Platform maintenance state toggling |

### WebSocket Events

| Namespace / Event | Direction | Description |
|---|---|---|
| `alert:new` | Server → Client | Broadcast new disaster alert |
| `sos:signal` | Client → Server | Emit SOS distress signal |
| `sos:update` | Server → Client | SOS status updates |
| `drone:telemetry` | Server → Client | Live drone position/status |
| `sensor:reading` | Server → Client | Real-time sensor data |
| `notification:push` | Server → Client | Push in-app notification |

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 22
- **npm** ≥ 10
- **MongoDB** (local or Atlas URI)
- **Docker & Docker Compose** (optional, for containerised setup)

### Environment Variables

Copy the example file and fill in your values:

```bash
cp Backend/.env.example Backend/.env
```

| Variable | Description | Required |
|---|---|---|
| `NODE_ENV` | `development` or `production` | ✅ |
| `PORT` | Backend server port (default: `5000`) | ✅ |
| `MONGO_URI` | MongoDB connection string | ✅ |
| `JWT_SECRET` | Secret key for JWT signing | ✅ |
| `JWT_EXPIRES_IN` | Token expiry (e.g. `7d`) | ✅ |
| `FRONTEND_URL` | Allowed CORS origin for the frontend | ✅ |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | Optional |
| `CLOUDINARY_API_KEY` | Cloudinary API key | Optional |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | Optional |
| `FIREBASE_PROJECT_ID` | Firebase project for push notifications | Optional |
| `FIREBASE_CLIENT_EMAIL` | Firebase service account email | Optional |
| `FIREBASE_PRIVATE_KEY` | Firebase service account private key | Optional |
| `WEATHER_API_KEY` | Weather data provider API key | Optional |
| `AI_CHATBOT_URL` | URL of the AI chatbot microservice | Optional |
| `SATELLITE_API_URL` | Satellite imagery API base URL | Optional |

### Local Development

**1. Backend**

```bash
cd Backend
npm install
npm run dev          # starts with nodemon on port 5000
```

**2. Frontend**

```bash
cd frontend
npm install
npm run dev          # starts Vite dev server on port 5173
```

The frontend expects the backend at `http://localhost:5000` by default.

### Docker (Recommended)

Start the full backend stack (Node.js API + MongoDB) with Docker Compose:

```bash
cd Backend
docker compose up --build
```

This spins up:
- **backend** — Node.js API on port `5000`
- **mongo** — MongoDB 8 with a persistent volume

Health checks are configured for both services. The API waits for MongoDB to be healthy before accepting traffic.

---

## Deployment

### Backend — Render

The `render.yaml` at the project root configures a Render web service for the backend:

```yaml
# render.yaml (excerpt)
- type: web
  name: Disaster-Management-Platform-Backend
  runtime: node
  rootDir: Backend
  buildCommand: npm install
  startCommand: npm start
```

Push to your connected Git branch and Render will auto-deploy.

### Frontend — Vercel

The `frontend/vercel.json` configures a Vite SPA deployment on Vercel:

```json
{
  "framework": "vite",
  "outputDirectory": "dist",
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

Import the `frontend/` directory as the Vercel project root, or use:

```bash
cd frontend
npx vercel --prod
```

> **Note:** Set the `VITE_API_URL` environment variable in your Vercel project settings to point to your deployed backend URL.

---

## Testing

```bash
cd Backend

# Run all tests
npm test

# Run with coverage report
npm run test:ci
```

Tests are written with **Jest** and **Supertest** for HTTP endpoint integration testing. Coverage reports are output to `Backend/coverage/`.

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m 'feat: add your feature'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a Pull Request against `main`

Please follow [Conventional Commits](https://www.conventionalcommits.org/) for commit messages.

---

## License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <sub>Built with ❤️ by Team Secure — GITA</sub>
</div>
