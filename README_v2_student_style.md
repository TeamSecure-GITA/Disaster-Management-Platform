Disaster Management Platform - Backend

Backend repository for our Disaster Management Platform, developed by TeamSecure-GITA.

The backend provides APIs and services for user management, disaster information, emergency alerts, SOS requests, shelters, resources, volunteers, sensors, drones, notifications and other parts of the platform.

Tech Stack

Node.js

Express.js

MongoDB

Mongoose

JWT for authentication

bcryptjs for password hashing

Socket.IO for real-time communication

Axios for external API requests

Multer for file uploads

Nodemailer for email services

node-cron for scheduled tasks

Jest + Supertest for testing

Main Features

The backend currently contains modules for:

User registration and login

JWT authentication

Disaster management

Emergency alerts

SOS requests

Shelter management

Resource management

Volunteer management

Task management

Notifications

Sensor and sensor-reading data

Drone and drone-mission management

Satellite data

Weather service integration

AI chatbot integration

Predictions

Analytics

Real-time Socket.IO communication

File uploads

Background/scheduled jobs

Project Structure

Backend/
│
├── config/              # Database, environment and CORS configuration
├── controllers/         # Request handling
├── docs/                # Backend documentation
├── jobs/                # Scheduled/background jobs
├── middleware/          # Authentication, validation, security etc.
├── models/              # MongoDB/Mongoose models
├── routes/              # API routes
├── services/            # Main business and external-service logic
├── sockets/             # Socket.IO events
├── tests/               # Backend tests
├── uploads/             # Uploaded files
├── utils/               # Reusable helper functions
├── validators/          # Request validation
│
├── .env                 # Local environment variables
├── package.json
├── package-lock.json
└── server.js            # Application entry point

How the Backend Works

The backend is organized into separate layers instead of putting everything inside server.js.

A normal API request follows this flow:

Client
  ↓
Route
  ↓
Middleware
  ↓
Controller
  ↓
Service
  ↓
Model
  ↓
MongoDB

For real-time features, Socket.IO is used separately:

Client
  ↓
Socket.IO
  ↓
Socket Handler
  ↓
Service / Database

This structure makes it easier to add or modify individual features without changing the complete backend.

Modules

Authentication

Authentication is handled using JWT.

The backend also uses bcryptjs for storing passwords as hashes instead of plain text.

Main authentication operations include:

Register
Login
Token generation
Password verification
Protected routes

Disaster & Alerts

The disaster and alert modules are used for storing and managing disaster-related information and emergency alerts.

The backend also contains an alert Socket.IO module and an alert expiry job for real-time/lifecycle handling.

SOS

The SOS module handles emergency requests from users.

It includes:

SOS creation

SOS retrieval

User association

SOS validation

Real-time SOS communication

Shelters

Shelters are stored as separate database records and can be managed through the shelter API.

The module has:

Model
Controller
Service
Routes
Validator
Tests

Resources

The resource module is used for disaster-response resources.

It follows the same controller/service/model approach and has its own validation and tests.

Volunteers

The volunteer module handles volunteer-related information.

The backend contains:

Volunteer model

Volunteer controller

Volunteer service

Volunteer routes

Volunteer middleware

Volunteer validation

Volunteer tests

Tasks

Tasks can be used to represent activities that need to be handled during disaster response.

The task module provides the API and database structure for managing these records.

Sensors

The sensor section is intended for IoT/disaster monitoring data.

It contains separate handling for:

Sensors
Sensor readings
Sensor services
Sensor routes
Real-time sensor events

This allows the backend to act as the server-side layer for sensor-based disaster monitoring.

Drones

The backend contains separate models for drones and drone missions.

It also includes:

Drone controller

Drone service

Drone routes

Drone Socket.IO handling

This gives the platform a structure for adding drone-based monitoring or response features.

Satellite Data

Satellite-related information has its own model, controller, service, route and scheduled update job.

Weather

The weather service uses an external API through Axios.

The API key is supplied through an environment variable rather than being written directly in the source code.

WEATHER_API_KEY=your_api_key

AI Chatbot

The backend includes a chatbot service which can communicate with a separate AI chatbot server.

The URL is configured using:

