"""
FastAPI application dependencies.

Contains:
- Settings dependency
- Request context
- Authentication placeholders
- Permission checks
- Database session dependency
- AI/ML service dependencies
- WebSocket connection helpers
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import AsyncGenerator, Optional

from fastapi import Depends, Header, HTTPException, Request, status

from .config import Settings, get_settings


# ============================================================
# Application settings
# ============================================================

def get_app_settings() -> Settings:
    """
    Return application settings.

    Example:
        settings = Depends(get_app_settings)
    """

    return get_settings()


# ============================================================
# Request context
# ============================================================

@dataclass
class RequestContext:
    """
    Information associated with the current request.
    """

    request_id: str
    client_host: Optional[str] = None
    user_agent: Optional[str] = None


async def get_request_context(
    request: Request,
) -> RequestContext:
    """
    Build request context.

    Request ID is created by middleware in main.py.
    """

    request_id = getattr(
        request.state,
        "request_id",
        "unknown",
    )

    client_host = None

    if request.client:
        client_host = request.client.host

    user_agent = request.headers.get("user-agent")

    return RequestContext(
        request_id=request_id,
        client_host=client_host,
        user_agent=user_agent,
    )


# ============================================================
# API authentication
# ============================================================

async def get_authorization_token(
    authorization: Optional[str] = Header(
        default=None,
        alias="Authorization",
    ),
) -> Optional[str]:
    """
    Extract Bearer token from Authorization header.

    Authentication implementation can later be connected
    to JWT/OAuth2/Keycloak/etc.
    """

    if not authorization:
        return None

    scheme, _, token = authorization.partition(" ")

    if scheme.lower() != "bearer" or not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization header.",
            headers={
                "WWW-Authenticate": "Bearer",
            },
        )

    return token


# ============================================================
# User model
# ============================================================

@dataclass
class CurrentUser:
    """
    Lightweight authenticated-user representation.

    Replace with database-backed user model when
    authentication is connected.
    """

    id: str
    username: str
    role: str
    is_active: bool = True


async def get_current_user(
    token: Optional[str] = Depends(
        get_authorization_token
    ),
) -> CurrentUser:
    """
    Resolve the authenticated user.

    Development behavior:
    - Requests without a token are treated as a demo operator.

    Production behavior:
    - Replace this with actual JWT/OAuth2 validation.
    """

    settings = get_settings()

    if settings.ENVIRONMENT == "production":
        if not token:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication required.",
                headers={
                    "WWW-Authenticate": "Bearer",
                },
            )

        # TODO:
        # Validate JWT/OAuth token here.

        return CurrentUser(
            id="authenticated-user",
            username="operator",
            role="operator",
        )

    # Development / testing demo user.
    return CurrentUser(
        id="demo-user",
        username="demo-operator",
        role="operator",
    )


# ============================================================
# Active user
# ============================================================

async def get_active_user(
    user: CurrentUser = Depends(get_current_user),
) -> CurrentUser:
    """
    Reject disabled users.
    """

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive.",
        )

    return user


# ============================================================
# Role-based permissions
# ============================================================

def require_roles(*allowed_roles: str):
    """
    Create a dependency that checks user roles.

    Example:

        @router.post("/dispatch")
        async def dispatch(
            user=Depends(
                require_roles("admin", "operator")
            )
        ):
            ...
    """

    async def role_checker(
        user: CurrentUser = Depends(get_active_user),
    ) -> CurrentUser:

        if user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=(
                    "Insufficient permissions. "
                    f"Required roles: {allowed_roles}"
                ),
            )

        return user

    return role_checker


# ============================================================
# Human confirmation
# ============================================================

async def require_human_confirmation(
    request: Request,
) -> bool:
    """
    Require explicit human confirmation for high-impact
    automated decisions.

    Client must send:

        X-Human-Confirmation: true

    This prevents an AI model from silently executing
    potentially high-impact emergency actions.
    """

    confirmation = request.headers.get(
        "X-Human-Confirmation"
    )

    if confirmation is None:
        raise HTTPException(
            status_code=status.HTTP_428_PRECONDITION_REQUIRED,
            detail=(
                "Human confirmation is required "
                "for this operation."
            ),
        )

    if confirmation.lower() != "true":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Human confirmation was not provided.",
        )

    return True


# ============================================================
# Database dependency
# ============================================================

async def get_db() -> AsyncGenerator:
    """
    Database session dependency.
    Yields transactional SQLAlchemy session.
    """
    try:
        from ml_backend.database import get_db as _db_gen

        async for session in _db_gen():
            yield session
    except Exception:
        # Fallback if database is unavailable
        yield None


# ============================================================
# AI service dependency
# ============================================================

class AIService:
    """
    Shared AI service abstraction.

    Keeps API routes independent of the underlying
    LLM provider.
    """

    def __init__(self, settings: Settings):
        self.settings = settings
        self.enabled = settings.AI_ENABLED

    async def health(self) -> dict:
        return {
            "enabled": self.enabled,
            "model": self.settings.AI_MODEL,
        }


_ai_service: Optional[AIService] = None


def get_ai_service(
    settings: Settings = Depends(get_app_settings),
) -> AIService:
    """
    Return shared AI service.
    """

    global _ai_service

    if _ai_service is None:
        _ai_service = AIService(settings)

    return _ai_service


# ============================================================
# ML service dependency
# ============================================================

class MLService:
    """
    Shared ML service abstraction.

    Actual hazard-specific models will be connected later.
    """

    def __init__(self, settings: Settings):
        self.settings = settings
        self.enabled = settings.ML_ENABLED

    async def health(self) -> dict:
        return {
            "enabled": self.enabled,
            "model_version": self.settings.MODEL_VERSION,
        }


_ml_service: Optional[MLService] = None


def get_ml_service(
    settings: Settings = Depends(get_app_settings),
) -> MLService:
    """
    Return shared ML service.
    """

    global _ml_service

    if _ml_service is None:
        _ml_service = MLService(settings)

    return _ml_service


# ============================================================
# Feature flag dependency
# ============================================================

def require_feature(feature_name: str):
    """
    Require a configuration feature flag.

    Example:

        Depends(
            require_feature("ENABLE_DIGITAL_TWIN")
        )
    """

    async def feature_checker(
        settings: Settings = Depends(get_app_settings),
    ):
        enabled = getattr(
            settings,
            feature_name,
            False,
        )

        if not enabled:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=(
                    f"Feature '{feature_name}' "
                    "is not enabled."
                ),
            )

        return True

    return feature_checker


# ============================================================
# Experimental feature protection
# ============================================================

async def require_experimental_features(
    settings: Settings = Depends(get_app_settings),
):
    """
    Protect research/experimental features.
    """

    if not settings.ENABLE_EXPERIMENTAL_FEATURES:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Experimental features are disabled.",
        )

    return True