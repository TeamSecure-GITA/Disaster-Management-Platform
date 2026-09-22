"""
Multi-hazard cascade interaction rules and amplification matrices.

Defines the logic that determines when a primary hazard can trigger a
secondary hazard, and by how much the compound event amplifies risk.

Scientific basis
----------------
Cascade relationships are derived from empirical disaster-event datasets
(EMDAT, NDMA historical records) and peer-reviewed literature on compound
hazard interactions (e.g. Zscheischler et al., 2020).

  Primary     → Secondary     Trigger probability   Amplification
  ─────────────────────────────────────────────────────────────────
  FLOOD       → LANDSLIDE     moderate (0.55)        1.30×
  EARTHQUAKE  → TSUNAMI       high    (0.70)         2.20×
  EARTHQUAKE  → LANDSLIDE     moderate (0.50)        1.40×
  CYCLONE     → FLOOD         high    (0.80)         1.50×
  WILDFIRE    → LANDSLIDE     low     (0.30)         1.15×
  FLOOD       → INDUSTRIAL    low     (0.25)         1.20×
  TSUNAMI     → FLOOD         high    (0.85)         1.80×
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Dict, List, Optional, Tuple

from .scenario import PrimaryHazard


# ============================================================
# Cascade rule
# ============================================================

@dataclass
class CascadeRule:
    """
    A directional hazard cascade relationship.

    Attributes:
        primary: The triggering hazard type.
        secondary: The hazard type that can be triggered.
        trigger_probability_base: Base probability of cascade at intensity 1.0.
        intensity_threshold: Minimum primary intensity to apply this rule.
        amplification: Multiplicative risk amplifier applied to compound score.
        onset_delay_hours: Hours after primary onset before secondary starts.
        secondary_intensity_factor: Secondary intensity as fraction of primary.
        description: Human-readable explanation.
    """

    primary: PrimaryHazard
    secondary: PrimaryHazard
    trigger_probability_base: float     # 0.0 – 1.0 at intensity 1.0
    intensity_threshold: float = 0.30   # minimum primary intensity
    amplification: float = 1.20         # compound risk multiplier
    onset_delay_hours: float = 2.0
    secondary_intensity_factor: float = 0.70
    description: str = ""

    def trigger_probability(self, primary_intensity: float) -> float:
        """
        Effective trigger probability for a given primary intensity.

        Scales linearly from 0 at the threshold to base probability at 1.0.
        """

        if primary_intensity < self.intensity_threshold:
            return 0.0

        scale = (primary_intensity - self.intensity_threshold) / max(
            1.0 - self.intensity_threshold, 1e-6
        )

        return min(1.0, self.trigger_probability_base * scale)


# ============================================================
# Interaction matrix
# ============================================================

# Pre-defined cascade rules derived from empirical literature.
_CASCADE_RULES: List[CascadeRule] = [
    CascadeRule(
        primary=PrimaryHazard.FLOOD,
        secondary=PrimaryHazard.LANDSLIDE,
        trigger_probability_base=0.55,
        intensity_threshold=0.40,
        amplification=1.30,
        onset_delay_hours=3.0,
        secondary_intensity_factor=0.65,
        description=(
            "Saturated hillside soils after prolonged flooding "
            "significantly increase slope failure probability."
        ),
    ),
    CascadeRule(
        primary=PrimaryHazard.EARTHQUAKE,
        secondary=PrimaryHazard.TSUNAMI,
        trigger_probability_base=0.70,
        intensity_threshold=0.50,
        amplification=2.20,
        onset_delay_hours=0.5,
        secondary_intensity_factor=0.85,
        description=(
            "Submarine fault rupture can displace water column, "
            "generating tsunami wave trains within minutes."
        ),
    ),
    CascadeRule(
        primary=PrimaryHazard.EARTHQUAKE,
        secondary=PrimaryHazard.LANDSLIDE,
        trigger_probability_base=0.50,
        intensity_threshold=0.45,
        amplification=1.40,
        onset_delay_hours=0.25,
        secondary_intensity_factor=0.60,
        description=(
            "Ground shaking de-stabilises unsaturated slopes, "
            "triggering co-seismic mass movements."
        ),
    ),
    CascadeRule(
        primary=PrimaryHazard.CYCLONE,
        secondary=PrimaryHazard.FLOOD,
        trigger_probability_base=0.80,
        intensity_threshold=0.35,
        amplification=1.50,
        onset_delay_hours=1.0,
        secondary_intensity_factor=0.75,
        description=(
            "Storm surge and extreme rainfall accompanying cyclones "
            "reliably produce severe coastal and riverine flooding."
        ),
    ),
    CascadeRule(
        primary=PrimaryHazard.WILDFIRE,
        secondary=PrimaryHazard.LANDSLIDE,
        trigger_probability_base=0.30,
        intensity_threshold=0.50,
        amplification=1.15,
        onset_delay_hours=24.0,
        secondary_intensity_factor=0.45,
        description=(
            "Post-fire hydrophobic soil conditions increase runoff "
            "and debris-flow risk during subsequent rainfall events."
        ),
    ),
    CascadeRule(
        primary=PrimaryHazard.FLOOD,
        secondary=PrimaryHazard.INDUSTRIAL,
        trigger_probability_base=0.25,
        intensity_threshold=0.55,
        amplification=1.20,
        onset_delay_hours=6.0,
        secondary_intensity_factor=0.50,
        description=(
            "Floodwaters can breach industrial containment, "
            "releasing hazardous materials into affected communities."
        ),
    ),
    CascadeRule(
        primary=PrimaryHazard.TSUNAMI,
        secondary=PrimaryHazard.FLOOD,
        trigger_probability_base=0.85,
        intensity_threshold=0.40,
        amplification=1.80,
        onset_delay_hours=0.1,
        secondary_intensity_factor=0.90,
        description=(
            "Tsunami inundation is itself a form of coastal flooding "
            "that persists hours after initial wave impact."
        ),
    ),
]


class InteractionMatrix:
    """
    Registry of cascade rules and compound amplification look-ups.

    Usage::

        matrix = InteractionMatrix()
        rules = matrix.get_rules(PrimaryHazard.FLOOD)
        factor = matrix.compound_amplification(
            active_hazards=["flood", "landslide"]
        )
    """

    def __init__(
        self,
        extra_rules: Optional[List[CascadeRule]] = None,
    ):
        self._rules = list(_CASCADE_RULES)

        if extra_rules:
            self._rules.extend(extra_rules)

    def get_rules(
        self,
        primary: PrimaryHazard,
    ) -> List[CascadeRule]:
        """Return all cascade rules triggered by ``primary``."""

        return [r for r in self._rules if r.primary == primary]

    def compound_amplification(
        self,
        active_hazards: List[str],
    ) -> float:
        """
        Compute the overall risk amplification factor for a set of
        concurrently active hazards.

        Each matching cascade rule contributes its amplification
        multiplicatively, capped at 5.0× to avoid runaway values.

        Args:
            active_hazards: List of hazard type strings currently active.

        Returns:
            Compound amplification factor ≥ 1.0.
        """

        hazard_set = set(active_hazards)
        factor = 1.0

        for rule in self._rules:
            if (
                rule.primary.value in hazard_set
                and rule.secondary.value in hazard_set
            ):
                factor *= rule.amplification

        return min(5.0, factor)

    def all_rules(self) -> List[CascadeRule]:
        """Return all registered cascade rules."""
        return list(self._rules)

    def summary(self) -> Dict:
        """Return a serialisable summary of the interaction matrix."""

        return {
            "total_rules": len(self._rules),
            "rules": [
                {
                    "primary": r.primary.value,
                    "secondary": r.secondary.value,
                    "trigger_probability_base": r.trigger_probability_base,
                    "amplification": r.amplification,
                    "onset_delay_hours": r.onset_delay_hours,
                    "description": r.description,
                }
                for r in self._rules
            ],
        }


# ============================================================
# Module-level singleton
# ============================================================

DEFAULT_INTERACTION_MATRIX = InteractionMatrix()


# ============================================================
# Public exports
# ============================================================

__all__ = [
    "CascadeRule",
    "InteractionMatrix",
    "DEFAULT_INTERACTION_MATRIX",
]
