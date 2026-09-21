"""
Operational KPI calculation for disaster resource and emergency fleet management.

Tracks equipment readiness, responder deployment capacity, shelter utilization,
and logistics fulfillment ratios during emergency operations.
"""

from __future__ import annotations

from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional


@dataclass
class EquipmentReadinessKPI:
    total_equipment: int
    active_deployed: int
    available_standby: int
    maintenance_or_down: int
    readiness_rate_pct: float
    deployment_rate_pct: float


@dataclass
class PersonnelCapacityKPI:
    total_responders: int
    on_duty_deployed: int
    reserve_available: int
    utilization_rate_pct: float
    fatigue_risk_index: float  # 0.0 to 1.0


@dataclass
class ShelterOperationalKPI:
    total_shelters: int
    open_shelters: int
    total_capacity: int
    current_occupancy: int
    utilization_pct: float
    overcrowded_shelters_count: int
    critical_supply_shortage_count: int


@dataclass
class OperationalKPIReport:
    """Consolidated operational readiness and efficiency score."""

    generated_at: str
    overall_operational_health_score: float  # 0 to 100
    equipment: EquipmentReadinessKPI
    personnel: PersonnelCapacityKPI
    shelter: ShelterOperationalKPI
    logistics_fulfillment_pct: float
    communication_network_uptime_pct: float

    def to_dict(self) -> Dict[str, Any]:
        return {
            "generated_at": self.generated_at,
            "overall_operational_health_score": round(self.overall_operational_health_score, 2),
            "equipment": asdict(self.equipment),
            "personnel": asdict(self.personnel),
            "shelter": asdict(self.shelter),
            "logistics_fulfillment_pct": round(self.logistics_fulfillment_pct, 2),
            "communication_network_uptime_pct": round(self.communication_network_uptime_pct, 2),
        }


class OperationalKPICalculator:
    """
    Computes operational readiness indices and resource efficiency benchmarks.
    """

    @classmethod
    def calculate(
        cls,
        total_equipment: int = 100,
        deployed_equipment: int = 40,
        maintenance_equipment: int = 5,
        total_personnel: int = 500,
        deployed_personnel: int = 250,
        total_shelters: int = 20,
        open_shelters: int = 15,
        shelter_capacity: int = 10000,
        shelter_occupancy: int = 6500,
        overcrowded_shelters: int = 1,
        shortage_shelters: int = 2,
        relief_supplies_needed: float = 1000.0,
        relief_supplies_distributed: float = 850.0,
        comm_uptime_pct: float = 98.5,
    ) -> OperationalKPIReport:
        """
        Calculate unified operational KPI metrics.
        """
        # Equipment
        standby_eq = max(0, total_equipment - deployed_equipment - maintenance_equipment)
        readiness_eq = (
            ((total_equipment - maintenance_equipment) / total_equipment * 100.0)
            if total_equipment > 0
            else 0.0
        )
        deploy_rate_eq = (
            (deployed_equipment / total_equipment * 100.0)
            if total_equipment > 0
            else 0.0
        )
        eq_kpi = EquipmentReadinessKPI(
            total_equipment=total_equipment,
            active_deployed=deployed_equipment,
            available_standby=standby_eq,
            maintenance_or_down=maintenance_equipment,
            readiness_rate_pct=round(readiness_eq, 2),
            deployment_rate_pct=round(deploy_rate_eq, 2),
        )

        # Personnel
        reserve_pers = max(0, total_personnel - deployed_personnel)
        util_pers = (
            (deployed_personnel / total_personnel * 100.0)
            if total_personnel > 0
            else 0.0
        )
        # Fatigue risk increases as utilization approaches 100%
        fatigue_risk = min(1.0, max(0.0, (util_pers - 50.0) / 50.0)) if util_pers > 50.0 else 0.1
        pers_kpi = PersonnelCapacityKPI(
            total_responders=total_personnel,
            on_duty_deployed=deployed_personnel,
            reserve_available=reserve_pers,
            utilization_rate_pct=round(util_pers, 2),
            fatigue_risk_index=round(fatigue_risk, 2),
        )

        # Shelter
        shelter_util = (
            (shelter_occupancy / shelter_capacity * 100.0)
            if shelter_capacity > 0
            else 0.0
        )
        sh_kpi = ShelterOperationalKPI(
            total_shelters=total_shelters,
            open_shelters=open_shelters,
            total_capacity=shelter_capacity,
            current_occupancy=shelter_occupancy,
            utilization_pct=round(shelter_util, 2),
            overcrowded_shelters_count=overcrowded_shelters,
            critical_supply_shortage_count=shortage_shelters,
        )

        # Logistics
        logistics_pct = (
            (relief_supplies_distributed / relief_supplies_needed * 100.0)
            if relief_supplies_needed > 0
            else 100.0
        )
        logistics_pct = min(100.0, logistics_pct)

        # Composite score: weighted average of availability and fulfillment
        health_score = (
            0.25 * readiness_eq
            + 0.20 * (100.0 - (fatigue_risk * 50.0))
            + 0.20 * max(0.0, 100.0 - abs(shelter_util - 75.0))
            + 0.20 * logistics_pct
            + 0.15 * comm_uptime_pct
        )
        health_score = min(100.0, max(0.0, health_score))

        return OperationalKPIReport(
            generated_at=datetime.now(timezone.utc).isoformat(),
            overall_operational_health_score=health_score,
            equipment=eq_kpi,
            personnel=pers_kpi,
            shelter=sh_kpi,
            logistics_fulfillment_pct=logistics_pct,
            communication_network_uptime_pct=comm_uptime_pct,
        )
