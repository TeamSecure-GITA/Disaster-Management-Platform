# 🌐 Disaster Management Platform — Backend

<p align="center">
  <b>Backend services for the Disaster Management Platform</b><br>
  Built by <b>TeamSecure-GITA</b>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-Backend-339933?logo=node.js&logoColor=white">
  <img src="https://img.shields.io/badge/Express.js-API-000000?logo=express&logoColor=white">
  <img src="https://img.shields.io/badge/MongoDB-Database-47A248?logo=mongodb&logoColor=white">
  <img src="https://img.shields.io/badge/Socket.IO-Realtime-010101?logo=socketdotio&logoColor=white">
  <img src="https://img.shields.io/badge/Status-In%20Development-orange">
  <img src="https://img.shields.io/badge/License-All%20Rights%20Reserved-red">
</p>

## 📌 About

This repository contains the backend of our Disaster Management Platform.
The backend provides the APIs, database layer, authentication, real-time communication and supporting services required by the platform.
The main goal is to bring different disaster-response features into one backend instead of maintaining separate systems for every feature.

## What it currently covers ?

- User authentication
- Disaster and alert management
- SOS requests
- Shelters and resources
- Volunteers and tasks
- Sensor and sensor-reading data
- Drone and drone-mission management
- Notifications
- Weather integration
- AI chatbot integration
- Predictions and analytics
- Real-time communication using Socket.IO

## 🧰 Tech Stack

| Technology | Used for |
|---|---|
| Node.js | Backend runtime |
| Express.js | REST API |
| MongoDB | Database |
| Mongoose | MongoDB ODM |
| JWT | Authentication |
| bcryptjs | Password hashing |
| Socket.IO | Real-time communication |
| Axios | External API requests |
| Multer | File uploads |
| Nodemailer | Email services |
| node-cron | Scheduled jobs |
| Jest / Supertest | Testing |

## 🏗️ Backend Flow

                         FRONTEND
                            │
                    HTTP / Socket.IO
                            │
                            ▼
                    ┌───────────────┐
                    │    Routes     │
                    └───────┬───────┘
                            │
                    ┌───────▼───────┐
                    │  Middleware   │
                    │ Auth / Verify │
                    │ Validation    │
                    └───────┬───────┘
                            │
                    ┌───────▼───────┐
                    │  Controllers  │
                    └───────┬───────┘
                            │
                    ┌───────▼───────┐
                    │   Services    │
                    └───────┬───────┘
                            │
                    ┌───────▼───────┐
                    │    Models     │
                    └───────┬───────┘
                            │
                            ▼
                       MongoDB

> For real-time features:
>  Client ⇄ Socket.IO ⇄ Socket Handler ⇄ Service / Database

## 📁 Project Structure

```text
Backend/
│
├── config/          # Database, environment and CORS configuration
├── controllers/     # Request handling
├── docs/            # API / architecture / database documentation
├── jobs/            # Scheduled jobs
├── middleware/      # Authentication, validation and security
├── models/          # Mongoose models
├── routes/          # API routes
├── services/        # Business logic and external services
├── sockets/         # Socket.IO handlers
├── tests/           # Automated tests
├── uploads/         # Uploaded documents, images and videos
├── utils/           # Helper functions
├── validators/      # Request validation
│
├── .env             # Local configuration
├── package.json
├── package-lock.json
└── server.js        # Backend entry point

```

## 🚨 Features

<details>
<summary><b>🔐 Authentication</b></summary>

JWT-based authentication is used for user login and protected resources.
Passwords are hashed using bcryptjs.

#### Includes:

- Registration
- Login
- Token generation
- Password verification
- Authentication middleware

</details>

<details>
<summary><b>🆘 SOS & Emergency Response</b></summary>

The SOS module handles emergency requests and provides the structure for connecting emergency events with users and real-time communication.

</details>

<details>
<summary><b>🚨 Disaster & Alerts</b></summary>

Disaster and alert modules provide the backend structure for creating, retrieving and managing disaster-related information and emergency alerts.

</details>

<details>
<summary><b>🏠 Shelters & Resources</b></summary>

The platform contains separate modules for shelters and disaster-response resources.

</details>

<details>
<summary><b>👥 Volunteers & Tasks</b></summary>

Volunteer and task modules provide the backend structure for coordinating people and response activities.

</details>

<details>
<summary><b>📡 Sensors</b></summary>

Sensor and sensor-reading modules provide the foundation for receiving and storing IoT monitoring data.

</details>

<details>
<summary><b>🚁 Drones</b></summary>

Drone and drone-mission modules are included for future/ongoing disaster monitoring and response workflows.

</details>

<details>
<summary><b>🛰️ Satellite & Weather</b></summary>

Separate services are included for satellite-related data and external weather information.

</details>

<details>
<summary><b>🤖 AI Chatbot</b></summary>

The backend contains a chatbot service that can communicate with a separate AI service through a configurable URL.

</details>

<details>
<summary><b>🔔 Notifications & Real-Time Updates</b></summary>

