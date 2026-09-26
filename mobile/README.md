# Disaster Sentinel — Mission-Critical Disaster Management Mobile App

Disaster Sentinel is an offline-first, real-time emergency disaster intelligence and response mobile app built with React Native and Expo Router. It provides citizens, first responders, and emergency authorities with early warning alerts, one-tap SOS dispatch, geotechnical risk prognostics, AI-assisted triage, and LoRa mesh resilience.

---

## Key Architecture Capabilities

1. **Life-Critical Emergency SOS**:
   - 3-second hardware-debounced countdown with instant cancel.
   - Dual-channel broadcast via cellular REST API + WebSocket, with seamless fallback to offline SQLite storage and LoRa mesh packet dispatch.
   - Instant live telemetry sharing (GPS, battery, medical profile, emergency contacts).

2. **Autonomous Multi-Hazard Risk & Geotechnical Forecasting**:
   - Live synchronization with ML prediction engines (`/predictions/landslide`, `/predictions/forecast`, `/predict`).
   - Mohr-Coulomb Factor of Safety ($FoS$) display, precipitation accumulation curves, and real-time hazard zoning.

3. **Multimodal AI Disaster Copilot**:
   - Natural language emergency instructions with Google Gemini 2.0 Flash integration and offline emergency response heuristics.
   - On-device damage image classification and voice guidance.

4. **Zero-Connectivity & LoRa Mesh Operation**:
   - Local database with SQLite and AsyncStorage.
   - Sync engine with conflict resolution and priority queues.
   - LoRa mesh network telemetry packet parser and broadcast fallback.

5. **Safe Evacuation & Shelter Coordination**:
   - Real-time shelter occupancy, medical availability, distance, and safe corridor routing.
   - Family safety circles with location tracking and check-in pings.

---

## Directory Structure

```
mobile/
├── app/               # Expo Router file-based screens
├── components/        # Reusable design system & domain widgets
├── services/          # API, WebSocket, GPS, Notifications, LoRa
├── stores/            # Zustand global state management
├── hooks/             # Custom React lifecycle & sensor hooks
├── database/          # SQLite DAO & migration layer
├── offline/           # Sync queue & cache policy engine
├── permissions/       # Android runtime permission orchestration
├── notifications/     # Local & push emergency alerts
├── lora/              # LoRa mesh connection & packet parsing
├── types/             # Strongly-typed TypeScript contracts
├── utils/             # Geodesic, formatting, validation helpers
├── config/            # API endpoints & environment constants
├── constants/         # Theme colors, typography, hazards, emergency
├── providers/         # Global context providers
├── security/          # Keystore encryption & biometric verification
└── tests/             # Automated test suites
```

---

## Quick Start

```bash
# 1. Install dependencies
cd mobile
npm install

# 2. Start Expo development server
npm run start

# 3. Launch on Android Emulator or physical device
npm run android
```