AI_CHATBOT_URL=http://localhost:8000

This keeps the AI service separate from the main Node.js backend.

Notifications

The notification module handles application notifications and also contains Socket.IO support for real-time notification events.

Predictions & Analytics

Separate modules are available for prediction and analytics data.

The backend also contains scheduled jobs related to prediction processing.

API Routes

The main route groups currently present in the project are:

Module

Base Route

Authentication

/api/auth

Users

/api/users

Alerts

/api/alerts

Disasters

/api/disasters

Shelters

/api/shelters

Resources

/api/resources

Volunteers

/api/volunteers

SOS

/api/sos

Tasks

/api/tasks

Drones

/api/drones

Notifications

/api/notifications

Predictions

/api/predictions

Analytics

/api/analytics

Sensors

/api/sensors

Satellite

/api/satellite

Chat

/api/chat

These are the route groups available in the backend codebase. The application bootstrap still needs to register all route modules in server.js before all of them are available from a running server.

Real-Time Communication

Socket.IO is included for features where the frontend needs updates without repeatedly requesting the server.

Current socket modules include:

alertSocket.js
droneSocket.js
notificationSocket.js
sensorSocket.js
sosSocket.js
socket.js

The base socket implementation also supports room-based communication.

Scheduled Jobs

The backend contains the following job modules:

alertExpiryJob.js
notificationJob.js
predictionJob.js
satelliteUpdateJob.js
weatherUpdateJob.js

These are intended for tasks that should happen automatically instead of waiting for a user request.

Security

Some of the security measures already included in the backend are:

JWT authentication

bcrypt password hashing

Helmet

CORS configuration

Rate limiting

Request validation

Authentication middleware

Role-specific middleware

Centralized error middleware

Environment variables for secrets

Controlled file uploads

Do not upload the real .env file or API keys to GitHub.

Environment Setup

Create a .env file inside the Backend directory.

Example:

NODE_ENV=development
PORT=5000

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

FRONTEND_URL=http://localhost:5500

AI_CHATBOT_URL=http://localhost:8000

WEATHER_API_KEY=your_weather_api_key

UPLOAD_DIRECTORY=uploads
MAX_FILE_SIZE=10485760

BCRYPT_SALT_ROUNDS=12

LOG_LEVEL=info

SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASSWORD=
SMTP_SECURE=
SMTP_FROM=

Use your own values for the variables above.

Running Locally

1. Clone the repository

git clone https://github.com/TeamSecure-GITA/Disaster-Management-Platform.git

2. Go to the backend

cd Disaster-Management-Platform/Backend

3. Install packages

npm install

4. Create .env

Add the required environment variables.

5. Start the development server

npm run dev

For the normal start command:

npm start

The default port is:

5000

You can change it using the PORT variable.

Testing

The backend includes Jest and Supertest tests.

Current test files include:

alert.test.js
auth.test.js
resource.test.js
shelter.test.js
sos.test.js
volunteer.test.js

Run:

npm test

Backend Documentation

More detailed documentation is available inside the docs folder:

docs/
├── API.md
├── ARCHITECTURE.md
└── DATABASE.md

Current Development Status

The backend has the main modules required for the disaster-management platform, but some parts are still being integrated.

One important point is that the current server.js does not yet register every route module and does not fully initialize the Socket.IO/background-job layer.

There is also database connection logic that should be consolidated with the existing database configuration file.

So, at the moment, the repository should be considered an active development project, rather than a completely production-ready backend.

This is intentional documentation of the current codebase rather than claiming functionality that has not yet been connected.

What We Plan to Improve

Some of the next backend improvements are:

Complete route registration

Complete Socket.IO initialization

Connect scheduled jobs through the application startup

Clean up duplicate database connection logic

Expand API tests

Add API documentation with examples

Add Swagger/OpenAPI

Improve validation and authorization

Add pagination where required

Add deployment configuration

Team

TeamSecure-GITA

This backend is being developed as part of our Disaster Management Platform project.

License

This project is currently intended for educational, project-development and hackathon purposes.

See the repository license file for the exact terms.

<p align="center">
  Made by <b>TeamSecure-GITA</b>
</p>
