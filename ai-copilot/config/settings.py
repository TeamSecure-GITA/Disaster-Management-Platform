import os
from functools import lru_cache
from pathlib import Path
from typing import Optional
from pydantic_settings import BaseSettings

BASE_DIR = Path(__file__).resolve().parent.parent


class Settings(BaseSettings):
    app_name: str = "Disaster AI Copilot"
    app_version: str = "0.1.0"
    debug: bool = False
    environment: str = "production"
    log_level: str = "INFO"

    # Server
    host: str = "0.0.0.0"
    port: int = 8001

    # External APIs
    openai_api_key: Optional[str] = None
    gemini_api_key: Optional[str] = None
    default_model: str = "gemini-1.5-pro"
    ml_backend_url: str = "http://localhost:8000"

    # Paths
    base_dir: Path = BASE_DIR
    data_dir: Path = BASE_DIR / "data"
    knowledge_dir: Path = BASE_DIR / "data" / "knowledge"
    config_dir: Path = BASE_DIR / "config"

    # Safety & Autonomous Guardrails
    safety_strict_mode: bool = True
    require_human_confirmation_for_evacuation: bool = True
    confidence_threshold_high: float = 0.85
    confidence_threshold_medium: float = 0.60

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
