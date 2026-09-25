from __future__ import annotations

import json
from pathlib import Path
from typing import Any
import jsonschema
import pandas as pd
from src.preprocessing.validation import DataValidator, ValidationReport


def validate_dataset_file(
    file_path: str | Path,
    schema_path: str | Path | None = None,
) -> ValidationReport:
    p = Path(file_path)
    if not p.exists():
        return ValidationReport(False, 0, 0, 0, [f"File not found: {file_path}"])

    if p.suffix == ".csv":
        df = pd.read_csv(p)
    elif p.suffix == ".json":
        with open(p) as f:
            data = json.load(f)
        df = pd.DataFrame(data)
    elif p.suffix == ".parquet":
        df = pd.read_parquet(p)
    else:
        return ValidationReport(False, 0, 0, 0, [f"Unsupported file format: {p.suffix}"])

    validator = DataValidator()
    report = validator.validate(df)

    # Optional JSON Schema check if provided
    if schema_path and Path(schema_path).exists():
        with open(schema_path) as sf:
            schema = json.load(sf)
        records = df.head(10).to_dict(orient="records")
        for rec in records:
            try:
                jsonschema.validate(rec, schema)
            except jsonschema.ValidationError as e:
                report.warnings.append(f"Schema warning: {e.message}")

    return report


if __name__ == "__main__":
    rep = validate_dataset_file("datasets/raw/weather/sample_weather.csv", "datasets/validation/schemas/weather_schema.json")
    print(f"Validation result: valid={rep.is_valid}, total={rep.total_records}, passed={rep.passed_records}")
