# Database Documentation

## Database

MongoDB is used as the primary database.

## Connection

The MongoDB connection string is stored in the `.env` file:

MONGO_URI=your_mongodb_connection_string

## Main Collections

- users
- volunteers
- alerts
- disasters
- shelters
- resources
- tasks
- sos
- chats
- notifications
- sensors
- sensorreadings
- drones
- dronemissions
- satellitedata
- predictions
- analytics

## ORM / ODM

Mongoose is used to define schemas and communicate with MongoDB.

## Security

Database credentials must never be committed to GitHub.

The `.env` file must be included in `.gitignore`.