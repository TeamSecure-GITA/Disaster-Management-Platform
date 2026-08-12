# System Architecture

## Overview

The Disaster Management Platform uses a modular architecture.

## Backend

The backend is built with:

- Node.js
- Express.js
- MongoDB
- Mongoose
- Socket.IO

## Backend Layers

### Models

Define MongoDB schemas.

### Controllers

Handle API requests and responses.

### Routes

Define API endpoints.

### Middleware

Handles:

- Authentication
- Authorization
- Validation
- Error handling
- Rate limiting
- File uploads

### Services

Contains business logic and external API integrations.

### Utils

Contains reusable helper functions.

### Sockets

Provides real-time communication.

### Jobs

Handles scheduled/background tasks.

## Request Flow

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

## Real-Time Flow

Client
↓
Socket.IO
↓
Socket Handler
↓
Service
↓
Database / External Service