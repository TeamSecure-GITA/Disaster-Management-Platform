from __future__ import annotations

import json
from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


@dataclass
class CalibrationReport:
    """Audit report comparing model reliability and calibration before vs after tuning."""

    model_name: str
    method_used: str
    timestamp: str = field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat()
    )
    uncalibrated_ece: float = 0.0
    calibrated_ece: float = 0.0
    uncalibrated_brier: float = 0.0
    calibrated_brier: float = 0.0
    reliability_data: dict[str, Any] = field(default_factory=dict)
    summary: str = ""

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)

    def to_markdown(self) -> str:
        ece_improvement = (
            (self.uncalibrated_ece - self.calibrated_ece) / self.uncalibrated_ece * 100.0
            if self.uncalibrated_ece > 0
            else 0.0
        )
        brier_improvement = (
            (self.uncalibrated_brier - self.calibrated_brier) / self.uncalibrated_brier * 100.0
            if self.uncalibrated_brier > 0
            else 0.0
        )

        return f"""# Probability Calibration Audit: {self.model_name}

- **Method Applied**: `{self.method_used}`
- **Timestamp**: `{self.timestamp}`

## Calibration Quality Indicators

| Metric | Before Calibration | After Calibration | Improvement |
| :--- | :--- | :--- | :--- |
| **Expected Calibration Error (ECE)** | {self.uncalibrated_ece:.4f} | {self.calibrated_ece:.4f} | {ece_improvement:.1f}% |
| **Brier Score** | {self.uncalibrated_brier:.4f} | {self.calibrated_brier:.4f} | {brier_improvement:.1f}% |

### Summary
{self.summary or "Probability estimates have been calibrated to reflect true empirical frequency."}
"""

    def save(self, filepath: str | Path) -> None:
        p = Path(filepath)
        p.parent.mkdir(parents=True, exist_ok=True)
        if p.suffix == ".md":
            with open(p, "w") as f:
                f.write(self.to_markdown())
        else:
            with open(p, "w") as f:
                json.dump(self.to_dict(), f, indent=2)
