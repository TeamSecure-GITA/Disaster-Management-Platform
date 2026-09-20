"""
Evacuation report generation.

This module reports supplied evacuation/simulation information. It does not
autonomously order an evacuation.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional


@dataclass
class EvacuationReport:
    """Structured evacuation report."""

    report_id: str
    scenario: str
    status: str
    affected_population: Optional[int]
    evacuation_zones: List[Dict[str, Any]] = field(
        default_factory=list
    )
    shelters: List[Dict[str, Any]] = field(
        default_factory=list
    )
    routes: List[Dict[str, Any]] = field(
        default_factory=list
    )
    resource_requirements: List[Dict[str, Any]] = field(
        default_factory=list
    )
    bottlenecks: List[str] = field(
        default_factory=list
    )
    assumptions: List[str] = field(
        default_factory=list
    )
    warnings: List[str] = field(
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
            "report_id": self.report_id,
            "scenario": self.scenario,
            "status": self.status,
            "affected_population": (
                self.affected_population
            ),
            "evacuation_zones": self.evacuation_zones,
            "shelters": self.shelters,
            "routes": self.routes,
            "resource_requirements": (
                self.resource_requirements
            ),
            "bottlenecks": self.bottlenecks,
            "assumptions": self.assumptions,
            "warnings": self.warnings,
            "sources": self.sources,
            "generated_at": self.generated_at,
        }


class EvacuationReportGenerator:
    """Generate evacuation analysis reports."""

    def generate(
        self,
        *,
        scenario: str,
        evacuation_data: Optional[
            Dict[str, Any]
        ] = None,
        sources: Optional[
            List[Dict[str, Any]]
        ] = None,
    ) -> EvacuationReport:

        data = evacuation_data or {}

        affected_population = data.get(
            "affected_population"
        )

        if affected_population is not None:
            try:
                affected_population = int(
                    affected_population
                )
            except (TypeError, ValueError):
                affected_population = None

        assumptions = self._string_list(
            data.get("assumptions")
        )

        warnings = self._string_list(
            data.get("warnings")
        )

        if affected_population is None:
            assumptions.append(
                "Affected population was not supplied."
            )

        if not data.get("routes"):
            warnings.append(
                "No evacuation route analysis was supplied."
            )

        if not data.get("shelters"):
            warnings.append(
                "No shelter allocation data was supplied."
            )

        return EvacuationReport(
            report_id=(
                "evacuation-"
                + datetime.now(
                    timezone.utc
                ).strftime("%Y%m%d%H%M%S")
            ),
            scenario=scenario,
            status=str(
                data.get(
                    "status",
                    "analysis_only",
                )
            ),
            affected_population=affected_population,
            evacuation_zones=data.get(
                "evacuation_zones",
                [],
            ),
            shelters=data.get(
                "shelters",
                [],
            ),
            routes=data.get(
                "routes",
                [],
            ),
            resource_requirements=data.get(
                "resource_requirements",
                [],
            ),
            bottlenecks=self._string_list(
                data.get("bottlenecks")
            ),
            assumptions=assumptions,
            warnings=warnings,
            sources=sources or [],
        )

    def to_markdown(
        self,
        report: EvacuationReport,
    ) -> str:

        lines = [
            "# Evacuation Analysis Report",
            "",
            f"**Report ID:** {report.report_id}",
            f"**Scenario:** {report.scenario}",
            f"**Status:** {report.status}",
            "",
            "> This report describes supplied analysis/simulation "
            "data. It is not itself an evacuation order.",
            "",
            "## Affected Population",
            (
                str(report.affected_population)
                if report.affected_population is not None
                else "Not available."
            ),
            "",
            "## Evacuation Zones",
        ]

        lines.extend(
            self._dict_bullets(
                report.evacuation_zones
            )
        )

        lines.extend(
            [
                "",
                "## Shelters",
            ]
        )

        lines.extend(
            self._dict_bullets(
                report.shelters
            )
        )

        lines.extend(
            [
                "",
                "## Routes",
            ]
        )

        lines.extend(
            self._dict_bullets(
                report.routes
            )
        )

        lines.extend(
            [
                "",
                "## Resource Requirements",
            ]
        )

        lines.extend(
            self._dict_bullets(
                report.resource_requirements
            )
        )

        lines.extend(
            [
                "",
                "## Bottlenecks",
            ]
        )

        lines.extend(
            self._string_bullets(
                report.bottlenecks
            )
        )

        lines.extend(
            [
                "",
                "## Assumptions",
            ]
        )

        lines.extend(
            self._string_bullets(
                report.assumptions
            )
        )

        if report.warnings:
            lines.extend(
                [
                    "",
                    "## Warnings",
                ]
            )

            lines.extend(
                self._string_bullets(
                    report.warnings
                )
            )

        return "\n".join(lines)

    @staticmethod
    def _string_list(
        value: Any,
    ) -> List[str]:

        if value is None:
            return []

        if isinstance(value, str):
            return [value]

        if isinstance(value, list):
            return [
                str(item)
                for item in value
            ]

        return [str(value)]

    @staticmethod
    def _string_bullets(
        items: List[str],
    ) -> List[str]:

        if not items:
            return ["- None supplied."]

        return [
            f"- {item}"
            for item in items
        ]

    @staticmethod
    def _dict_bullets(
        items: List[Dict[str, Any]],
    ) -> List[str]:

        if not items:
            return ["- None supplied."]

        output = []

        for item in items:
            if not isinstance(item, dict):
                output.append(
                    f"- {item}"
                )
                continue

            parts = [
                f"{key}={value}"
                for key, value in item.items()
                if value is not None
            ]

            output.append(
                "- " + ", ".join(parts)
            )

        return output