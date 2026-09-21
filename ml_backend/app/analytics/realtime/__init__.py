"""
Real-time streaming analytics subsystem.

Provides:
- In-memory high-velocity metric streaming and threshold alerting
- Windowed time-bucket aggregations and multidimensional breakdowns
- Situational awareness dashboard snapshot engine
"""

from .aggregations import (
    AggregatedMetric,
    AggregationWindow,
    DimensionalAggregate,
    RealtimeAggregator,
)
from .dashboard import (
    DashboardOverview,
    RegionalSituationalState,
    RealtimeDashboardService,
)
from .metrics import (
    MetricSummary,
    MetricType,
    RealtimeMetricPoint,
    RealtimeMetricTracker,
    ThresholdAlert,
)

__all__ = [
    "MetricType",
    "RealtimeMetricPoint",
    "MetricSummary",
    "ThresholdAlert",
    "RealtimeMetricTracker",
    "AggregationWindow",
    "AggregatedMetric",
    "DimensionalAggregate",
    "RealtimeAggregator",
    "RegionalSituationalState",
    "DashboardOverview",
    "RealtimeDashboardService",
]
