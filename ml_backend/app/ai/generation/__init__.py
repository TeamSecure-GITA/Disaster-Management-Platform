"""
AI-assisted disaster report generation.

All generators are provider-agnostic and deterministic by default.
They format supplied facts; they do not invent missing operational data.
"""

from .incident_report import (
    IncidentReport,
    IncidentReportGenerator,
)

from .situation_brief import (
    SituationBrief,
    SituationBriefGenerator,
)

from .evacuation_report import (
    EvacuationReport,
    EvacuationReportGenerator,
)

from .executive_summary import (
    ExecutiveSummary,
    ExecutiveSummaryGenerator,
)


__all__ = [
    "IncidentReport",
    "IncidentReportGenerator",
    "SituationBrief",
    "SituationBriefGenerator",
    "EvacuationReport",
    "EvacuationReportGenerator",
    "ExecutiveSummary",
    "ExecutiveSummaryGenerator",
]