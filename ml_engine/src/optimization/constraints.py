"""Constraint specifications and validation."""
from __future__ import annotations
from dataclasses import dataclass
from typing import Callable, Any

@dataclass
class Constraint:
    name: str
    validator: Callable[[dict[str, Any]], bool]
    penalty: float = 1000.0

class ConstraintManager:
    def __init__(self) -> None:
        self.constraints: list[Constraint] = []

    def add_constraint(self, constraint: Constraint) -> None:
        self.constraints.append(constraint)

    def validate_all(self, solution: dict[str, Any]) -> tuple[bool, list[str]]:
        violations = []
        for c in self.constraints:
            if not c.validator(solution):
                violations.append(c.name)
        return len(violations) == 0, violations
