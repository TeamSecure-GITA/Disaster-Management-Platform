# System Architecture

## Overview

The Disaster Management Platform is built on a **Decentralized, Predictive, and Fault-Tolerant Hybrid Architecture**. Engineered to operate both in standard cloud-connected environments and under total infrastructure collapse, the platform combines **Node.js/Express/MongoDB cloud backends** with **Browser-Native Edge Computing, WebAssembly (WASM), Web Sensors, and Peer-to-Peer Mesh networks**.

---

## The 4-Tier Zero-Infrastructure Architecture

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        TIER 1: AMBIENT PHYSICAL SENSING & HARDWARE                     │
│  • Smartphone Sensors: Magnetometer (Debris Voids) • Barometer (Bernoulli Flash Waves) │
│  • Ambient RF: 802.11n/ac/ax CSI Bending (Human Respiration) • BLE 15ms Spitting      │
│  • Field Hardware: In-Situ IoT Soil Telemetry • UHF/VHF LoRa Beacons • UAV Drones       │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                      TIER 2: BROWSER-NATIVE EDGE COMPUTING & WASM                      │
│  • NIST PQC WASM: FIPS 204 ML-DSA (Dilithium) & FIPS 203 ML-KEM (Kyber-1024)           │
│  • Audio Modem: Web Audio API (1.8–19.8 kHz FSK Chirps) • Terrestrial AM/FM Trilateration│
│  • Client-Side Rendering: WebGL SAR Radar Backscatter • 0.033 Hz OLED E-Ink Canvas     │
│  • Storage: IndexedDB Flash Caching • Web-NFC On-Skin Digital Triage Tag Read/Write    │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        TIER 3: RESILIENT AD-HOC TRANSPORT LAYER                        │
│  • Epidemic Gossip Mesh: Bloom-filtered data dissemination over BroadcastChannel/P2P   │
│  • Hybrid Uplinks: WebRTC DataChannels • LEO Satellite Micro-Beacons • LoRa Gateways   │
│  • Real-Time Gateway: Socket.IO 4 Multi-Room Engine (alerts, operations, telemetry)    │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                       TIER 4: CORE COMMAND & RESILIENT PERSISTENCE                     │
│  • Application Server: Node.js 22+ • Express.js 5 Modular Framework                    │
│  • Security Perimeter: WAF Firewall Middleware • Strict Helmet CSP • Mongo Sanitize   │
│  • Persistence Engine: MongoDB 8.0 Cluster + Server Disk Backup (reviews.json)         │
│  • Access Governance: Tactical RBAC Clearance System (Admin / Approved Tactical / User)│
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Backend Structural Layers

```
Backend/
├── app.js               # Express application initialization & middleware pipeline
├── server.js            # HTTP server + Socket.IO lifecycle & graceful shutdown
├── config/              # Database URI, CORS whitelist, environment constants
├── controllers/         # 30+ Route controllers (request validation & response format)
├── routes/              # 33 Express router modules (RESTful resource routing)
├── middleware/          # Security WAF, JWT authentication, RBAC authorization, rate limiting
├── models/              # 30 Mongoose schemas with 2dsphere geospatial indexing
├── services/            # Core business logic: LSI calculator, PQC crypto, CSI analyzer, RSS
├── sockets/             # Socket.IO event handlers: alerts, SOS, drones, sensors, notifications
├── jobs/                # Background node-cron daemons: RSS syndication, alert expiry, weather sync
├── validators/          # Express-validator schemas for rigorous payload hygiene
└── data/                # Permanent server-side disk storage fallback (reviews.json)
```

---

## Request Lifecycle & Security Middleware Pipeline

Every incoming HTTP request passes through a multi-tier security and processing pipeline before reaching route controllers:

```
[ Client Request ]
       │
       ▼
 1. Reverse Proxy Trust (`X-Forwarded-For` verification)
       │
       ▼
 2. CORS Whitelist (`config/cors.js`)
       │
       ▼
 3. Helmet Security Headers (HSTS, CSP, XSS protection)
       │
       ▼
 4. Web Application Firewall (`firewallMiddleware.js` - threat detection)
       │
       ▼
 5. Request Logger (`requestLogger.js` - method, path, response status, latency)
       │
       ▼
 6. General Rate Limiter (`express-rate-limit` - IP burst protection)
       │
       ▼
 7. Body Parsers (`express.json`, `express.urlencoded` with 10MB limits)
       │
       ▼
 8. MongoDB Operator Injection Sanitization (`express-mongo-sanitize`)
       │
       ▼
 9. URL Normalization (collapse repeated slashes)
       │
       ▼
10. Authentication & RBAC (`authMiddleware.js`, `adminMiddleware.js`)
       │
       ▼
11. Route Controller Execution
       │
       ▼
12. Global Error Handler (`errorMiddleware.js`)
```

---

## Real-Time Architecture (Socket.IO)

The backend runs a high-concurrency Socket.IO server configured with JWT authentication:

### Room Hierarchy
- `alerts` — Public emergency room; every connected citizen and responder automatically joins to receive high-priority alerts.
- `user:<userId>` — Personal channel for private push notifications, family status updates, and task assignments.
- `operations` — Protected operational channel; restricted to users with `admin` or `operator` clearance for live drone feeds, tactical SAR heatmaps, and responder dispatch coordination.

### Real-Time Event Bus
```
 [ Survivor Phone ]       [ IoT Slope Sensors ]       [ UAV Drone Patrol ]
    newSOS Signal           sensorReading Event         droneTelemetry Event
          │                          │                          │
          └──────────────────────────┼──────────────────────────┘
                                     ▼
                        [ Socket.IO Dispatch Hub ]
                                     │
                 ┌───────────────────┴───────────────────┐
                 ▼                                       ▼
       Room: `alerts`                         Room: `operations`
    Citizens receive popup alert          NDRF Commanders see live vector
```

---

## Dual-Layer Permanent Persistence Architecture

To guarantee **zero data loss** even when cloud databases restart during catastrophic power fluctuations:

1. **Live Query Layer:** MongoDB stores indexed records for dynamic sorting, filtering, and aggregation.
2. **Server Disk Layer:** Critical data (such as citizen reviews in `Backend/data/reviews.json`) is concurrently written to the server's local filesystem.
3. **Automatic Fallback:** If MongoDB is offline, the backend seamlessly reads from the disk backup, maintaining operational continuity.
4. **Permanent Audit Trail:** Submitted records cannot be deleted by automated cron jobs or system resets; only an authorized administrator can explicitly delete an entry.