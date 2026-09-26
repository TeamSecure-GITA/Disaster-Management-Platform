from __future__ import annotations

class SemanticVersionManager:
    def bump_minor(self, version: str) -> str:
        parts = version.split('.')
        parts[1] = str(int(parts[1]) + 1)
        return '.'.join(parts)
