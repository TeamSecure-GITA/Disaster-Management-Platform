"""
System health monitoring.

Provides health/readiness information for:
- API
- Database
- AI
- ML
- Redis
- Sensors
- External services
- Workers
"""

from __future__ import annotations

import time
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Callable, Dict, Optional


@dataclass
class ComponentHealth:
    """Health status of a system component."""

    name: str
    status: str
    latency_ms: Optional[float] = None
    message: Optional[str] = None
    details: Dict = field(
        default_factory=dict
    )
    timestamp: str = field(
        default_factory=lambda:
            datetime.now(
                timezone.utc
            ).isoformat()
    )


class SystemHealthMonitor:
    """
    Central system-health registry.
    """

    VALID_STATUSES = {
        "healthy",
        "degraded",
        "unhealthy",
        "unknown",
    }

    def __init__(self):
        self.components: Dict[
            str,
            ComponentHealth
        ] = {}

        self.checks: Dict[
            str,
            Callable
        ] = {}

    # ---------------------------------------------------------
    # Register checks
    # ---------------------------------------------------------

    def register_check(
        self,
        name: str,
        check: Callable,
    ) -> None:
        """
        Register a health-check function.

        The callable can return:
            bool
            dict
        """

        self.checks[name] = check

    # ---------------------------------------------------------
    # Manual status
    # ---------------------------------------------------------

    def set_component(
        self,
        name: str,
        status: str,
        message: Optional[str] = None,
        latency_ms: Optional[float] = None,
        details: Optional[Dict] = None,
    ) -> ComponentHealth:

        if status not in self.VALID_STATUSES:
            raise ValueError(
                f"Invalid health status: {status}"
            )

        health = ComponentHealth(
            name=name,
            status=status,
            message=message,
            latency_ms=latency_ms,
            details=details or {},
        )

        self.components[name] = health

        return health

    # ---------------------------------------------------------
    # Run one check
    # ---------------------------------------------------------

    async def check_component(
        self,
        name: str,
    ) -> ComponentHealth:

        check = self.checks.get(name)

        if check is None:
            return self.set_component(
                name=name,
                status="unknown",
                message="No health check registered.",
            )

        start = time.perf_counter()

        try:

            result = check()

            if hasattr(
                result,
                "__await__",
            ):
                result = await result

            latency_ms = (
                time.perf_counter()
                - start
            ) * 1000

            if isinstance(
                result,
                bool,
            ):

                status = (
                    "healthy"
                    if result
                    else "unhealthy"
                )

                return self.set_component(
                    name=name,
                    status=status,
                    latency_ms=latency_ms,
                )

            if isinstance(
                result,
                dict,
            ):

                status = result.get(
                    "status",
                    "healthy",
                )

                return self.set_component(
                    name=name,
                    status=status,
                    latency_ms=latency_ms,
                    message=result.get(
                        "message"
                    ),
                    details=result.get(
                        "details",
                        {},
                    ),
                )

            return self.set_component(
                name=name,
                status="healthy",
                latency_ms=latency_ms,
            )

        except Exception as exc:

            latency_ms = (
                time.perf_counter()
                - start
            ) * 1000

            return self.set_component(
                name=name,
                status="unhealthy",
                latency_ms=latency_ms,
                message=str(exc),
            )

    # ---------------------------------------------------------
    # Check all
    # ---------------------------------------------------------

    async def check_all(self) -> Dict:

        results = {}

        for name in self.checks:

            result = await self.check_component(
                name
            )

            results[name] = result.__dict__

        return results

    # ---------------------------------------------------------
    # Overall status
    # ---------------------------------------------------------

    def overall_status(self) -> str:

        if not self.components:
            return "unknown"

        statuses = [
            component.status
            for component in
            self.components.values()
        ]

        if "unhealthy" in statuses:
            return "unhealthy"

        if "degraded" in statuses:
            return "degraded"

        if all(
            status == "healthy"
            for status in statuses
        ):
            return "healthy"

        return "unknown"

    # ---------------------------------------------------------
    # Summary
    # ---------------------------------------------------------

    def summary(self) -> Dict:

        healthy = sum(
            1
            for component
            in self.components.values()
            if component.status
            == "healthy"
        )

        degraded = sum(
            1
            for component
            in self.components.values()
            if component.status
            == "degraded"
        )

        unhealthy = sum(
            1
            for component
            in self.components.values()
            if component.status
            == "unhealthy"
        )

        unknown = sum(
            1
            for component
            in self.components.values()
            if component.status
            == "unknown"
        )

        return {
            "status": self.overall_status(),
            "components": {
                "total": len(
                    self.components
                ),
                "healthy": healthy,
                "degraded": degraded,
                "unhealthy": unhealthy,
                "unknown": unknown,
            },
            "timestamp": datetime.now(
                timezone.utc
            ).isoformat(),
        }

    # ---------------------------------------------------------
    # Full report
    # ---------------------------------------------------------

    def report(self) -> Dict:

        return {
            **self.summary(),
            "component_details": {
                name: component.__dict__
                for name, component
                in self.components.items()
            },
        }

    # ---------------------------------------------------------
    # Health
    # ---------------------------------------------------------

    def health(self) -> Dict:

        return {
            "status": "healthy",
            "registered_checks": len(
                self.checks
            ),
            "monitored_components": len(
                self.components
            ),
            "timestamp": datetime.now(
                timezone.utc
            ).isoformat(),
        }