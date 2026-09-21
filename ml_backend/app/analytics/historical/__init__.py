"""
Historical disaster analytics subsystem.

Provides:
- Historical incident profiling, response time tracking, and impact metrics
- Hazard event recurrence intervals, return periods, and intensity distributions
- Multi-year comparative trends and Compound Annual Growth Rate (CAGR) evaluation
"""

from .hazards import (
    HazardEventRecord,
    HazardHistoricalSummary,
    HistoricalHazardAnalyzer,
)
from .incidents import (
    HistoricalIncidentAnalyzer,
    IncidentRecord,
    IncidentStatistics,
)
from .trends import (
    AnnualMetricSummary,
    HistoricalTrendAnalyzer,
    HistoricalTrendReport,
    YearOverYearChange,
)

__all__ = [
    "IncidentRecord",
    "IncidentStatistics",
    "HistoricalIncidentAnalyzer",
    "HazardEventRecord",
    "HazardHistoricalSummary",
    "HistoricalHazardAnalyzer",
    "AnnualMetricSummary",
    "YearOverYearChange",
    "HistoricalTrendReport",
    "HistoricalTrendAnalyzer",
]