Socket.IO is included for real-time alerts, notifications, SOS events, sensor updates and drone-related communication.

</details>

## 🌐 API Overview

| Module | Base Endpoint |
|---|---|
| Authentication | `/api/auth` |
| Users | `/api/users` |
| Alerts | `/api/alerts` |
| Disasters | `/api/disasters` |
| Shelters | `/api/shelters` |
| Resources | `/api/resources` |
| Volunteers | `/api/volunteers` |
| SOS | `/api/sos` |
| Tasks | `/api/tasks` |
| Drones | `/api/drones` |
| Notifications | `/api/notifications` |
| Predictions | `/api/predictions` |
| Analytics | `/api/analytics` |
| Sensors | `/api/sensors` |
| Satellite | `/api/satellite` |
| Chat | `/api/chat` |

> The route files are present in the backend codebase. Complete route registration in the application bootstrap is still part of the integration work.

## ⚡ Quick Start

### 1. Clone

git clone https://github.com/TeamSecure-GITA/Disaster-Management-Platform.git

### 2. Open the backend

cd Disaster-Management-Platform/Backend

### 3. Install dependencies

npm install

### 4. Create .env

#### Windows

type nul > .env

#### Linux / macOS

touch .env
Add your local configuration:

NODE_ENV=development
PORT=5000

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_strong_secret
JWT_EXPIRES_IN=7d

FRONTEND_URL=http://localhost:5500

AI_CHATBOT_URL=http://localhost:8000

WEATHER_API_KEY=your_weather_api_key

UPLOAD_DIRECTORY=uploads
MAX_FILE_SIZE=10485760

BCRYPT_SALT_ROUNDS=12
LOG_LEVEL=info

### 5. Run the backend

#### Development mode:

npm run dev
#### Normal start:

npm start
#### The default port is:

http://localhost:5000

## 🧪 Testing

#### Run the complete test suite:

npm test

#### Current test areas include:

tests/
├── alert.test.js
├── auth.test.js
├── resource.test.js
├── shelter.test.js
├── sos.test.js
└── volunteer.test.js

## 🔧 Useful Commands

#### Install dependencies

npm install

#### Start development server

npm run dev

#### Start server

npm start

#### Run tests

npm test

#### Run CI checks locally

From the `Backend` directory:

```bash
npm ci
npm run check
npm run test:ci
```

CI runs these checks automatically through `.github/workflows/backend.yml`.

### Offline synchronization

Authenticated clients can upload queued family changes through:

POST /api/sync/batch

The request accepts a `deviceId` and up to 50 allowlisted family operations. Each operation must contain a client-generated `operationId`; resubmitting the same operation for the same user is handled as a duplicate and is not applied twice.

### Docker deployment

Build and run the backend from the `Backend` directory:

```bash
cp .env.example .env
docker build -t disaster-management-backend .
docker run --env-file .env -p 5000:5000 disaster-management-backend
```

For a local Docker stack with MongoDB and persistent logs/uploads:

```bash
docker compose up --build -d
```

The backend readiness check is available at `GET /api/ready` and returns
`503` until MongoDB is connected. Generate a unique secret before deployment:

```bash
openssl rand -base64 48
```

Set the generated value as `JWT_SECRET` in the deployment environment. Do not
use the example value in production.

Use an externally managed MongoDB instance in production. Configure Cloudinary and Firebase credentials for durable file storage and push notifications. Do not commit `.env`, credentials, logs, or uploads.

If your package.json contains additional scripts, they can be added here later.

## 🔒 Security

#### The backend includes several security-related components:

- JWT authentication
- bcrypt password hashing
- Helmet
- CORS configuration
- Rate limiting
- Request validation
- Authentication middleware
- Role-specific middleware
- Environment-based secrets
- Controlled file uploads
- Centralized error handling

## 📂 Additional Documentation

The backend also contains:

docs/
├── API.md
├── ARCHITECTURE.md
└── DATABASE.md

These can be expanded as the backend development continues.

## 🚧 Development Status

This backend is an active project under development.
The Express API, Socket.IO runtime, scheduled jobs, MongoDB connection lifecycle,
and graceful shutdown are connected through the main server bootstrap.

## 🛣️ Next Steps

#### Our planned backend improvements include:

 - Improve authorization and validation
- Expand automated tests
- Add Swagger/OpenAPI documentation
- Improve API error responses
- Add pagination where required

## 👨‍💻 Team

### TeamSecure-GITA

#### Project: Disaster Management Platform

Built as a team project focused on using software, real-time communication, IoT data and intelligent services to support disaster-response workflows.

## 📜 License & Copyright

#### © 2026 TeamSecure-GITA. All Rights Reserved.

This repository is not open source and is provided for project evaluation, demonstration and educational purposes only.

No permission is granted to copy, reproduce, modify, redistribute, publish, sublicense, sell, or commercially use this source code or substantial portions of it without prior written permission from TeamSecure-GITA.

See LICENSE for the complete terms.

<p align="center">
  <b>🌍 Disaster Management Platform</b><br>
  TeamSecure-GITA
</p>
Welcome 
