# Disaster Management Platform API

## Base URL

`http://localhost:5000`

## Authentication

Authentication endpoints:

- `POST /api/auth/register` — Register a new user account
- `POST /api/auth/login` — Authenticate and receive JWT access token
- `POST /api/auth/refresh` — Refresh expired access token
- `POST /api/auth/logout` — Revoke active session
- `PATCH /api/auth/change-password` — Update user password
- `GET /api/auth/me` — Return currently authenticated user profile

Authenticated requests must include the header:
```http
Authorization: Bearer <access-token>
```

---

## Health & Runtime Probes

- `GET /api/health` — Liveness probe; returns system status, database connection state, and ISO timestamp.
- `GET /api/ready` — Readiness probe; returns HTTP `200` when MongoDB is ready or `503 Service Unavailable` if database connection is down.

---

## Core Operations

### Users & Roles
- `GET /api/users` — List registered users (Admin only)
- `GET /api/users/:id` — Retrieve specific user profile
- `PUT /api/users/:id` — Update user details or assign role (`user`, `volunteer`, `operator`, `admin`)
- `DELETE /api/users/:id` — Remove user account

### Alerts & Emergency Broadcasts
- `GET /api/alerts` — Fetch active disaster alerts (supports filter by severity and region)
- `GET /api/alerts/:id` — Fetch single alert
- `POST /api/alerts` — Create and broadcast new emergency alert (Admin/Operator)
- `PUT /api/alerts/:id` — Update alert metadata or severity
- `DELETE /api/alerts/:id` — Dismiss or delete alert

### Disasters
- `GET /api/disasters` — List active and historical disaster events
- `GET /api/disasters/:id` — Get disaster incident record
- `POST /api/disasters` — Log a new disaster event
- `PUT /api/disasters/:id` — Update disaster status or perimeter
- `DELETE /api/disasters/:id` — Archive disaster event

### Shelters
- `GET /api/shelters` — List registered shelters with capacity, occupancy, and coordinates
- `GET /api/shelters/:id` — Get shelter details
- `POST /api/shelters` — Register a new relief shelter
- `PUT /api/shelters/:id` — Update shelter supplies, occupancy, or status
- `DELETE /api/shelters/:id` — Decommission shelter

### Resources & Aid Allocation
- `GET /api/resources` — List emergency medical, food, and transport assets
- `GET /api/resources/:id` — Resource detail
- `POST /api/resources` — Register new emergency resource batch
- `PUT /api/resources/:id` — Update quantity, location, or allocation
- `DELETE /api/resources/:id` — De-list resource

### Volunteers & Tasks
- `GET /api/volunteers` — Directory of registered volunteers with skill tags
- `GET /api/volunteers/:id` — Volunteer profile
- `POST /api/volunteers` — Volunteer enrollment
- `PUT /api/volunteers/:id` — Update skills, availability, or status
- `DELETE /api/volunteers/:id` — De-register volunteer
- `GET, POST, PUT, DELETE /api/tasks/*` — Disaster task assignment and progress reporting

### Emergency SOS Signals
- `GET /api/sos` — List emergency SOS distress signals
- `GET /api/sos/:id` — Get specific SOS record
- `POST /api/sos` — Dispatch 1-tap SOS with GPS coordinates, medical urgency, and survivor count
- `PUT /api/sos/:id` — Update triage status (`PENDING`, `DISPATCHED`, `RESOLVED`)
- `DELETE /api/sos/:id` — Close SOS incident

---

## Geotechnical & North East Region (NER) Intelligence

- `GET /api/ner/overview` — Aggregated geotechnical intelligence across all 8 North Eastern states (Assam, Meghalaya, Sikkim, Arunachal Pradesh, Nagaland, Manipur, Mizoram, Tripura), including IMD precipitation and soil saturation.
- `GET /api/ner/corridors` — Real-time highway blockage and clearance tracking for NH-10, NH-29, NH-6, NH-13, and NH-54.
- `POST /api/ner/calculate-lsi` — On-the-fly Landslide Susceptibility Index (LSI) calculator using rainfall excess, soil saturation %, and slope incline angle.

---

## World-First Deep-Tech & Zero-Infrastructure APIs

### Atmospheric Wi-Fi "Bending" (CSI RF Ingestion)
- `GET /api/wifi-csi/sites` — List disaster sites equipped with Wi-Fi CSI sensing nodes
- `GET /api/wifi-csi/blueprint/:siteId` — Retrieve 2D/3D SAR structural blueprint with trapped human count and drilling borehole vectors
- `POST /api/wifi-csi/analyze` — Ingest raw 802.11n/ac/ax OFDM CSI subcarrier matrices to detect 0.23 Hz chest-wall micro-Doppler
- `GET /api/wifi-csi/stream` — Real-time Server-Sent Events (SSE) stream of CSI respiration waveforms

