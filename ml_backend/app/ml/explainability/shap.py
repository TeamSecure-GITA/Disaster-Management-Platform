"""
SHAP-compatible explanation wrapper.

SHAP is optional. The platform can operate without the shap package.

This wrapper never fabricates SHAP values when an explainer is unavailable.
"""

from __future__ import annotations

from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from typing import Any, Optional, Sequence


@dataclass
class SHAPExplanation:
    """Structured SHAP explanation."""

    status: str

    feature_names: list[str]

    values: dict[str, float]

    base_value: Optional[float]

    output_value: Optional[float]

    ranked_features: list[dict[str, Any]]

    timestamp: str

    warnings: list[str] = field(
        default_factory=list
    )

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


class SHAPExplainer:
    """
    Wrapper around a SHAP-compatible explainer.

    The supplied explainer is expected to behave similarly to:

        explainer(X)

    or expose:

        shap_values(X)
    """

    def __init__(
        self,
        explainer: Any = None,
        feature_names: Optional[
            Sequence[str]
        ] = None,
        name: str = "shap-explainer",
    ) -> None:
        self.explainer = explainer

        self.feature_names = list(
            feature_names or []
        )

        self.name = name

    @property
    def is_loaded(self) -> bool:
        return self.explainer is not None

    def explain(
        self,
        features: Sequence[float],
        feature_names: Optional[
            Sequence[str]
        ] = None,
    ) -> SHAPExplanation:
        """Generate SHAP explanation."""

        timestamp = datetime.now(
            timezone.utc
        ).isoformat()

        names = list(
            feature_names
            or self.feature_names
        )

        if not names:
            names = [
                f"feature_{index}"
                for index in range(
                    len(features)
                )
            ]

        if len(names) != len(features):
            return SHAPExplanation(
                status="invalid_features",
                feature_names=names,
                values={},
                base_value=None,
                output_value=None,
                ranked_features=[],
                timestamp=timestamp,
                warnings=[
                    (
                        "Feature-name count does not "
                        "match feature-value count."
                    )
                ],
            )

        if not self.is_loaded:
            return SHAPExplanation(
                status="explainer_not_loaded",
                feature_names=names,
                values={},
                base_value=None,
                output_value=None,
                ranked_features=[],
                timestamp=timestamp,
                warnings=[
                    (
                        "SHAP explainer is unavailable; "
                        "no explanation was fabricated."
                    )
                ],
            )

        try:
            explanation = None

            if callable(
                self.explainer
            ):
                explanation = self.explainer(
                    [list(features)]
                )

            elif hasattr(
                self.explainer,
                "shap_values",
            ):
                explanation = (
                    self.explainer.shap_values(
                        [list(features)]
                    )
                )

            else:
                raise TypeError(
                    "Unsupported SHAP explainer interface."
                )

            values = self._extract_values(
                explanation
            )

            values = [
                float(value)
                for value in values
            ]

            if len(values) != len(names):
                raise ValueError(
                    "SHAP output length does not match "
                    "feature count."
                )

            feature_values = dict(
                zip(
                    names,
                    values,
                )
            )

            ranked = sorted(
                (
                    {
                        "feature": name,
                        "shap_value": value,
                        "absolute_impact": abs(
                            value
                        ),
                        "direction": (
                            "increases_output"
                            if value > 0
                            else (
                                "decreases_output"
                                if value < 0
                                else "neutral"
                            )
                        ),
                    }
                    for name, value in feature_values.items()
                ),
                key=lambda item: item[
                    "absolute_impact"
                ],
                reverse=True,
            )

            base_value = self._extract_base_value(
                explanation
            )

            output_value = self._extract_output_value(
                explanation
            )

            return SHAPExplanation(
                status="success",
                feature_names=names,
                values=feature_values,
                base_value=base_value,
                output_value=output_value,
                ranked_features=ranked,
                timestamp=timestamp,
                warnings=[
                    (
                        "SHAP contribution indicates model-output "
                        "influence, not physical causation."
                    )
                ],
            )

        except Exception as exc:
            return SHAPExplanation(
                status="explanation_failed",
                feature_names=names,
                values={},
                base_value=None,
                output_value=None,
                ranked_features=[],
                timestamp=timestamp,
                warnings=[
                    f"SHAP explanation failed: {exc}"
                ],
            )

    @staticmethod
    def _extract_values(
        explanation: Any,
    ) -> list[float]:
        """
        Extract SHAP values from common output formats.
        """

        if hasattr(
            explanation,
            "values",
        ):
            raw = explanation.values

            # Typical shape:
            # (samples, features)
            if hasattr(
                raw,
                "ndim",
            ):
                if raw.ndim == 2:
                    return list(
                        raw[0]
                    )

                if raw.ndim == 1:
                    return list(raw)

            return list(raw)

        if isinstance(
            explanation,
            list,
        ):
            if not explanation:
                return []

            first = explanation[0]

            # Multiclass:
            # [class_1_values, class_2_values, ...]
            if isinstance(
                first,
                (list, tuple),
            ):
                return list(first)

            return [
                float(value)
                for value in explanation
            ]

        raise ValueError(
            "Unable to extract SHAP values."
        )

    @staticmethod
    def _extract_base_value(
        explanation: Any,
    ) -> Optional[float]:
        if hasattr(
            explanation,
            "base_values",
        ):
            try:
                value = explanation.base_values

                if hasattr(
                    value,
                    "flat",
                ):
                    return float(
                        list(value.flat)[0]
                    )

                if isinstance(
                    value,
                    (list, tuple),
                ):
                    return float(
                        value[0]
                    )

                return float(value)

            except Exception:
                return None

        return None

    @staticmethod
    def _extract_output_value(
        explanation: Any,
    ) -> Optional[float]:
        if hasattr(
            explanation,
            "values",
        ):
            try:
                if hasattr(
                    explanation,
                    "base_values",
                ):
                    base = explanation.base_values

                    if hasattr(
                        base,
                        "flat",
                    ):
                        base_value = float(
                            list(base.flat)[0]
                        )
                    else:
                        base_value = float(
                            base
                        )

                    values = explanation.values

                    if hasattr(
                        values,
                        "flat",
                    ):
                        total = sum(
                            float(value)
                            for value in values.flat
                        )
                    else:
                        total = sum(
                            float(value)
                            for value in values
                        )

                    return (
                        base_value + total
                    )

            except Exception:
                return None

        return None