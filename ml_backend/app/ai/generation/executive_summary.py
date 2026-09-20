"""
Executive summary generation.

Designed for senior operations dashboards and decision-support reports.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional


@dataclass
class ExecutiveSummary:
    """Structured executive summary."""

    summary_id: str
    title: str
    overview: str
    key_findings: List[str] = field(
        default_factory=list
    )
    risk_summary: List[Dict[str, Any]] = field(
        default_factory=list
    )
    operational_status: Optional[str] = None
    priority_actions: List[str] = field(
        default_factory=list
    )
    resource_status: List[Dict[str, Any]] = field(
        default_factory=list
    )
    uncertainties: List[str] = field(
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
            "summary_id": self.summary_id,
            "title": self.title,
            "overview": self.overview,
            "key_findings": self.key_findings,
            "risk_summary": self.risk_summary,
            "operational_status": self.operational_status,
            "priority_actions": self.priority_actions,
            "resource_status": self.resource_status,
            "uncertainties": self.uncertainties,
            "sources": self.sources,
            "generated_at": self.generated_at,
        }


class ExecutiveSummaryGenerator:
    """
    Creates concise summaries from structured system data.

    It intentionally does not rank political/public policy choices or make
    unsupported operational decisions.
    """

    def generate(
        self,
        *,
        title: str = "Disaster Management Executive Summary",
        overview: Optional[str] = None,
        key_findings: Optional[List[str]] = None,
        risk_summary: Optional[
            List[Dict[str, Any]]
        ] = None,
        operational_status: Optional[str] = None,
        priority_actions: Optional[List[str]] = None,
        resource_status: Optional[
            List[Dict[str, Any]]
        ] = None,
        uncertainties: Optional[List[str]] = None,
        sources: Optional[
            List[Dict[str, Any]]
        ] = None,
    ) -> ExecutiveSummary:

        findings = key_findings or []
        risks = risk_summary or []
        resources = resource_status or []
        uncertainties_list = uncertainties or []

        if not overview:
            overview = self._build_overview(
                findings=findings,
                risks=risks,
                operational_status=operational_status,
            )

        if not risks:
            uncertainties_list.append(
                "No structured risk summary was supplied."
            )

        if operational_status is None:
            uncertainties_list.append(
                "Current operational status is unavailable."
            )

        return ExecutiveSummary(
            summary_id=(
                "executive-"
                + datetime.now(
                    timezone.utc
                ).strftime("%Y%m%d%H%M%S")
            ),
            title=title,
            overview=overview,
            key_findings=findings,
            risk_summary=risks,
            operational_status=operational_status,
            priority_actions=priority_actions or [],
            resource_status=resources,
            uncertainties=uncertainties_list,
            sources=sources or [],
        )

    @staticmethod
    def _build_overview(
        *,
        findings: List[str],
        risks: List[Dict[str, Any]],
        operational_status: Optional[str],
    ) -> str:

        parts = []

        if findings:
            parts.append(
                f"{len(findings)} key finding(s) supplied."
            )

        if risks:
            parts.append(
                f"{len(risks)} risk assessment(s) supplied."
            )

        if operational_status:
            parts.append(
                f"Operational status: {operational_status}."
            )

        if not parts:
            return (
                "Insufficient structured information is available "
                "for an operational overview."
            )

        return " ".join(parts)

    def to_markdown(
        self,
        summary: ExecutiveSummary,
    ) -> str:

        lines = [
            f"# {summary.title}",
            "",
            f"**Summary ID:** {summary.summary_id}",
            f"**Generated:** {summary.generated_at}",
            "",
            "## Overview",
            summary.overview,
            "",
            "## Key Findings",
        ]

        if summary.key_findings:
            lines.extend(
                f"- {item}"
                for item in summary.key_findings
            )
        else:
            lines.append(
                "- None supplied."
            )

        lines.extend(
            [
                "",
                "## Risk Summary",
            ]
        )

        if summary.risk_summary:
            for risk in summary.risk_summary:
                lines.append(
                    f"- {self._format_dict(risk)}"
                )
        else:
            lines.append(
                "- No risk data supplied."
            )

        lines.extend(
            [
                "",
                "## Operational Status",
                summary.operational_status
                or "Not available.",
                "",
                "## Priority Actions",
            ]
        )

        if summary.priority_actions:
            lines.extend(
                f"- {item}"
                for item in summary.priority_actions
            )
        else:
            lines.append(
                "- None supplied."
            )

        lines.extend(
            [
                "",
                "## Resource Status",
            ]
        )

        if summary.resource_status:
            for resource in summary.resource_status:
                lines.append(
                    f"- {self._format_dict(resource)}"
                )
        else:
            lines.append(
                "- No resource data supplied."
            )

        if summary.uncertainties:
            lines.extend(
                [
                    "",
                    "## Uncertainties",
                ]
            )

            lines.extend(
                f"- {item}"
                for item in summary.uncertainties
            )

        return "\n".join(lines)

    @staticmethod
    def _format_dict(
        value: Dict[str, Any],
    ) -> str:

        return ", ".join(
            f"{key}={item}"
            for key, item in value.items()
            if item is not None
        )