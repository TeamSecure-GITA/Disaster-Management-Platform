"""
Feature-importance analysis.

Supports models exposing:
    feature_importances_
    coef_

Importance is descriptive model information and should not be treated
as proof that a feature physically causes the hazard.
"""

from __future__ import annotations

from dataclasses import asdict, dataclass, field
from typing import Any, Mapping, Optional, Sequence


@dataclass
class FeatureImportanceResult:
    """Structured feature-importance output."""

    status: str

    importances: dict[str, float]

    ranked_features: list[dict[str, Any]]

    method: Optional[str]

    warnings: list[str] = field(
        default_factory=list
    )

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


class FeatureImportanceAnalyzer:
    """Extract feature importance from an estimator."""

    def __init__(
        self,
        model: Any = None,
        feature_names: Optional[
            Sequence[str]
        ] = None,
    ) -> None:
        self.model = model

        self.feature_names = list(
            feature_names or []
        )

    def analyze(self) -> FeatureImportanceResult:
        """Extract and rank feature importance."""

        if self.model is None:
            return FeatureImportanceResult(
                status="model_not_loaded",
                importances={},
                ranked_features=[],
                method=None,
                warnings=[
                    "No model was supplied."
                ],
            )

        importances: Optional[
            list[float]
        ] = None

        method: Optional[str] = None

        if hasattr(
            self.model,
            "feature_importances_",
        ):
            try:
                importances = [
                    float(value)
                    for value in self.model.feature_importances_
                ]
                method = (
                    "feature_importances_"
                )
            except Exception:
                importances = None

        elif hasattr(
            self.model,
            "coef_",
        ):
            try:
                coefficients = (
                    self.model.coef_
                )

                # Binary/single-output models.
                if hasattr(
                    coefficients,
                    "ndim",
                ) and coefficients.ndim > 1:
                    values = coefficients[
                        0
                    ]
                else:
                    values = coefficients

                importances = [
                    abs(float(value))
                    for value in values
                ]

                method = "absolute_coefficients"

            except Exception:
                importances = None

        if importances is None:
            return FeatureImportanceResult(
                status="importance_unavailable",
                importances={},
                ranked_features=[],
                method=None,
                warnings=[
                    (
                        "Model does not expose a supported "
                        "feature-importance interface."
                    )
                ],
            )

        names = list(
            self.feature_names
        )

        if not names:
            names = [
                f"feature_{index}"
                for index in range(
                    len(importances)
                )
            ]

        if len(names) != len(
            importances
        ):
            return FeatureImportanceResult(
                status="dimension_mismatch",
                importances={},
                ranked_features=[],
                method=method,
                warnings=[
                    (
                        "Feature names do not match "
                        "importance vector length."
                    )
                ],
            )

        result = dict(
            zip(
                names,
                importances,
            )
        )

        total = sum(
            abs(value)
            for value in result.values()
        )

        ranked = []

        for name, value in sorted(
            result.items(),
            key=lambda item: abs(
                item[1]
            ),
            reverse=True,
        ):
            normalized = (
                abs(value) / total
                if total > 0
                else 0.0
            )

            ranked.append(
                {
                    "feature": name,
                    "importance": value,
                    "relative_importance": round(
                        normalized,
                        6,
                    ),
                }
            )

        return FeatureImportanceResult(
            status="success",
            importances=result,
            ranked_features=ranked,
            method=method,
            warnings=[
                (
                    "Feature importance describes model behavior "
                    "and does not establish physical causation."
                )
            ],
        )