from __future__ import annotations

from dataclasses import asdict, dataclass, field
from typing import Any


@dataclass
class FeatureContribution:
    feature: str
    value: Any
    contribution: float
    direction: str  # "increases_risk" or "decreases_risk"


@dataclass
class LocalPredictionExplanation:
    prediction: Any
    confidence: float
    base_value: float
    top_positive_factors: list[FeatureContribution] = field(default_factory=list)
    top_negative_factors: list[FeatureContribution] = field(default_factory=list)
    narrative_summary: str = ""

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


class PredictionExplainer:
    """Explains single disaster predictions with human-interpretable factors and plain English narratives."""

    @staticmethod
    def explain(
        prediction: Any,
        confidence: float,
        feature_values: dict[str, Any],
        contributions: dict[str, float],
        base_value: float = 0.5,
        top_k: int = 4,
    ) -> LocalPredictionExplanation:
        positives: list[FeatureContribution] = []
        negatives: list[FeatureContribution] = []

        for feat, contrib in contributions.items():
            val = feature_values.get(feat, "N/A")
            fc = FeatureContribution(
                feature=feat,
                value=val,
                contribution=float(contrib),
                direction="increases_risk" if contrib > 0 else "decreases_risk",
            )
            if contrib > 0:
                positives.append(fc)
            else:
                negatives.append(fc)

        positives.sort(key=lambda x: abs(x.contribution), reverse=True)
        negatives.sort(key=lambda x: abs(x.contribution), reverse=True)

        top_pos = positives[:top_k]
        top_neg = negatives[:top_k]

        # Generate explanatory narrative text
        narrative_parts = [f"Model predicted outcome '{prediction}' with confidence {confidence:.1%}."]
        if top_pos:
            drivers = ", ".join(f"{f.feature} ({f.value}, +{f.contribution:.2f})" for f in top_pos[:2])
            narrative_parts.append(f"Main risk drivers elevating the assessment are: {drivers}.")
        if top_neg:
            mitigators = ", ".join(f"{f.feature} ({f.value}, {f.contribution:.2f})" for f in top_neg[:2])
            narrative_parts.append(f"Mitigating factors lowering the risk include: {mitigators}.")

        return LocalPredictionExplanation(
            prediction=prediction,
            confidence=confidence,
            base_value=base_value,
            top_positive_factors=top_pos,
            top_negative_factors=top_neg,
            narrative_summary=" ".join(narrative_parts),
        )
