# Disaster Management Platform API

## Base URL

http://localhost:5000

## Authentication

Authentication endpoints:

- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/refresh
- POST /api/auth/logout
- PATCH /api/auth/change-password
- GET /api/auth/me

Authenticated requests must include `Authorization: Bearer <access-token>`.

Runtime endpoints:

- GET /api/health - liveness check; includes current database state
- GET /api/ready - readiness check; returns `503` until MongoDB is connected

Geospatial create requests for shelters, resources, and SOS requests use
`latitude` and `longitude`; the backend stores them as GeoJSON coordinates in
`[longitude, latitude]` order.

## Socket.IO

Connect with the access token in `auth.token` or an `Authorization: Bearer`
handshake header. Authenticated clients automatically join their own
`user:<userId>` room and the `alerts` room. Only `admin` and `operator` users
may join the `operations` room.

Supported room events are `joinRoom`, `leaveRoom`, and `joinUserRoom`; room
requests return an acknowledgement with `success` and `message` fields.
Real-time events include `newAlert`, `alertUpdated`, `alertDeleted`,
`sensorReading`, `newSOS`, `sosUpdated`, `sosResolved`, and `notification`.

## Users

- GET /api/users
- GET /api/users/:id
- PUT /api/users/:id
- DELETE /api/users/:id

## Alerts

- GET /api/alerts
- GET /api/alerts/:id
- POST /api/alerts
- PUT /api/alerts/:id
- DELETE /api/alerts/:id

## Disasters

- GET /api/disasters
- GET /api/disasters/:id
- POST /api/disasters
- PUT /api/disasters/:id
- DELETE /api/disasters/:id

## Shelters

- GET /api/shelters
- GET /api/shelters/:id
- POST /api/shelters
- PUT /api/shelters/:id
- DELETE /api/shelters/:id

## Resources

- GET /api/resources
- GET /api/resources/:id
- POST /api/resources
- PUT /api/resources/:id
- DELETE /api/resources/:id

## Volunteers

- GET /api/volunteers
- GET /api/volunteers/:id
- POST /api/volunteers
- PUT /api/volunteers/:id
- DELETE /api/volunteers/:id

## SOS

- GET /api/sos
- GET /api/sos/:id
- POST /api/sos
- PUT /api/sos/:id
- DELETE /api/sos/:id

## Additional APIs

- GET, POST, PATCH, DELETE /api/drones
- PATCH /api/drones/:id/status
- PATCH /api/drones/:id/telemetry
- GET, POST /api/drones/missions
- GET /api/drones/missions/:id
- PATCH /api/drones/missions/:id/status
- GET /api/satellite
- POST /api/satellite
- GET /api/satellite/:id
- PATCH /api/satellite/:id/status
- GET /api/sensors
- GET /api/notifications
- GET /api/predictions
- GET /api/analytics
- GET, POST /api/family
- GET, POST /api/rescue-id
- GET, POST /api/damage-assessment
- GET, POST /api/evacuation
- POST /api/sync/batch
- GET /api/dashboard/summary
- POST /api/dashboard/hazard-reports
- GET /api/dashboard/hazard-reports/mine
- POST /api/dashboard/callbacks

The dashboard summary returns active alerts, active rescue operations, open
shelters, pending reports, unread notifications, and family safety totals.
Hazard reports require a `description` and may include `{ location: { latitude,
longitude } }`. Callback requests are idempotent while an earlier request is
queued or assigned.