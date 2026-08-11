const USER_ROLES = Object.freeze({
  USER: "user",
  VOLUNTEER: "volunteer",
  ADMIN: "admin",
  SUPER_ADMIN: "super_admin",
  DISASTER_MANAGER: "disaster_manager",
  MEDICAL_RESPONDER: "medical_responder",
  RESCUE_TEAM: "rescue_team",
});

const DISASTER_TYPES = Object.freeze({
  FLOOD: "flood",
  EARTHQUAKE: "earthquake",
  CYCLONE: "cyclone",
  TSUNAMI: "tsunami",
  LANDSLIDE: "landslide",
  FIRE: "fire",
  DROUGHT: "drought",
  HEATWAVE: "heatwave",
  COLD_WAVE: "cold_wave",
  STORM: "storm",
  LIGHTNING: "lightning",
  INDUSTRIAL_ACCIDENT: "industrial_accident",
  BIOLOGICAL: "biological",
  CHEMICAL: "chemical",
  OTHER: "other",
});

const ALERT_LEVELS = Object.freeze({
  INFO: "info",
  LOW: "low",
  MODERATE: "moderate",
  HIGH: "high",
  CRITICAL: "critical",
});

const ALERT_STATUS = Object.freeze({
  DRAFT: "draft",
  ACTIVE: "active",
  RESOLVED: "resolved",
  EXPIRED: "expired",
  CANCELLED: "cancelled",
});

const SOS_STATUS = Object.freeze({
  PENDING: "pending",
  RECEIVED: "received",
  ASSIGNED: "assigned",
  IN_PROGRESS: "in_progress",
  RESOLVED: "resolved",
  CANCELLED: "cancelled",
  FALSE_ALARM: "false_alarm",
});

const SOS_PRIORITY = Object.freeze({
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  CRITICAL: "critical",
});

const VOLUNTEER_STATUS = Object.freeze({
  PENDING: "pending",
  APPROVED: "approved",
  ACTIVE: "active",
  INACTIVE: "inactive",
  SUSPENDED: "suspended",
  REJECTED: "rejected",
});

const TASK_STATUS = Object.freeze({
  PENDING: "pending",
  ASSIGNED: "assigned",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
});

const TASK_PRIORITY = Object.freeze({
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  CRITICAL: "critical",
});

const SHELTER_STATUS = Object.freeze({
  ACTIVE: "active",
  FULL: "full",
  CLOSED: "closed",
  TEMPORARILY_CLOSED: "temporarily_closed",
});

const RESOURCE_STATUS = Object.freeze({
  AVAILABLE: "available",
  LOW_STOCK: "low_stock",
  OUT_OF_STOCK: "out_of_stock",
  RESERVED: "reserved",
});

const NOTIFICATION_TYPES = Object.freeze({
  ALERT: "alert",
  SOS: "sos",
  TASK: "task",
  SYSTEM: "system",
  WEATHER: "weather",
  DISASTER: "disaster",
  VOLUNTEER: "volunteer",
  RESOURCE: "resource",
});

const SENSOR_TYPES = Object.freeze({
  WATER_LEVEL: "water_level",
  TEMPERATURE: "temperature",
  HUMIDITY: "humidity",
  SMOKE: "smoke",
  SOIL_MOISTURE: "soil_moisture",
  AIR_QUALITY: "air_quality",
  PRESSURE: "pressure",
  WIND_SPEED: "wind_speed",
  RAINFALL: "rainfall",
});

const DRONE_STATUS = Object.freeze({
  AVAILABLE: "available",
  IN_MISSION: "in_mission",
  CHARGING: "charging",
  MAINTENANCE: "maintenance",
  OFFLINE: "offline",
});

const DRONE_MISSION_STATUS = Object.freeze({
  PLANNED: "planned",
  ASSIGNED: "assigned",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  FAILED: "failed",
});

const PREDICTION_STATUS = Object.freeze({
  PENDING: "pending",
  PROCESSING: "processing",
  COMPLETED: "completed",
  FAILED: "failed",
});

const LANGUAGES = Object.freeze({
  ENGLISH: "en",
  HINDI: "hi",
  ODIA: "od",
});

const DEFAULTS = Object.freeze({
  PORT: 5000,
  JWT_EXPIRES_IN: "7d",
  BCRYPT_SALT_ROUNDS: 12,
  PAGINATION_PAGE: 1,
  PAGINATION_LIMIT: 20,
  MAX_PAGINATION_LIMIT: 100,
  DEFAULT_SEARCH_RADIUS_KM: 10,
});

const HTTP_STATUS = Object.freeze({
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
});

module.exports = {
  USER_ROLES,
  DISASTER_TYPES,
  ALERT_LEVELS,
  ALERT_STATUS,
  SOS_STATUS,
  SOS_PRIORITY,
  VOLUNTEER_STATUS,
  TASK_STATUS,
  TASK_PRIORITY,
  SHELTER_STATUS,
  RESOURCE_STATUS,
  NOTIFICATION_TYPES,
  SENSOR_TYPES,
  DRONE_STATUS,
  DRONE_MISSION_STATUS,
  PREDICTION_STATUS,
  LANGUAGES,
  DEFAULTS,
  HTTP_STATUS,
};