"""
Main FastAPI application.

Entry point:
    uvicorn app.main:app --reload

Production:
    uvicorn app.main:app --host 0.0.0.0 --port 8000
"""

from __future__ import annotations

import logging
import sys
import time
import uuid
from contextlib import asynccontextmanager
from pathlib import Path

# Enable direct script execution (e.g. `python app/main.py`)
if __package__ is None or __package__ == "":
    backend_root = str(Path(__file__).resolve().parent.parent)
    if backend_root not in sys.path:
        sys.path.insert(0, backend_root)
    __package__ = "app"

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

from .config import settings


# ============================================================
# Logging
# ============================================================

logging.basicConfig(
    level=getattr(
        logging,
        settings.LOG_LEVEL,
        logging.INFO,
    ),
    format=(
        "%(asctime)s | "
        "%(levelname)s | "
        "%(name)s | "
        "%(message)s"
    ),
)

logger = logging.getLogger(
    "disaster-management-platform"
)


# ============================================================
# Application lifecycle
# ============================================================

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application startup/shutdown lifecycle.
    """

    logger.info(
        "Starting %s v%s",
        settings.APP_NAME,
        settings.APP_VERSION,
    )

    logger.info(
        "Environment: %s",
        settings.ENVIRONMENT,
    )

    logger.info(
        "ML enabled: %s",
        settings.ML_ENABLED,
    )

    logger.info(
        "AI enabled: %s",
        settings.AI_ENABLED,
    )

    logger.info(
        "WebSocket enabled: %s",
        settings.WEBSOCKET_ENABLED,
    )

    # --------------------------------------------------------
    # Startup
    # --------------------------------------------------------

    try:
        # Database initialization will be connected here.
        logger.info("Database initialization ready.")

        # ML model loading will be connected here.
        if settings.ML_ENABLED:
            logger.info(
                "ML subsystem initialized."
            )

        # AI subsystem initialization.
        if settings.AI_ENABLED:
            logger.info(
                "AI subsystem initialized."
            )

        logger.info(
            "Application startup completed."
        )

        yield

    except Exception:
        logger.exception(
            "Application startup/runtime failure."
        )
        raise

    finally:
        # ----------------------------------------------------
        # Shutdown
        # ----------------------------------------------------

        logger.info(
            "Shutting down application..."
        )

        # Close database connections.
        # Stop workers.
        # Close Redis.
        # Release ML models/resources.

        logger.info(
            "Application shutdown completed."
        )


# ============================================================
# FastAPI application
# ============================================================

app = FastAPI(
    title=settings.PROJECT_NAME,
    description=settings.APP_DESCRIPTION,
    version=settings.APP_VERSION,
    debug=settings.DEBUG,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=settings.CORS_ALLOW_CREDENTIALS,
    allow_methods=settings.CORS_ALLOW_METHODS,
    allow_headers=settings.CORS_ALLOW_HEADERS,
)


# ============================================================
# Request middleware
# ============================================================

@app.middleware("http")
async def request_context_middleware(
    request: Request,
    call_next,
):
    """
    Add:
    - Request ID
    - Request timing
    - Response headers
    """

    request_id = request.headers.get(
        "X-Request-ID"
    )

    if not request_id:
        request_id = str(uuid.uuid4())

    request.state.request_id = request_id

    start_time = time.perf_counter()

    try:
        response = await call_next(request)

    except Exception:
        logger.exception(
            "Unhandled request error | "
            "request_id=%s | path=%s",
            request_id,
            request.url.path,
        )

        raise

    duration = (
        time.perf_counter() - start_time
    )

    response.headers["X-Request-ID"] = request_id

    response.headers[
        "X-Process-Time"
    ] = f"{duration:.6f}"

    if settings.ENABLE_REQUEST_LOGGING:
        logger.info(
            "%s %s -> %s | %.3fs | request_id=%s",
            request.method,
            request.url.path,
            response.status_code,
            duration,
            request_id,
        )

    return response


# ============================================================
# Validation exception handler
# ============================================================

@app.exception_handler(
    RequestValidationError
)
async def validation_exception_handler(
    request: Request,
    exc: RequestValidationError,
):
    """
    Standardized validation error response.
    """

    request_id = getattr(
        request.state,
        "request_id",
        "unknown",
    )

    return JSONResponse(
        status_code=422,
        content={
            "success": False,
            "error": {
                "code": "VALIDATION_ERROR",
                "message": (
                    "Request validation failed."
                ),
                "details": exc.errors(),
            },
            "request_id": request_id,
        },
    )


# ============================================================
# Global exception handler
# ============================================================

@app.exception_handler(Exception)
async def global_exception_handler(
    request: Request,
    exc: Exception,
):
    """
    Catch unexpected application exceptions.
    """

    request_id = getattr(
        request.state,
        "request_id",
        "unknown",
    )

    logger.exception(
        "Unhandled exception | request_id=%s",
        request_id,
    )

    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": {
                "code": "INTERNAL_SERVER_ERROR",
                "message": (
                    "An unexpected internal "
                    "server error occurred."
                ),
            },
            "request_id": request_id,
        },
    )


# ============================================================
# Root endpoint
# ============================================================

@app.get(
    "/",
    tags=["System"],
)
async def root():
    """
    Basic API information.
    """

    return {
        "success": True,
        "name": settings.PROJECT_NAME,
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT,
        "status": "operational",
        "api": settings.API_V1_PREFIX,
        "documentation": "/docs",
    }


# ============================================================
# Health check
# ============================================================

@app.get(
    "/health",
    tags=["System"],
)
async def health_check():
    """
    Lightweight health check.

    Used by:
    - Render
    - Docker
    - Kubernetes
    - Load balancers
    - Monitoring systems
    """

    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT,
    }


# ============================================================
# Readiness check
# ============================================================

@app.get(
    "/ready",
    tags=["System"],
)
async def readiness_check():
    """
    Readiness endpoint.

    Later this should verify:
    - Database
    - Redis
    - ML models
    - AI services
    - External data providers
    """

    checks = {
        "application": True,
        "database": True,
        "ml": settings.ML_ENABLED,
        "ai": settings.AI_ENABLED,
    }

    ready = all(checks.values())

    return JSONResponse(
        status_code=200 if ready else 503,
        content={
            "ready": ready,
            "checks": checks,
        },
    )


# ============================================================
# System information
# ============================================================

@app.get(
    "/system/info",
    tags=["System"],
)
async def system_info():
    """
    Public-safe system capability information.
    """

    return {
        "application": settings.PROJECT_NAME,
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT,
        "capabilities": {
            "ai": settings.AI_ENABLED,
            "ml": settings.ML_ENABLED,
            "prediction": settings.PREDICTION_ENABLED,
            "websocket": settings.WEBSOCKET_ENABLED,
            "realtime_analytics": (
                settings.ENABLE_REALTIME_ANALYTICS
            ),
            "simulation": settings.ENABLE_SIMULATION,
            "digital_twin": (
                settings.ENABLE_DIGITAL_TWIN
            ),
            "multimodal_ai": (
                settings.ENABLE_MULTIMODAL_AI
            ),
        },
        "safety": {
            "human_confirmation": (
                settings.REQUIRE_HUMAN_CONFIRMATION
            ),
            "ai_safety_checks": (
                settings.ENABLE_AI_SAFETY_CHECKS
            ),
            "hallucination_check": (
                settings.ENABLE_HALLUCINATION_CHECK
            ),
        },
    }


# ============================================================
# Router registration
# ============================================================

def register_routers(application: FastAPI) -> None:
    """
    Register API routers.

    Routers are imported conditionally so the application
    can boot while the remaining modules are being developed.
    """

    # --------------------------------------------------------
    # API v1
    # --------------------------------------------------------

    try:
        from .api.v1 import router as api_v1_router

        application.include_router(
            api_v1_router,
            prefix=settings.API_V1_PREFIX,
        )

        logger.info(
            "API v1 router registered."
        )

    except ImportError as exc:
        logger.warning(
            "API v1 router not available yet: %s",
            exc,
        )

    # --------------------------------------------------------
    # WebSocket
    # --------------------------------------------------------

    if settings.WEBSOCKET_ENABLED:

        try:
            from .api.websocket import (
                router as websocket_router
            )

            application.include_router(
                websocket_router,
            )

        except ImportError as exc:
            logger.warning(
                "WebSocket router not available yet: %s",
                exc,
            )

    # --------------------------------------------------------
    # Root & Frontend Compatibility Router (/chat, /predict, /predictions/*, /analytics/*, /simulation/*)
    # --------------------------------------------------------
    try:
        from .api.compatibility import router as compatibility_router

        application.include_router(compatibility_router)
        logger.info("Compatibility router registered.")
    except Exception as exc:
        logger.warning("Compatibility router error: %s", exc)


# Register routers after application creation.
register_routers(app)


# ============================================================
# Development entry point
# ============================================================

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        workers=1,
    )