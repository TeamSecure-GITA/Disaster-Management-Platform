"""
Model ensemble utilities.

Provides:
- Weighted voting
- Stacking
- Probability calibration
"""

from .stacking import (
    StackingEnsemble,
    StackingPrediction,
)

from .voting import (
    VotingEnsemble,
    VotingPrediction,
    ModelVote,
)

from .calibration import (
    ProbabilityCalibrator,
    CalibrationResult,
)

__all__ = [
    "StackingEnsemble",
    "StackingPrediction",
    "VotingEnsemble",
    "VotingPrediction",
    "ModelVote",
    "ProbabilityCalibrator",
    "CalibrationResult",
]