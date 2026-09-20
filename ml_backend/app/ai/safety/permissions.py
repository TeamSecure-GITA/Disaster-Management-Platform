"""
Role/permission management for Copilot tools and actions.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Dict, Iterable, Optional, Set


@dataclass
class PermissionResult:
    """Result of a permission check."""

    allowed: bool
    role: str
    permission: str
    reason: str

    def to_dict(self) -> Dict[str, Any]:
        return {
            "allowed": self.allowed,
            "role": self.role,
            "permission": self.permission,
            "reason": self.reason,
        }


class PermissionManager:
    """
    Central permission manager.

    The defaults are intentionally conservative.
    """

    DEFAULT_PERMISSIONS: Dict[str, Set[str]] = {
        "viewer": {
            "read_incidents",
            "read_weather",
            "read_risk",
            "read_shelters",
            "read_sensors",
            "read_analytics",
            "read_predictions",
            "read_maps",
        },
        "operator": {
            "read_incidents",
            "read_weather",
            "read_risk",
            "read_shelters",
            "read_sensors",
            "read_analytics",
            "read_predictions",
            "read_maps",
            "create_incident",
            "run_simulation",
        },
        "responder": {
            "read_incidents",
            "read_weather",
            "read_risk",
            "read_shelters",
            "read_sensors",
            "read_predictions",
            "read_maps",
            "update_incident",
            "responder_operations",
        },
        "analyst": {
            "read_incidents",
            "read_weather",
            "read_risk",
            "read_shelters",
            "read_sensors",
            "read_analytics",
            "read_predictions",
            "read_maps",
            "run_simulation",
            "model_metrics",
        },
        "admin": {
            "*",
        },
    }

    def __init__(
        self,
        permissions: Optional[Dict[str, Iterable[str]]] = None,
    ):
        self.permissions: Dict[str, Set[str]] = {
            role: set(values)
            for role, values in self.DEFAULT_PERMISSIONS.items()
        }

        if permissions:
            for role, values in permissions.items():
                self.permissions[role] = set(values)

    def check(
        self,
        role: str,
        permission: str,
    ) -> PermissionResult:
        """Check whether a role has a permission."""

        role = (role or "").lower().strip()
        permission = permission.strip()

        role_permissions = self.permissions.get(role)

        if role_permissions is None:
            return PermissionResult(
                allowed=False,
                role=role,
                permission=permission,
                reason="Unknown role.",
            )

        if "*" in role_permissions:
            return PermissionResult(
                allowed=True,
                role=role,
                permission=permission,
                reason="Administrator role has unrestricted permissions.",
            )

        allowed = permission in role_permissions

        return PermissionResult(
            allowed=allowed,
            role=role,
            permission=permission,
            reason=(
                "Permission granted."
                if allowed
                else "Permission denied for this role."
            ),
        )

    def require(
        self,
        role: str,
        permission: str,
    ) -> None:
        """Raise PermissionError when access is denied."""

        result = self.check(role, permission)

        if not result.allowed:
            raise PermissionError(result.reason)

    def add_permission(
        self,
        role: str,
        permission: str,
    ) -> None:
        """Add a permission to a role."""

        self.permissions.setdefault(role, set()).add(permission)

    def remove_permission(
        self,
        role: str,
        permission: str,
    ) -> None:
        """Remove a permission from a role."""

        self.permissions.setdefault(role, set()).discard(permission)

    def list_permissions(
        self,
        role: str,
    ) -> list[str]:
        """List permissions assigned to a role."""

        return sorted(
            self.permissions.get(role, set())
        )

    def health(self) -> Dict[str, Any]:
        return {
            "service": "permission_manager",
            "status": "healthy",
            "roles": sorted(self.permissions.keys()),
        }