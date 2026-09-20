"""
Human confirmation workflow for high-impact AI actions.
"""

from __future__ import annotations

import secrets
from dataclasses import dataclass, field
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional


@dataclass
class ConfirmationRequest:
    """Represents a pending human confirmation."""

    id: str
    user_id: str
    action: str
    description: str
    created_at: str
    expires_at: str
    confirmed: bool = False
    cancelled: bool = False
    metadata: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "user_id": self.user_id,
            "action": self.action,
            "description": self.description,
            "created_at": self.created_at,
            "expires_at": self.expires_at,
            "confirmed": self.confirmed,
            "cancelled": self.cancelled,
            "metadata": self.metadata,
        }


class HumanConfirmationManager:
    """
    Manages explicit confirmation for high-impact operations.

    Examples:
    - dispatch responders
    - issue evacuation order
    - close infrastructure
    - send emergency notification
    """

    HIGH_IMPACT_ACTIONS = {
        "evacuation",
        "evacuate",
        "dispatch",
        "deploy",
        "emergency_alert",
        "shutdown",
        "close_road",
        "open_dam",
        "shelter_order",
    }

    def __init__(
        self,
        expiration_minutes: int = 10,
    ):
        self.expiration_minutes = max(
            1,
            expiration_minutes,
        )

        self._requests: Dict[str, ConfirmationRequest] = {}

    @staticmethod
    def _now() -> datetime:
        return datetime.now(timezone.utc)

    def requires_confirmation(
        self,
        action: str,
    ) -> bool:
        """Determine whether an action requires explicit confirmation."""

        normalized = action.lower().strip()

        return (
            normalized in self.HIGH_IMPACT_ACTIONS
            or any(
                keyword in normalized
                for keyword in self.HIGH_IMPACT_ACTIONS
            )
        )

    def create_request(
        self,
        user_id: str,
        action: str,
        description: str,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> ConfirmationRequest:
        """Create a new confirmation request."""

        if not user_id:
            raise ValueError("user_id is required.")

        if not action:
            raise ValueError("action is required.")

        now = self._now()
        expires = now + timedelta(
            minutes=self.expiration_minutes
        )

        request = ConfirmationRequest(
            id=secrets.token_urlsafe(24),
            user_id=user_id,
            action=action,
            description=description,
            created_at=now.isoformat(),
            expires_at=expires.isoformat(),
            metadata=metadata or {},
        )

        self._requests[request.id] = request

        return request

    def get_request(
        self,
        request_id: str,
    ) -> Optional[ConfirmationRequest]:
        """Retrieve a confirmation request."""

        request = self._requests.get(request_id)

        if request is None:
            return None

        self._expire_if_needed(request)

        return request

    def confirm(
        self,
        request_id: str,
        user_id: str,
    ) -> ConfirmationRequest:
        """Confirm a pending action."""

        request = self.get_request(request_id)

        if request is None:
            raise ValueError("Confirmation request not found.")

        if request.user_id != user_id:
            raise PermissionError(
                "Only the requesting user can confirm this action."
            )

        if request.cancelled:
            raise ValueError(
                "Confirmation request has been cancelled."
            )

        if request.confirmed:
            return request

        if self._is_expired(request):
            raise ValueError(
                "Confirmation request has expired."
            )

        request.confirmed = True

        return request

    def cancel(
        self,
        request_id: str,
        user_id: str,
    ) -> ConfirmationRequest:
        """Cancel a pending confirmation."""

        request = self.get_request(request_id)

        if request is None:
            raise ValueError("Confirmation request not found.")

        if request.user_id != user_id:
            raise PermissionError(
                "Only the requesting user can cancel this action."
            )

        request.cancelled = True

        return request

    def is_confirmed(
        self,
        request_id: str,
    ) -> bool:
        """Check whether a request has been confirmed."""

        request = self.get_request(request_id)

        if request is None:
            return False

        return (
            request.confirmed
            and not request.cancelled
            and not self._is_expired(request)
        )

    def _is_expired(
        self,
        request: ConfirmationRequest,
    ) -> bool:
        expires_at = datetime.fromisoformat(
            request.expires_at
        )

        return self._now() >= expires_at

    def _expire_if_needed(
        self,
        request: ConfirmationRequest,
    ) -> None:
        if self._is_expired(request) and not request.confirmed:
            request.cancelled = True

    def cleanup(self) -> int:
        """Remove expired confirmation requests."""

        expired = []

        for request_id, request in self._requests.items():
            if self._is_expired(request):
                expired.append(request_id)

        for request_id in expired:
            del self._requests[request_id]

        return len(expired)

    def health(self) -> Dict[str, Any]:
        return {
            "service": "human_confirmation",
            "status": "healthy",
            "pending_requests": sum(
                1
                for request in self._requests.values()
                if not request.confirmed
                and not request.cancelled
                and not self._is_expired(request)
            ),
        }