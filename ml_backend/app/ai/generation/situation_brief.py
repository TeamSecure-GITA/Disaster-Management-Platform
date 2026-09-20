"""
Situation brief generation for command/operations dashboards.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional


@dataclass
class SituationBrief:
    """Operational situation brief."""

    brief_id: str
    headline: str
    situation: str
    hazard_summary: List[Dict[str, Any]] = field(
        default_factory=list
    )
    active_incidents: List[Dict[str, Any]] = field(
        default_factory=list
    )
    affected_areas: List[str] = field(
        default_factory=list
    )
    response_status: Optional[str] = None
    critical_actions: List[str] = field(
        default_factory=list
    )
    information_gaps: List[str] = field(
        default_factory=list
    )
    sources: List[Dict[str, Any]] = field(
        default_factory=list
    )
    generated_at: str = ""

    def __post_init__(self) -> None:
        if not self.generated_at:
            self.generated_at = datetime.now(
                timezone.utc
            ).isoformat()

    def to_dict(self) -> Dict[str, Any]:
        return {
            "brief_id": self.brief_id,
            "headline": self.headline,
            "situation": self.situation,
            "hazard_summary": self.hazard_summary,
            "active_incidents": self.active_incidents,
            "affected_areas": self.affected_areas,
            "response_status": self.response_status,
            "critical_actions": self.critical_actions,
            "information_gaps": self.information_gaps,
            "sources": self.sources,
            "generated_at": self.generated_at,
        }


class SituationBriefGenerator:
    """Generate a concise operational situation brief."""

    def generate(
        self,
        *,
        hazards: Optional[List[Dict[str, Any]]] = None,
        incidents: Optional[List[Dict[str, Any]]] = None,
        affected_areas: Optional[List[str]] = None,
        response_status: Optional[str] = None,
        critical_actions: Optional[List[str]] = None,
        sources: Optional[List[Dict[str, Any]]] = None,
        headline: Optional[str] = None,
    ) -> SituationBrief:

        hazards = hazards or []
        incidents = incidents or []
        affected_areas = affected_areas or []
        critical_actions = critical_actions or []
        sources = sources or []

        information_gaps = []

        if not hazards:
            information_gaps.append(
                "No hazard assessment data supplied."
            )

        if not incidents:
            information_gaps.append(
                "No active incident data supplied."
            )

        if response_status is None:
            information_gaps.append(
                "Current response status is unavailable."
            )

        if headline:
            final_headline = headline
        elif hazards:
            final_headline = (
                "Current Multi-Hazard Situation"
            )
        elif incidents:
            final_headline = (
                "Current Incident Situation"
            )
        else:
            final_headline = (
                "Current Disaster Situation"
            )

        situation = self._build_situation(
            hazards=hazards,
            incidents=incidents,
            affected_areas=affected_areas,
            response_status=response_status,
        )

        return SituationBrief(
            brief_id=(
                "situation-"
                + datetime.now(
                    timezone.utc
                ).strftime("%Y%m%d%H%M%S")
            ),
            headline=final_headline,
            situation=situation,
            hazard_summary=hazards,
            active_incidents=incidents,
            affected_areas=affected_areas,
            response_status=response_status,
            critical_actions=critical_actions,
            information_gaps=information_gaps,
            sources=sources,
        )

    @staticmethod
    def _build_situation(
        *,
        hazards: List[Dict[str, Any]],
        incidents: List[Dict[str, Any]],
        affected_areas: List[str],
        response_status: Optional[str],
    ) -> str:

        parts = []

        if hazards:
            parts.append(
                f"{len(hazards)} hazard assessment(s) supplied."
            )

        if incidents:
            parts.append(
                f"{len(incidents)} active incident(s) supplied."
            )

        if affected_areas:
            parts.append(
                f"{len(affected_areas)} affected area(s) identified."
            )

        if response_status:
            parts.append(
                f"Response status: {response_status}."
            )

        if not parts:
            return (
                "Insufficient structured information is available "
                "to characterize the current situation."
            )

        return " ".join(parts)

    def to_markdown(
        self,
        brief: SituationBrief,
    ) -> str:

        lines = [
            f"# {brief.headline}",
            "",
            f"**Brief ID:** {brief.brief_id}",
            f"**Generated:** {brief.generated_at}",
            "",
            "## Situation",
            brief.situation,
            "",
            "## Hazard Summary",
        ]

        if brief.hazard_summary:
            for hazard in brief.hazard_summary:
                lines.append(
                    f"- {self._format_item(hazard)}"
                )
        else:
            lines.append(
                "- No hazard data supplied."
            )

        lines.extend(
            [
                "",
                "## Active Incidents",
            ]
        )

        if brief.active_incidents:
            for incident in brief.active_incidents:
                lines.append(
                    f"- {self._format_item(incident)}"
                )
        else:
            lines.append(
                "- No incident data supplied."
            )

        lines.extend(
            [
                "",
                "## Affected Areas",
            ]
        )

        if brief.affected_areas:
            lines.extend(
                f"- {area}"
                for area in brief.affected_areas
            )
        else:
            lines.append(
                "- Not available."
            )

        lines.extend(
            [
                "",
                "## Critical Actions",
            ]
        )

        if brief.critical_actions:
            lines.extend(
                f"- {action}"
                for action in brief.critical_actions
            )
        else:
            lines.append(
                "- No actions supplied."
            )

        if brief.information_gaps:
            lines.extend(
                [
                    "",
                    "## Information Gaps",
                ]
            )

            lines.extend(
                f"- {gap}"
                for gap in brief.information_gaps
            )

        return "\n".join(lines)

    @staticmethod
    def _format_item(
        item: Dict[str, Any],
    ) -> str:
        preferred = (
            item.get("name")
            or item.get("title")
            or item.get("type")
            or item.get("id")
        )

        if preferred is None:
            return str(item)

        details = []

        for key in (
            "severity",
            "risk",
            "status",
            "confidence",
        ):
            if item.get(key) is not None:
                details.append(
                    f"{key}={item[key]}"
                )

        if details:
            return (
                f"{preferred} "
                f"({', '.join(details)})"
            )

        return str(preferred)