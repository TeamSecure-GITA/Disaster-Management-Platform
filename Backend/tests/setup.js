process.env.NODE_ENV = "test";
process.env.MONGO_URI ||= "mongodb://127.0.0.1:27017/disaster_management_test";
process.env.JWT_SECRET ||= "test-only-secret-that-is-at-least-32-characters-long";
process.env.CLOUD_STORAGE_PROVIDER ||= "local";
