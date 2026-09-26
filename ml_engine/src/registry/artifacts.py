from __future__ import annotations
from pathlib import Path

class ArtifactStore:
    def __init__(self, root: str = "models/checkpoints") -> None:
        self.root = Path(root)
        self.root.mkdir(parents=True, exist_ok=True)
