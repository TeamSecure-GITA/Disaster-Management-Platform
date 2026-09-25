from __future__ import annotations

import json
from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


@dataclass
class EvaluationReport:
    """Comprehensive evaluation report for model governance and performance tracking."""

    model_name: str
    task_type: str
    timestamp: str = field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat()
    )
    metrics: dict[str, Any] = field(default_factory=dict)
    confusion_matrix: dict[str, Any] = field(default_factory=dict)
    hazard_verification: dict[str, Any] = field(default_factory=dict)
    error_analysis: dict[str, Any] = field(default_factory=dict)
    metadata: dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)

    def to_markdown(self) -> str:
        lines = [
            f"# Model Evaluation Report: {self.model_name}",
            f"- **Task Type**: {self.task_type}",
            f"- **Timestamp**: {self.timestamp}",
            "",
            "## Primary Performance Metrics",
            "| Metric | Value |",
            "| --- | --- |",
        ]
        for k, v in self.metrics.items():
            if not isinstance(v, (dict, list)):
                val_str = f"{v:.4f}" if isinstance(v, float) else str(v)
                lines.append(f"| {k} | {val_str} |")

        if self.hazard_verification:
            lines.extend([
                "",
                "## Hazard Early Warning Verification",
                "| Indicator | Value |",
                "| --- | --- |",
            ])
            for k, v in self.hazard_verification.items():
                if isinstance(v, float):
                    lines.append(f"| {k} | {v:.4f} |")

        return "\n".join(lines)

    def save(self, filepath: str | Path) -> None:
        p = Path(filepath)
        p.parent.mkdir(parents=True, exist_ok=True)
        if p.suffix == ".md":
            with open(p, "w") as f:
                f.write(self.to_markdown())
        else:
            with open(p, "w") as f:
                json.dump(self.to_dict(), f, indent=2)
