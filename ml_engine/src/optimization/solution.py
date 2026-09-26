"""Structured solution representations."""
from __future__ import annotations
from dataclasses import dataclass, field
from typing import Any

@dataclass
class OptimizationSolution:
    assignments: dict[str, Any]
    cost: float
    status: str = "OPTIMAL"
    metadata: dict[str, Any] = field(default_factory=dict)
