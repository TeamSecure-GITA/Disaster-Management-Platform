from __future__ import annotations

class SituationReportGenerator:
    def generate_sitrep(self, incidents: list[dict]) -> str:
        total = len(incidents)
        return f"SITUATION REPORT: Active incidents: {total}. Key priority: search and rescue operations."
