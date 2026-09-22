"""
Incident and hazard triage priority decision service.
Applies weighted multi-criteria scoring to prioritize emergency life-safety actions.
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional
from app.decision_engine.risk_engine import RiskEngine


class PriorityDecisionService:
    """Service layer calculating incident triage ranks and response prioritization."""

    def __init__(self):
        self.risk_engine = RiskEngine()

    def rank_incidents_by_priority(
        self,
        incidents: List[Dict[str, Any]],
        weights: Optional[Dict[str, float]] = None,
    ) -> List[Dict[str, Any]]:
        """
        Ranks incidents based on life threat, casualty potential,
        critical infrastructure exposure, and temporal urgency.
        """
        default_weights = {
            "casualties": 0.40,
            "severity": 0.25,
            "infrastructure": 0.20,
            "vulnerability": 0.15,
        }
        w = weights or default_weights

        ranked = []
        for inc in incidents:
            cas = min(1.0, float(inc.get("casualty_count", 0)) / 20.0)
            sev = min(1.0, float(inc.get("severity", 1)) / 5.0)
            infra = 1.0 if inc.get("critical_infrastructure_threatened") else 0.2
            vuln = float(inc.get("population_vulnerability", 0.5))

            score = (
                w.get("casualties", 0.40) * cas
                + w.get("severity", 0.25) * sev
                + w.get("infrastructure", 0.20) * infra
                + w.get("vulnerability", 0.15) * vuln
            )

            priority_level = (
                "P1_CRITICAL" if score >= 0.70
                else "P2_HIGH" if score >= 0.45
                else "P3_MEDIUM" if score >= 0.25
                else "P4_ROUTINE"
            )

            item = dict(inc)
            item["priority_score"] = round(score, 4)
            item["priority_level"] = priority_level
            ranked.append(item)

        ranked.sort(key=lambda x: x["priority_score"], reverse=True)
        for idx, item in enumerate(ranked):
            item["triage_rank"] = idx + 1

        return ranked


priority_decision_service = PriorityDecisionService()
