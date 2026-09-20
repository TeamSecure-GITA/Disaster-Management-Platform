"""
Probability calibration utilities.

Calibration converts raw model scores into better-calibrated probability
estimates when a calibration mapping has been trained and validated.

Supported calibrator interfaces:

    transform(values)
    predict(values)

The module does not claim calibration quality without validation data.
"""

from __future__ import annotations

from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from typing import Any, Optional, Sequence


@dataclass
class CalibrationResult:
    """Result of probability calibration."""

    status: str

    raw_probability: Optional[float]

    calibrated_probability: Optional[float]

    calibrator_name: Optional[str]

    calibrated: bool

    timestamp: str

    warnings: list[str] = field(
        default_factory=list
    )

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


class ProbabilityCalibrator:
    """
    Wrapper around a previously trained calibration model.

    A calibrator may be:
    - Isotonic regression
    - Platt/logistic calibration
    - Beta calibration
    - Custom probability mapping
    """

    def __init__(
        self,
        calibrator: Any = None,
        name: str = "probability-calibrator",
        version: str = "v1",
        validated: bool = False,
    ) -> None:
        self.calibrator = calibrator
        self.name = name
        self.version = version
        self.validated = validated

    @property
    def is_loaded(self) -> bool:
        return self.calibrator is not None

    @staticmethod
    def _validate_probability(
        value: float,
    ) -> float:
        probability = float(value)

        if not 0.0 <= probability <= 1.0:
            raise ValueError(
                f"Probability must be between 0 and 1: "
                f"{probability}"
            )

        return probability

    def calibrate(
        self,
        probability: float,
    ) -> CalibrationResult:
        """Calibrate one probability."""

        timestamp = datetime.now(
            timezone.utc
        ).isoformat()

        try:
            raw = self._validate_probability(
                probability
            )
        except ValueError as exc:
            return CalibrationResult(
                status="invalid_probability",
                raw_probability=None,
                calibrated_probability=None,
                calibrator_name=self.name,
                calibrated=False,
                timestamp=timestamp,
                warnings=[str(exc)],
            )

        if not self.is_loaded:
            return CalibrationResult(
                status="calibrator_not_loaded",
                raw_probability=raw,
                calibrated_probability=None,
                calibrator_name=self.name,
                calibrated=False,
                timestamp=timestamp,
                warnings=[
                    (
                        "No calibration model is loaded; "
                        "raw probability was not modified."
                    )
                ],
            )

        try:
            if hasattr(
                self.calibrator,
                "transform",
            ):
                output = (
                    self.calibrator.transform(
                        [raw]
                    )
                )

            elif hasattr(
                self.calibrator,
                "predict",
            ):
                output = (
                    self.calibrator.predict(
                        [raw]
                    )
                )

            else:
                raise TypeError(
                    "Calibrator must expose transform() or predict()."
                )

            calibrated = float(
                output[0]
            )

        except Exception as exc:
            return CalibrationResult(
                status="calibration_failed",
                raw_probability=raw,
                calibrated_probability=None,
                calibrator_name=self.name,
                calibrated=False,
                timestamp=timestamp,
                warnings=[
                    f"Calibration failed: {exc}"
                ],
            )

        if not 0.0 <= calibrated <= 1.0:
            return CalibrationResult(
                status="invalid_calibrated_output",
                raw_probability=raw,
                calibrated_probability=calibrated,
                calibrator_name=self.name,
                calibrated=False,
                timestamp=timestamp,
                warnings=[
                    (
                        "Calibrator returned a value outside "
                        "the probability range [0, 1]."
                    )
                ],
            )

        warnings: list[str] = []

        if not self.validated:
            warnings.append(
                (
                    "Calibration mapping has not been marked "
                    "as independently validated."
                )
            )

        return CalibrationResult(
            status="success",
            raw_probability=raw,
            calibrated_probability=round(
                calibrated,
                6,
            ),
            calibrator_name=self.name,
            calibrated=self.validated,
            timestamp=timestamp,
            warnings=warnings,
        )

    def calibrate_many(
        self,
        probabilities: Sequence[float],
    ) -> list[CalibrationResult]:
        """Calibrate multiple probabilities."""

        return [
            self.calibrate(
                probability
            )
            for probability in probabilities
        ]

    def health(self) -> dict[str, Any]:
        """Return calibrator health."""

        return {
            "loaded": self.is_loaded,
            "name": self.name,
            "version": self.version,
            "validated": self.validated,
        }