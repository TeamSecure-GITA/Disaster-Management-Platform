from __future__ import annotations

class EnterpriseModelRegistry:
    def __init__(self) -> None:
        self.catalog = {}
    def register(self, name: str, version: str, stage: str = "staging") -> None:
        self.catalog[f"{name}:{version}"] = stage
