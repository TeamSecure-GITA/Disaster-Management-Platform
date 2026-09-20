"""
Simulation and what-if analysis tools.

These tools are intended for decision support. Simulation results should
never be represented as observations of the real world.
"""

from __future__ import annotations

from typing import Any, Dict, Optional


class SimulationTools:
    """Digital-twin and disaster scenario simulation tools."""

    def __init__(self, simulation_service: Any = None):
        self.simulation_service = simulation_service

    async def simulate(
        self,
        scenario: str,
        parameters: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """Run a named disaster scenario."""

        if not scenario:
            return {
                "success": False,
                "status": "invalid_request",
                "message": "scenario is required.",
            }

        if self.simulation_service is None:
            return {
                "success": False,
                "status": "not_connected",
                "tool": "simulate",
                "message": "Simulation service is not connected.",
                "scenario": scenario,
                "parameters": parameters or {},
            }

        try:
            result = await self.simulation_service.simulate(
                scenario=scenario,
                parameters=parameters or {},
            )

            return {
                "success": True,
                "status": "ok",
                "tool": "simulate",
                "scenario": scenario,
                "result": result,
                "result_type": "simulation",
            }

        except Exception as exc:
            return {
                "success": False,
                "status": "error",
                "message": str(exc),
            }

    async def what_if(
        self,
        baseline: Dict[str, Any],
        changes: Dict[str, Any],
    ) -> Dict[str, Any]:
        """
        Perform a what-if scenario.

        The response explicitly labels the result as simulated.
        """

        if self.simulation_service is None:
            return {
                "success": False,
                "status": "not_connected",
                "tool": "what_if",
                "message": "Simulation service is not connected.",
                "baseline": baseline,
                "changes": changes,
                "result_type": "simulation",
            }

        try:
            result = await self.simulation_service.what_if(
                baseline=baseline,
                changes=changes,
            )

            return {
                "success": True,
                "status": "ok",
                "tool": "what_if",
                "result": result,
                "result_type": "simulation",
                "warning": (
                    "This is a simulated scenario, not a real-world observation."
                ),
            }

        except Exception as exc:
            return {
                "success": False,
                "status": "error",
                "message": str(exc),
            }

    async def evacuation_simulation(
        self,
        population: int,
        shelters: list[Dict[str, Any]],
        roads: Optional[list[Dict[str, Any]]] = None,
        hazards: Optional[list[Dict[str, Any]]] = None,
    ) -> Dict[str, Any]:
        """Simulate evacuation movement."""

        if self.simulation_service is None:
            return {
                "success": False,
                "status": "not_connected",
                "tool": "evacuation_simulation",
                "message": "Simulation service is not connected.",
                "population": population,
                "result_type": "simulation",
            }

        try:
            result = await self.simulation_service.evacuation(
                population=population,
                shelters=shelters,
                roads=roads or [],
                hazards=hazards or [],
            )

            return {
                "success": True,
                "status": "ok",
                "tool": "evacuation_simulation",
                "result": result,
                "result_type": "simulation",
            }

        except Exception as exc:
            return {
                "success": False,
                "status": "error",
                "message": str(exc),
            }

    async def digital_twin(
        self,
        region: str,
        scenario: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """Run a regional digital-twin scenario."""

        if self.simulation_service is None:
            return {
                "success": False,
                "status": "not_connected",
                "tool": "digital_twin",
                "message": "Digital twin service is not connected.",
                "region": region,
                "result_type": "simulation",
            }

        try:
            result = await self.simulation_service.digital_twin(
                region=region,
                scenario=scenario or {},
            )

            return {
                "success": True,
                "status": "ok",
                "tool": "digital_twin",
                "region": region,
                "result": result,
                "result_type": "simulation",
                "warning": (
                    "Digital-twin outputs are modeled scenarios and should "
                    "not be treated as direct observations."
                ),
            }

        except Exception as exc:
            return {
                "success": False,
                "status": "error",
                "message": str(exc),
            }

    def health(self) -> Dict[str, Any]:
        return {
            "service": "simulation_tools",
            "status": (
                "connected"
                if self.simulation_service
                else "not_connected"
            ),
        }