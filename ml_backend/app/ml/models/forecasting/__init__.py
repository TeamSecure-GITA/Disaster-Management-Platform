"""
Time-series forecasting package.

Supports provider-agnostic forecasting models for:
- Rainfall
- River levels
- Soil moisture
- Weather variables
- Generic environmental telemetry

Forecast outputs include uncertainty metadata and should not be treated
as deterministic guarantees.
"""

from .model import (
    ForecastModel,
    ForecastModelMetadata,
    ForecastPrediction,
)

from .features import (
    FORECAST_FEATURE_NAMES,
    ForecastFeatureEngineer,
    ForecastFeatureSet,
)

from .inference import (
    ForecastInferenceEngine,
    ForecastInferenceResult,
)

__all__ = [
    "ForecastModel",
    "ForecastModelMetadata",
    "ForecastPrediction",
    "FORECAST_FEATURE_NAMES",
    "ForecastFeatureEngineer",
    "ForecastFeatureSet",
    "ForecastInferenceEngine",
    "ForecastInferenceResult",
]