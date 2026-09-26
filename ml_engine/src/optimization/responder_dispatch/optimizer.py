from __future__ import annotations

class ResponderDispatchOptimizer:
    def dispatch_nearest(self, incidents: list[dict], available_units: list[str]) -> dict[str, str]:
        assignment = {}
        for idx, inc in enumerate(incidents):
            if idx < len(available_units):
                assignment[inc.get("incident_id", str(idx))] = available_units[idx]
        return assignment