### Post-Quantum Cryptographic (PQC) Offline Ledger
- `GET /api/pqc-ledger/chain` — Fetch public immutable ledger blocks of PQC offline claims
- `POST /api/pqc-ledger/verify` — Verify NIST FIPS 204 ML-DSA-65 (CRYSTALS-Dilithium) digital signatures from offline QR tokens
- `POST /api/pqc-ledger/sync` — Ingest and commit offline-signed relief vouchers and surgical consent batches

### Web-Bluetooth "Spitting" Protocol
- `GET /api/ble-spit/signals` — Fetch recently captured 18-byte micro-burst signals detected by drones or rescue relays
- `POST /api/ble-spit/burst` — Record a 15ms high-gain BLE burst, automatically computing mud/debris burial depth

### Web-NFC "Digital Triage Stamps"
- `GET /api/nfc-triage/patients` — List patients with synchronized on-skin NFC triage records
- `POST /api/nfc-triage/batch-sync` — Batch-sync on-chip NTAG213/216 triage tags (START priority, vitals, IV/tourniquet logs)

---

## Reviews & Administrator Audit System

- `GET /api/reviews` — Public retrieval of citizen reviews, ratings, and field feedback (supports category & language filtering)
- `POST /api/reviews` — Submit review with dual-layer commit (MongoDB + server disk backup `reviews.json`)
- `PATCH /api/reviews/:id/read` — Administrator action to mark review as read
- `PATCH /api/reviews/read-all` — Administrator action to mark all incoming reviews as read
- `DELETE /api/reviews/:id` — Permanent administrative deletion across MongoDB and disk backup

---

## Mesh Network, Hardware & Automation

### LoRa & P2P Mesh Communication
- `POST /api/mesh/message` — Ingest mesh packet from WebRTC, BLE, or LoRa gateway
- `GET /api/mesh/messages` — Query store-and-forward mesh buffer
- `GET /api/mesh/topology` — Real-time mesh node topology and hop paths
- `POST /api/mesh/beacons` — Register active LoRa or P2P mesh relay beacon

### Drones & UAV Operations
- `GET, POST, PATCH, DELETE /api/drones` — Drone fleet registration and flight telemetry
- `PATCH /api/drones/:id/status` — Update drone operational state (`IDLE`, `IN_FLIGHT`, `CHARGING`, `MAINTENANCE`)
- `PATCH /api/drones/:id/telemetry` — Stream GPS coordinates, altitude, battery %, and speed
- `GET, POST /api/drones/missions` — Drone search & rescue flight mission planner
- `GET /api/drones/missions/:id` — Retrieve mission waypoint route
- `PATCH /api/drones/missions/:id/status` — Update mission execution status

### IoT Sensors & Satellite Imagery
- `GET, POST /api/sensors` — IoT environmental sensor telemetry (soil moisture, rainfall, MEMS tilt)
- `GET, POST /api/satellite` — Satellite radar and optical observation metadata
- `GET /api/predictions` — Machine learning early warning hazard predictions
- `GET /api/analytics` — Platform-wide disaster trends and response performance metrics

---

## Public Lifelines & Auxiliary APIs

- `GET /api/news` — Trilingual climate and disaster news feed (English, Hindi, Odia) with pagination (`?lang=en|hi|or`)
- `GET /api/news/stats` — News article counts and last syndicated timestamp per language
- `POST /api/news/refresh` — Trigger background RSS feed re-syndication
- `GET, POST /api/incidents` — Field incident reporting with EXIF metadata, crack width/length, and photo uploads
- `GET, POST /api/damage-assessment` — Crowdsourced structural foundation and flood damage reports
- `GET, POST /api/evacuation` — Anti-herd evacuation routing and corridor capacity calculations
- `GET, POST /api/family` — Family safety circle check-ins and emergency status broadcasts
- `GET, POST /api/rescue-id` — Offline cryptographic QR rescue ID generation
- `POST /api/sync/batch` — Offline PWA batch synchronization for queued requests
- `GET /api/dashboard/summary` — High-level command overview statistics
- `POST /api/firewall/request-inspect` — WAF inspection clearance request
- `POST /api/maintenance/notify-error` — Frontend error boundary crash diagnostic ingestion

---

## Socket.IO Real-Time Engine

Connect with access token via handshake query or `auth.token`:
```javascript
const socket = io("http://localhost:5000", {
  auth: { token: "<jwt_access_token>" }
});
```

### Event Reference
| Event Name | Direction | Payload Description |
|---|---|---|
| `newAlert` | Server → Client | Immediate broadcast of high-priority disaster alert |
| `alertUpdated` | Server → Client | Alert severity or status modification |
| `sensorReading` | Server → Client | Ingested telemetry from IoT slope or river sensor |
| `newSOS` | Server → Client | Real-time survivor distress beacon with GPS coordinates |
| `sosUpdated` | Server → Client | Triage or responder dispatch status change |
| `droneTelemetry` | Server → Client | Real-time UAV position and flight telemetry |
| `meshMessage` | Bidirectional | Multi-hop peer-to-peer mesh packet relay |
| `notification` | Server → Client | In-app user notification delivery |