"""
Human-readable ML explanation generation.

Converts structured importance/SHAP information into concise
explanations suitable for dashboards and API responses.
"""

from __future__ import annotations

from dataclasses import asdict, dataclass, field
from typing import Any, Mapping, Optional, Sequence


@dataclass
class ModelExplanation:
    """Human-readable model explanation."""

    summary: str

    key_factors: list[str]

    positive_factors: list[str]

    negative_factors: list[str]

    limitations: list[str]

    evidence: list[dict[str, Any]] = field(
        default_factory=list
    )

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


class ExplanationGenerator:
    """
    Generate deterministic explanations from model outputs.

    No external LLM is required.
    """

    def __init__(
        self,
        max_factors: int = 5,
    ) -> None:
        if max_factors < 1:
            raise ValueError(
                "max_factors must be at least 1."
            )

        self.max_factors = max_factors

    def from_shap(
        self,
        shap_values: Mapping[
            str,
            float,
        ],
        prediction_label: Optional[
            str
        ] = None,
    ) -> ModelExplanation:
        """Create explanation from SHAP-style contributions."""

        ordered = sorted(
            shap_values.items(),
            key=lambda item: abs(
                item[1]
            ),
            reverse=True,
        )

        selected = ordered[
            : self.max_factors
        ]

        positive = [
            name
            for name, value in selected
            if value > 0
        ]

        negative = [
            name
            for name, value in selected
            if value < 0
        ]

        key_factors = [
            name
            for name, _ in selected
        ]

        evidence = [
            {
                "feature": name,
                "contribution": float(
                    value
                ),
                "direction": (
                    "positive"
                    if value > 0
                    else (
                        "negative"
                        if value < 0
                        else "neutral"
                    )
                ),
            }
            for name, value in selected
        ]

        if prediction_label:
            summary = (
                f"The model produced '{prediction_label}'. "
                f"The strongest model-output contributors were: "
                f"{', '.join(key_factors) or 'none available'}."
            )
        else:
            summary = (
                "The model explanation is based on the "
                "largest supplied feature contributions."
            )

        return ModelExplanation(
            summary=summary,
            key_factors=key_factors,
            positive_factors=positive,
            negative_factors=negative,
            limitations=[
                (
                    "Feature contribution is not proof of "
                    "physical causation."
                ),
                (
                    "The explanation reflects the supplied "
                    "model and input data."
                ),
            ],
            evidence=evidence,
        )

    def from_importance(
        self,
        importances: Mapping[
            str,
            float,
        ],
        prediction_label: Optional[
            str
        ] = None,
    ) -> ModelExplanation:
        """Create explanation from global feature importance."""

        ordered = sorted(
            importances.items(),
            key=lambda item: abs(
                item[1]
            ),
            reverse=True,
        )

        selected = ordered[
            : self.max_factors
        ]

        factors = [
            name
            for name, _ in selected
        ]

        evidence = [
            {
                "feature": name,
                "importance": float(
                    value
                ),
            }
            for name, value in selected
        ]

        label_text = (
            f" for '{prediction_label}'"
            if prediction_label
            else ""
        )

        return ModelExplanation(
            summary=(
                "The model relies most strongly on "
                f"{', '.join(factors) or 'no available features'}"
                f"{label_text}."
            ),
            key_factors=factors,
            positive_factors=[],
            negative_factors=[],
            limitations=[
                (
                    "Global feature importance describes "
                    "model behavior across data."
                ),
                (
                    "It does not indicate that a feature "
                    "caused an individual event."
                ),
            ],
            evidence=evidence,
        )

    def compare_predictions(
        self,
        before: Mapping[str, float],
        after: Mapping[str, float],
    ) -> ModelExplanation:
        """Explain changes between two prediction states."""

        features = set(
            before
        ) | set(after)

        changes = []

        for feature in features:
            old = float(
                before.get(
                    feature,
                    0.0,
                )
            )

            new = float(
                after.get(
                    feature,
                    0.0,
                )
            )

            changes.append(
                (
                    feature,
                    new - old,
                )
            )

        changes.sort(
            key=lambda item: abs(
                item[1]
            ),
            reverse=True,
        )

        selected = changes[
            : self.max_factors
        ]

        positive = [
            feature
            for feature, change in selected
            if change > 0
        ]

        negative = [
            feature
            for feature, change in selected
            if change < 0
        ]

        return ModelExplanation(
            summary=(
                "The largest changes in supplied model-related "
                "values were identified between the two states."
            ),
            key_factors=[
                feature
                for feature, _ in selected
            ],
            positive_factors=positive,
            negative_factors=negative,
            limitations=[
                (
                    "Changes in model inputs or outputs do not "
                    "by themselves establish why a real-world "
                    "hazard changed."
                )
            ],
            evidence=[
                {
                    "feature": feature,
                    "change": float(change),
                }
                for feature, change in selected
            ],
        )