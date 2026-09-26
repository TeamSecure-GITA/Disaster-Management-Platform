"""Objective function definitions."""
from __future__ import annotations
from typing import Callable, Any

class ObjectiveFunction:
    def __init__(self, name: str, fn: Callable[[dict[str, Any]], float], sense: str = "minimize") -> None:
        self.name = name
        self.fn = fn
        self.sense = sense

    def evaluate(self, assignment: dict[str, Any]) -> float:
        return self.fn(assignment)
