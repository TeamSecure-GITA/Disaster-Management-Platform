"""
Application configuration.

Centralized configuration for:
- Environment variables
- API settings
- Database
- CORS
- AI/ML services
- External data providers
- Security
- Feature flags
- Monitoring
"""

from functools import lru_cache
from typing import List, Optional

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Global application settings.

    Values can be supplied through environment variables or a .env file.
    """

    # ------------------------------------------------------------------
    # Application
    # ------------------------------------------------------------------

    APP_NAME: str = "Disaster Management & Climate Resilience Platform"

    APP_VERSION: str = "1.0.0"

    APP_DESCRIPTION: str = (
        "AI-powered disaster monitoring, prediction, analytics, "
        "decision support and emergency response platform."
    )

    ENVIRONMENT: str = "development"

    DEBUG: bool = True

    API_V1_PREFIX: str = "/api/v1"

    PROJECT_NAME: str = "Disaster Management Platform"

    # ------------------------------------------------------------------
    # Server
    # ------------------------------------------------------------------

    HOST: str = "0.0.0.0"

    PORT: int = 8000

    WORKERS: int = 1

    # ------------------------------------------------------------------
    # Security
    # ------------------------------------------------------------------

    SECRET_KEY: str = Field(
        default="change-this-secret-key-in-production",
        min_length=16,
    )

    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    ALGORITHM: str = "HS256"

    # ------------------------------------------------------------------
    # CORS
    # ------------------------------------------------------------------

    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
    ]

    CORS_ALLOW_CREDENTIALS: bool = True

    CORS_ALLOW_METHODS: List[str] = ["*"]

    CORS_ALLOW_HEADERS: List[str] = ["*"]

    # ------------------------------------------------------------------
    # Database
    # ------------------------------------------------------------------

    DATABASE_URL: str = (
        "sqlite+aiosqlite:///./disaster_management.db"
    )

    DATABASE_ECHO: bool = False

    DATABASE_POOL_SIZE: int = 10

    DATABASE_MAX_OVERFLOW: int = 20

    # ------------------------------------------------------------------
    # Redis / Cache
    # ------------------------------------------------------------------

    REDIS_URL: str = "redis://localhost:6379/0"

    CACHE_ENABLED: bool = False

    CACHE_TTL_SECONDS: int = 300

    # ------------------------------------------------------------------
    # AI / LLM
    # ------------------------------------------------------------------

    OPENAI_API_KEY: Optional[str] = None

    GEMINI_API_KEY: Optional[str] = None

    VITE_GEMINI_API_KEY: Optional[str] = None

    VITE_FIREBASE_API_KEY: Optional[str] = None

    AI_MODEL: str = "gemini-2.0-flash"

    AI_TEMPERATURE: float = 0.2

    AI_MAX_TOKENS: int = 4096

    AI_ENABLED: bool = True

    @property
    def EFFECTIVE_GEMINI_KEY(self) -> Optional[str]:
        return self.GEMINI_API_KEY or self.VITE_GEMINI_API_KEY or self.VITE_FIREBASE_API_KEY or None

    # ------------------------------------------------------------------
    # RAG
    # ------------------------------------------------------------------

    RAG_ENABLED: bool = False

    EMBEDDING_MODEL: str = "sentence-transformers/all-MiniLM-L6-v2"

    VECTOR_DATABASE_URL: Optional[str] = None

    RAG_TOP_K: int = 5

    RAG_SIMILARITY_THRESHOLD: float = 0.65

    # ------------------------------------------------------------------
    # ML
    # ------------------------------------------------------------------

    ML_ENABLED: bool = True

    MODEL_DIRECTORY: str = "./models"

    MODEL_VERSION: str = "v1"

    ML_CONFIDENCE_THRESHOLD: float = 0.70

    ENABLE_SHAP: bool = True

    ENABLE_CALIBRATION: bool = True

    # ------------------------------------------------------------------
    # Prediction
    # ------------------------------------------------------------------

    PREDICTION_ENABLED: bool = True

    PREDICTION_CACHE_SECONDS: int = 300

    # Hazard-specific thresholds.
    #
    # These are baseline/demo thresholds and should be calibrated
    # against validated regional datasets before operational use.

    LANDSLIDE_RISK_THRESHOLD: float = 0.70

    FLOOD_RISK_THRESHOLD: float = 0.70

    CYCLONE_RISK_THRESHOLD: float = 0.70

    WILDFIRE_RISK_THRESHOLD: float = 0.70

    EARTHQUAKE_RISK_THRESHOLD: float = 0.70

    # ------------------------------------------------------------------
    # Weather / External Data
    # ------------------------------------------------------------------

    WEATHER_API_KEY: Optional[str] = None

    WEATHER_API_URL: Optional[str] = None

    IMD_API_URL: Optional[str] = None

    SATELLITE_API_URL: Optional[str] = None

    SENSOR_API_URL: Optional[str] = None

    # ------------------------------------------------------------------
    # Maps / Geospatial
    # ------------------------------------------------------------------

    MAPS_API_KEY: Optional[str] = None

    MAP_PROVIDER: str = "openstreetmap"

    DEFAULT_LATITUDE: float = 20.2961

    DEFAULT_LONGITUDE: float = 85.8245

    DEFAULT_ZOOM: int = 7

    # ------------------------------------------------------------------
    # WebSocket
    # ------------------------------------------------------------------

    WEBSOCKET_ENABLED: bool = True

    WEBSOCKET_HEARTBEAT_SECONDS: int = 30

    WEBSOCKET_MAX_CONNECTIONS: int = 1000

    # ------------------------------------------------------------------
    # Notifications
    # ------------------------------------------------------------------

    NOTIFICATIONS_ENABLED: bool = False

    EMAIL_ENABLED: bool = False

    SMS_ENABLED: bool = False

    PUSH_ENABLED: bool = False

    # ------------------------------------------------------------------
    # Logging
    # ------------------------------------------------------------------

    LOG_LEVEL: str = "INFO"

    LOG_FORMAT: str = "json"

    ENABLE_REQUEST_LOGGING: bool = True

    # ------------------------------------------------------------------
    # Monitoring
    # ------------------------------------------------------------------

    MONITORING_ENABLED: bool = True

    ENABLE_METRICS: bool = True

    ENABLE_MODEL_MONITORING: bool = True

    # ------------------------------------------------------------------
    # Feature Flags
    # ------------------------------------------------------------------

    ENABLE_AI_COPILOT: bool = True

    ENABLE_MULTIMODAL_AI: bool = False

    ENABLE_DIGITAL_TWIN: bool = False

    ENABLE_SIMULATION: bool = True

    ENABLE_REALTIME_ANALYTICS: bool = True

    ENABLE_SENSOR_TELEMETRY: bool = True

    ENABLE_EXPERIMENTAL_FEATURES: bool = False

    # ------------------------------------------------------------------
    # Experimental / Research
    # ------------------------------------------------------------------

    ENABLE_QUANTUM_EXPERIMENTS: bool = False

    ENABLE_WIFI_CSI_EXPERIMENTS: bool = False

    ENABLE_ACOUSTIC_MESH: bool = False

    ENABLE_OFFLINE_MESH: bool = False

    ENABLE_NFC_FEATURES: bool = False

    # ------------------------------------------------------------------
    # Safety
    # ------------------------------------------------------------------

    REQUIRE_HUMAN_CONFIRMATION: bool = True

    ENABLE_AI_SAFETY_CHECKS: bool = True

    ENABLE_HALLUCINATION_CHECK: bool = True

    # ------------------------------------------------------------------
    # Rate limiting
    # ------------------------------------------------------------------

    RATE_LIMIT_ENABLED: bool = True

    RATE_LIMIT_REQUESTS: int = 100

    RATE_LIMIT_WINDOW_SECONDS: int = 60

    # ------------------------------------------------------------------
    # File Upload
    # ------------------------------------------------------------------

    MAX_UPLOAD_SIZE_MB: int = 25

    ALLOWED_IMAGE_TYPES: List[str] = [
        "image/jpeg",
        "image/png",
        "image/webp",
    ]

    ALLOWED_DOCUMENT_TYPES: List[str] = [
        "application/pdf",
        "text/plain",
        "application/json",
    ]

    # ------------------------------------------------------------------
    # Environment validation
    # ------------------------------------------------------------------

    @field_validator("ENVIRONMENT")
    @classmethod
    def validate_environment(cls, value: str) -> str:
        allowed = {
            "development",
            "testing",
            "staging",
            "production",
        }

        value = value.lower()

        if value not in allowed:
            raise ValueError(
                f"ENVIRONMENT must be one of {allowed}"
            )

        return value

    @field_validator("LOG_LEVEL")
    @classmethod
    def validate_log_level(cls, value: str) -> str:
        allowed = {
            "DEBUG",
            "INFO",
            "WARNING",
            "ERROR",
            "CRITICAL",
        }

        value = value.upper()

        if value not in allowed:
            raise ValueError(
                f"LOG_LEVEL must be one of {allowed}"
            )

        return value

    @field_validator("AI_TEMPERATURE")
    @classmethod
    def validate_temperature(cls, value: float) -> float:
        if not 0.0 <= value <= 2.0:
            raise ValueError(
                "AI_TEMPERATURE must be between 0 and 2."
            )

        return value

    @field_validator(
        "ML_CONFIDENCE_THRESHOLD",
        "LANDSLIDE_RISK_THRESHOLD",
        "FLOOD_RISK_THRESHOLD",
        "CYCLONE_RISK_THRESHOLD",
        "WILDFIRE_RISK_THRESHOLD",
        "EARTHQUAKE_RISK_THRESHOLD",
    )
    @classmethod
    def validate_probability(cls, value: float) -> float:
        if not 0.0 <= value <= 1.0:
            raise ValueError(
                "Probability thresholds must be between 0 and 1."
            )

        return value

    model_config = SettingsConfigDict(
        env_file=(".env", "Backend/.env", "../Backend/.env", "frontend/.env", "../frontend/.env"),
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )


@lru_cache
def get_settings() -> Settings:
    """
    Return a cached Settings instance.

    Using lru_cache prevents repeatedly parsing environment
    variables throughout the application lifecycle.
    """

    return Settings()


settings = get_settings()