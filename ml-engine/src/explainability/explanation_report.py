from __future__ import annotations

import json
from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


@dataclass
class ExplanationReport:
    """Consolidated interpretability report documenting model decision factors and feature dynamics."""

    model_name: str
    hazard_type: str
    timestamp: str = field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat()
    )
    feature_importance: list[dict[str, Any]] = field(default_factory=list)
    shap_summary: list[dict[str, Any]] = field(default_factory=list)
    permutation_importance: list[dict[str, Any]] = field(default_factory=list)
    sample_explanations: list[dict[str, Any]] = field(default_factory=list)

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)

    def to_markdown(self) -> str:
        lines = [
            f"# Model Explainability & Interpretability Report: {self.model_name}",
            f"- **Hazard Category**: {self.hazard_type}",
            f"- **Timestamp**: {self.timestamp}",
            "",
            "## Top Model Features (Intrinsic Importance)",
            "| Rank | Feature | Importance | Relative Contribution |",
            "| :--- | :--- | :--- | :--- |",
        ]

        for i, item in enumerate(self.feature_importance[:10], 1):
            lines.append(
                f"| {i} | `{item.get('feature')}` | {item.get('importance', 0.0):.4f} | {item.get('relative_importance_pct', 0.0)}% |"
            )

        if self.shap_summary:
            lines.extend([
                "",
                "## Mean Absolute SHAP Values (Global Attribution)",
                "| Feature | Mean |SHAP| |",
                "| :--- | :--- |",
            ])
            for item in self.shap_summary[:8]:
                lines.append(f"| `{item.get('feature')}` | {item.get('mean_abs_shap', 0.0):.4f} |")

        if self.sample_explanations:
            lines.extend([
                "",
                "## Sample Case Studies",
            ])
            for i, exp in enumerate(self.sample_explanations[:3], 1):
                lines.append(f"### Case {i}: Prediction '{exp.get('prediction')}'")
                lines.append(f"> {exp.get('narrative_summary')}")
                lines.append("")

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
