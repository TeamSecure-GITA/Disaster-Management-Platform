# Database Documentation

## Database Engine

- **Primary Database:** MongoDB (v8.0+ compatible, Mongoose v8.12.0 ODM)
- **Local Persistence Layer:** Server Disk Storage (`Backend/data/`) for critical records and disaster offline backups
- **Client Offline Storage:** Browser IndexedDB (`idb` + `localforage`) for Progressive Web App (PWA) zero-network survival

## Connection Configuration

The MongoDB connection URI is configured in the environment file (`Backend/.env`):

```env
MONGO_URI=mongodb://localhost:27017/disaster_management
# or MongoDB Atlas:
# MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/disaster_management?retryWrites=true&w=majority
```

---

## Complete Schema & Collection Directory (30 Collections)

### 1. Identity & Access Management
| Collection | Model File | Purpose |
|---|---|---|
| `users` | `User.js` | User authentication, profile, password hash (bcrypt), role (`user`, `volunteer`, `operator`, `admin`), and clearance level |
| `volunteers` | `Volunteer.js` | Volunteer enrollment, specialized rescue skills, deployment status, and assigned coordinates |
| `rescueids` | `RescueId.js` | Offline cryptographic rescue identities, medical allergies, blood groups, and emergency contacts |
| `families` | `Family.js` | Family safety circles and emergency contact bindings |
| `sharedfamilymembers` | `SharedFamilyMember.js` | Cross-device family tracking links and authorization tokens |

### 2. Emergency Operations & Incident Management
| Collection | Model File | Purpose |
|---|---|---|
| `alerts` | `Alert.js` | Emergency alerts, geographic affected area polygon, severity (`Low`, `Medium`, `High`, `Critical`), and broadcast expiry |
| `disasters` | `Disaster.js` | Disaster incident records (Cyclone, Landslide, Flash Flood, Earthquake), epicenter, and containment status |
| `sos` | `SOS.js` | 1-tap SOS distress records, GeoJSON `[lng, lat]`, survivor count, medical urgency, and dispatch timeline |
| `incidents` | `Incident.js` | Geotechnical field reports: crack width (cm), crack length (m), slope creep trend, and road blockage status |
| `damageassessments` | `DamageAssessment.js` | Crowdsourced structural failure reports, EXIF GPS coordinates, and Cloudinary photographic evidence |
| `hazardreports` | `HazardReport.js` | Citizen-reported localized hazards (e.g. leaning power poles, blocked storm culverts) |
| `callbackrequests` | `CallbackRequest.js` | Idempotent emergency callback queues for stranded citizens |

### 3. Relief Logistics & Shelter Infrastructure
| Collection | Model File | Purpose |
|---|---|---|
| `shelters` | `Shelter.js` | Safe evacuation shelters, GeoJSON coordinates, total capacity, current occupancy, and amenities |
| `resources` | `Resource.js` | Emergency supplies: food rations, water purification kits, trauma meds, boats, and heavy excavators |
| `tasks` | `Task.js` | Field response tasks assigned to volunteers, progress logs, and priority levels |

### 4. Telemetry, IoT & Autonomous Aerial Systems
| Collection | Model File | Purpose |
|---|---|---|
| `sensors` | `Sensor.js` | IoT slope, river, and weather station hardware profiles |
| `sensorreadings` | `SensorReading.js` | Time-series telemetry: soil moisture %, pore-water pressure, MEMS tilt, and rainfall mm |
| `drones` | `Drone.js` | UAV hardware inventory, battery health, and telemetry coordinates |
| `dronemissions` | `DroneMission.js` | Autonomous search-and-rescue waypoints, delivery drops, and thermal scouting flights |
| `satellitedata` | `SatelliteData.js` | Sentinel-1 SAR and ISRO optical satellite pass metadata, cloud cover %, and radar backscatter |

### 5. Predictive Analytics & Crowd Intelligence
| Collection | Model File | Purpose |
|---|---|---|
| `predictions` | `Prediction.js` | Machine learning hazard probability scores, Landslide Susceptibility Index (LSI), and Factor of Safety (FoS) |
| `analytics` | `Analytics.js` | Aggregated response times, triage distribution, and district vulnerability matrix |
| `crowdsignals` | `CrowdSignal.js` | Ambient cellular/Bluetooth signal density patterns and cluster movement |

### 6. Mesh Networking & Communications
| Collection | Model File | Purpose |
|---|---|---|
| `lorabeacons` | `LoRaBeacon.js` | UHF/VHF LoRa gateway hardware status, battery, and radio coverage radius |
| `meshmessages` | `MeshMessage.js` | Store-and-forward mesh message buffers with TTL, hop counter, and origin node |
| `chats` | `Chat.js` | Citizen AI chatbot session histories and emergency Q&A logs |
| `notifications` | `Notification.js` | Multi-channel notification delivery records (Push, In-App, Email) |
| `newsarticles` | `NewsArticle.js` | Syndicated trilingual climate & disaster news articles (English, Hindi, Odia) with full deduplication |
| `syncoperations` | `SyncOperation.js` | Two-way conflict resolution journal for offline PWA sync batches |

### 7. Governance, Auditing & Community Feedback
| Collection | Model File | Purpose |
|---|---|---|
| `reviews` | `Review.js` | Permanent citizen feedback, star ratings, category tags, and administrative read/delete flags |

---

## Dual-Layer Permanent Persistence Architecture

For mission-critical community feedback and field reviews (`/api/reviews`), the system implements a **Dual-Layer Permanent Persistence Engine**:

```
[ POST /api/reviews ]
        │
        ├──► 1. MongoDB Review Collection (Live Querying & Sorting)
        │
        └──► 2. Server Disk Backup: Backend/data/reviews.json (Permanent Fallback)
```

1. **Automatic Initialization:** On server boot, `Backend/data/reviews.json` is verified and created if absent.
2. **Synchronous Disk Commits:** Every review write, read-flag toggle, or administrative deletion updates both MongoDB and the local JSON file.
3. **Cold Boot & Failover Safety:** If the MongoDB cluster is temporarily unreachable or restarting during a disaster blackout, the backend automatically reads reviews from the disk backup, ensuring **zero data loss**.
4. **Permanent Retention:** Reviews **never expire, auto-archive, or get overwritten**. Only an authenticated Administrator can permanently delete a review via `DELETE /api/reviews/:id`.

---

## Geospatial Indexing

All spatial models (`Shelter`, `SOS`, `Resource`, `Incident`, `Sensor`, `LoRaBeacon`) utilize MongoDB **2dsphere indexes**:

```javascript
// GeoJSON Coordinates Schema: [longitude, latitude]
location: {
  type: {
    type: String,
    enum: ['Point'],
    default: 'Point'
  },
  coordinates: {
    type: [Number], // [lng, lat]
    required: true
  }
}

// 2dsphere Geospatial Index
schema.index({ location: '2dsphere' });
```

This enables sub-millisecond queries for:
- Finding the nearest 5 safe shelters: `$near` / `$maxDistance`
- Bounding-box disaster perimeter containment: `$geoWithin` / `$polygon`

---

## Database Security Best Practices

1. **Credentials Isolation:** Database credentials and cluster connection strings must remain exclusively in `Backend/.env` and must never be committed to git.
2. **NoSQL Injection Prevention:** `express-mongo-sanitize` is enforced on all incoming `req.body`, `req.query`, and `req.params` to neutralize `$` and `.` operator injection attacks.
3. **Field-Level Projections:** User password hashes (`password`) are protected with `select: false` by default in Mongoose schemas.