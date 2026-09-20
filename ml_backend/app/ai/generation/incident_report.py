"""
Incident report generation.

The generator converts structured incident data into a consistent report.
It does not fabricate missing facts.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional


@dataclass
class IncidentReport:
    """Generated incident report."""

    report_id: str
    incident_id: str
    title: str
    status: str
    severity: Optional[str]
    location: Optional[Dict[str, Any]]
    description: Optional[str]
    impacts: List[str] = field(default_factory=list)
    actions: List[str] = field(default_factory=list)
    resources: List[str] = field(default_factory=list)
    recommendations: List[str] = field(default_factory=list)
    uncertainties: List[str] = field(default_factory=list)
    sources: List[Dict[str, Any]] = field(default_factory=list)
    generated_at: str = ""

    def __post_init__(self) -> None:
        if not self.generated_at:
            self.generated_at = datetime.now(
                timezone.utc
            ).isoformat()

    def to_dict(self) -> Dict[str, Any]:
        return {
            "report_id": self.report_id,
            "incident_id": self.incident_id,
            "title": self.title,
            "status": self.status,
            "severity": self.severity,
            "location": self.location,
            "description": self.description,
            "impacts": self.impacts,
            "actions": self.actions,
            "resources": self.resources,
            "recommendations": self.recommendations,
            "uncertainties": self.uncertainties,
            "sources": self.sources,
            "generated_at": self.generated_at,
        }


class IncidentReportGenerator:
    """Generate incident reports from structured facts."""

    def generate(
        self,
        incident: Dict[str, Any],
        *,
        recommendations: Optional[List[str]] = None,
        sources: Optional[List[Dict[str, Any]]] = None,
    ) -> IncidentReport:
        """Generate a report without inventing unavailable information."""

        incident_id = str(
            incident.get("id")
            or incident.get("incident_id")
            or "unknown"
        )

        title = str(
            incident.get("title")
            or incident.get("name")
            or f"Incident {incident_id}"
        )

        status = str(
            incident.get("status")
            or "unknown"
        )

        severity = incident.get("severity")

        location = incident.get("location")

        description = (
            incident.get("description")
            or incident.get("summary")
        )

        impacts = self._string_list(
            incident.get("impacts")
            or incident.get("impact")
        )

        actions = self._string_list(
            incident.get("actions")
            or incident.get("response_actions")
        )

        resources = self._string_list(
            incident.get("resources")
        )

        uncertainties = self._string_list(
            incident.get("uncertainties")
        )

        if not description:
            uncertainties.append(
                "No incident description was provided."
            )

        if location is None:
            uncertainties.append(
                "Incident location is not available."
            )

        return IncidentReport(
            report_id=f"incident-report-{incident_id}",
            incident_id=incident_id,
            title=title,
            status=status,
            severity=severity,
            location=location,
            description=description,
            impacts=impacts,
            actions=actions,
            resources=resources,
            recommendations=recommendations or [],
            uncertainties=uncertainties,
            sources=sources or [],
        )

    @staticmethod
    def _string_list(value: Any) -> List[str]:
        if value is None:
            return []

        if isinstance(value, str):
            return [value]

        if isinstance(value, list):
            return [
                str(item)
                for item in value
                if item is not None
            ]

        return [str(value)]

    def to_markdown(
        self,
        report: IncidentReport,
    ) -> str:
        """Render the report as Markdown."""

        lines = [
            f"# {report.title}",
            "",
            f"**Report ID:** {report.report_id}",
            f"**Incident ID:** {report.incident_id}",
            f"**Status:** {report.status}",
        ]

        if report.severity:
            lines.append(
                f"**Severity:** {report.severity}"
            )

        lines.extend(
            [
                "",
                "## Description",
                report.description or "Not available.",
                "",
                "## Location",
                self._format_location(report.location),
                "",
                "## Impacts",
            ]
        )

        lines.extend(
            self._bullets(
                report.impacts
            )
        )

        lines.extend(
            [
                "",
                "## Response Actions",
            ]
        )

        lines.extend(
            self._bullets(
                report.actions
            )
        )

        lines.extend(
            [
                "",
                "## Resources",
            ]
        )

        lines.extend(
            self._bullets(
                report.resources
            )
        )

        lines.extend(
            [
                "",
                "## Recommendations",
            ]
        )

        lines.extend(
            self._bullets(
                report.recommendations
            )
        )

        if report.uncertainties:
            lines.extend(
                [
                    "",
                    "## Uncertainties / Missing Information",
                ]
            )

            lines.extend(
                self._bullets(
                    report.uncertainties
                )
            )

        return "\n".join(lines)

    @staticmethod
    def _bullets(items: List[str]) -> List[str]:
        if not items:
            return ["- None provided."]

        return [
            f"- {item}"
            for item in items
        ]

    @staticmethod
    def _format_location(
        location: Optional[Dict[str, Any]],
    ) -> str:
        if not location:
            return "Not available."

        if isinstance(location, dict):
            parts = []

            for key in (
                "address",
                "area",
                "district",
                "state",
                "country",
            ):
                if location.get(key):
                    parts.append(
                        str(location[key])
                    )

            if parts:
                return ", ".join(parts)

            if (
                location.get("latitude") is not None
                and location.get("longitude") is not None
            ):
                return (
                    f"{location['latitude']}, "
                    f"{location['longitude']}"
                )

        return str(location)