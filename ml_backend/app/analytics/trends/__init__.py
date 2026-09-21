"""
Time-series and trend analytics subsystem.

Provides:
- Linear and exponential trend estimation, moving averages, and short-term projections
- Seasonal decomposition and cyclical index calculation
- Outlier, sudden surge, and CUSUM drift detection
"""

from .anomaly_trends import (
    AnomalySummary,
    AnomalyTrendDetector,
    TrendAnomaly,
)
from .seasonality import (
    SeasonalIndex,
    SeasonalityDecomposer,
    SeasonalityProfile,
)
from .trend_analysis import (
    TrendAnalyzer,
    TrendPoint,
    TrendResult,
)

__all__ = [
    "TrendPoint",
    "TrendResult",
    "TrendAnalyzer",
    "SeasonalIndex",
    "SeasonalityProfile",
    "SeasonalityDecomposer",
    "TrendAnomaly",
    "AnomalySummary",
    "AnomalyTrendDetector",
]
