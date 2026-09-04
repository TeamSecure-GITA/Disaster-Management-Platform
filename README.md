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
│   ├── models/                  # Mongoose schemas (24 models including NewsArticle)
│   ├── routes/                  # Express route definitions (23 route files including newsRoutes)
│   ├── services/                # Business logic layer (22 service modules including newsService)
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
        ├── App.jsx              # Root router with lazy-loaded pages & splash screen
        ├── index.css            # Global styles
        ├── assets/              # Logo & static media assets
        │   └── logo.png         # Official Disaster Management emblem
        ├── components/          # Shared UI components
        │   ├── DashboardLayout.jsx
        │   ├── Sidebar.jsx      # Navigation drawer with Climate Chronicle
        │   ├── SplashScreen.jsx # WhatsApp-style animated logo splash screen
        │   └── ...
        ├── pages/               # 28 page-level components
        │   ├── Dashboard.jsx
        │   ├── ClimateChronicle.jsx # Trilingual (EN/HI/OR) live disaster news feed
        │   ├── Alerts.jsx
        │   ├── Map.jsx
        │   ├── SOSCenter.jsx
        │   ├── ShelterFinder.jsx
        │   ├── FamilySafety.jsx
        │   ├── EvacuationPlanner.jsx
        │   ├── RescueID.jsx
        │   ├── DamageAssessment.jsx
        │   ├── Analytics.jsx
        │   ├── Chatbot.jsx
        │   ├── VoiceAssistant.jsx
        │   ├── IncidentReport.jsx
        │   ├── Notifications.jsx
        │   ├── Profile.jsx
        │   ├── SafetyGuides.jsx
        │   ├── Statistics.jsx
        │   ├── AdminDashboard.jsx
        │   └── ...
        ├── utils/               # API helpers, offline sync utilities
        └── Data/                # Static reference data
```

---

## API Reference

All API endpoints are prefixed with `/api`.

| Endpoint | Description | 
|---|---|
| `GET /api/health` | Health check — returns DB connection status |
| `GET /api/ready` | Readiness probe — returns 503 if DB is down |
| `POST /api/auth/*` | Register, login, token refresh |
| `GET/PUT /api/users/*` | User profile management |
| `GET/POST /api/alerts/*` | Disaster alerts CRUD |
| `GET/POST /api/disasters/*` | Disaster event management |
| `GET /api/news` | Get paginated climate & disaster news (`?lang=en\|hi\|or&page=1&limit=20`) |
| `GET /api/news/stats` | Aggregated news counts & latest publication timestamp per language |
| `POST /api/news/refresh` | Trigger background re-syndication from RSS sources |
| `GET/POST /api/shelters/*` | Shelter registry |
| `GET/POST /api/resources/*` | Resource tracking |
| `GET/POST /api/volunteers/*` | Volunteer enrollment & dispatch |
| `GET/POST /api/tasks/*` | Task assignment for responders |
| `POST /api/sos/*` | SOS signal creation and management |
| `GET/POST /api/chat/*` | AI chatbot message relay |
| `GET/POST /api/notifications/*` | In-app notification management |
| `GET/POST /api/sensors/*` | IoT sensor data ingestion |
| `GET/POST /api/drones/*` | Drone fleet management & missions |
| `GET/POST /api/satellite/*` | Satellite imagery data |
| `GET /api/predictions/*` | AI risk predictions |
| `GET /api/analytics/*` | Aggregated platform analytics |
| `GET/POST /api/family/*` | Family member tracking |
| `GET/POST /api/rescue-id/*` | QR rescue ID generation |
| `POST /api/damage-assessment/*` | Damage report submission |
| `GET/POST /api/evacuation/*` | Evacuation route planning |
| `POST /api/sync/*` | Offline data sync |
| `GET /api/dashboard/*` | Dashboard summary statistics |

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
