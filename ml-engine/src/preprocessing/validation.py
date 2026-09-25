from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any
import pandas as pd


@dataclass
class ValidationReport:
    is_valid: bool
    total_records: int
    passed_records: int
    failed_records: int
    errors: list[str] = field(default_factory=list)
    warnings: list[str] = field(default_factory=list)

    def to_dict(self) -> dict[str, Any]:
        return {
            "is_valid": self.is_valid,
            "total_records": self.total_records,
            "passed_records": self.passed_records,
            "failed_records": self.failed_records,
            "errors": self.errors,
            "warnings": self.warnings,
        }


class DataValidator:
    """Validates tabular datasets against schemas and physical range bounds."""

    def __init__(
        self,
        required_columns: list[str] | None = None,
        ranges: dict[str, tuple[float | None, float | None]] | None = None,
    ) -> None:
        self.required_columns = required_columns or []
        self.ranges = ranges or {
            "latitude": (-90.0, 90.0),
            "longitude": (-180.0, 180.0),
            "rainfall_mm": (0.0, 2000.0),
            "wind_speed": (0.0, 500.0),
            "temperature": (-100.0, 70.0),
            "humidity": (0.0, 100.0),
            "soil_moisture": (0.0, 100.0),
            "ndvi": (-1.0, 1.0),
            "slope_angle": (0.0, 90.0),
        }

    def validate(self, df: pd.DataFrame) -> ValidationReport:
        errors = []
        warnings = []
        total = len(df)

        if total == 0:
            errors.append("Dataset is empty.")
            return ValidationReport(False, 0, 0, 0, errors, warnings)

        # Check required columns
        for col in self.required_columns:
            if col not in df.columns:
                errors.append(f"Missing required column: {col}")

        # Check ranges
        invalid_rows = set()
        for col, (min_val, max_val) in self.ranges.items():
            if col in df.columns and pd.api.types.is_numeric_dtype(df[col]):
                series = df[col].dropna()
                if min_val is not None:
                    out_min = series[series < min_val]
                    if not out_min.empty:
                        invalid_rows.update(out_min.index.tolist())
                        warnings.append(
                            f"Column '{col}' has {len(out_min)} values below minimum {min_val}"
                        )
                if max_val is not None:
                    out_max = series[series > max_val]
                    if not out_max.empty:
                        invalid_rows.update(out_max.index.tolist())
                        warnings.append(
                            f"Column '{col}' has {len(out_max)} values above maximum {max_val}"
                        )

        failed_count = len(invalid_rows)
        passed_count = total - failed_count
        is_valid = len(errors) == 0

        return ValidationReport(
            is_valid=is_valid,
            total_records=total,
            passed_records=passed_count,
            failed_records=failed_count,
            errors=errors,
            warnings=warnings,
        )
