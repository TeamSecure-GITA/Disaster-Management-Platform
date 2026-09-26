from __future__ import annotations

class PipelineHealthCheck:
    def status(self) -> dict[str, str]:
        return {"status": "HEALTHY", "engine": "UP"}
