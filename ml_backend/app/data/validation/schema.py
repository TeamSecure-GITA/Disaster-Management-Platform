"""
Data schema validation.

Enforces structural integrity of incoming records from all ingestion sources
before they enter the feature store or ML pipeline.

Uses lightweight dataclass-based rules — no external schema library required.
Produces structured ``ValidationResult`` objects with field-level error reporting.
"""

from __future__ import annotations

import math
from dataclasses import dataclass, field
from datetime import datetime
from typing import Any, Callable, Dict, List, Optional, Tuple


@dataclass
class FieldError:
    """A single field-level schema violation."""

    field_name: str
    error_type: str      # "missing", "type", "range", "format", "length"
    message: str
    actual_value: Any = None


@dataclass
class ValidationResult:
    """Outcome of a schema validation pass over a single record."""

    record_id: str
    schema_name: str
    is_valid: bool
    errors: List[FieldError] = field(default_factory=list)
    warnings: List[str] = field(default_factory=list)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "record_id": self.record_id,
            "schema_name": self.schema_name,
            "is_valid": self.is_valid,
            "error_count": len(self.errors),
            "errors": [
                {
                    "field": e.field_name,
                    "type": e.error_type,
                    "message": e.message,
                }
                for e in self.errors
            ],
            "warnings": self.warnings,
        }


# ---------------------------------------------------------------------------
# Schema rule engine
# ---------------------------------------------------------------------------

FieldRule = Callable[[Any], Optional[str]]   # Returns error message or None


def _required(value: Any) -> Optional[str]:
    if value is None or (isinstance(value, str) and not value.strip()):
        return "Field is required and must not be empty."
    return None


def _is_float(value: Any) -> Optional[str]:
    if value is None:
        return None
    try:
        float(value)
        return None
    except (TypeError, ValueError):
        return f"Expected a numeric value, got {type(value).__name__!r}."


def _is_int(value: Any) -> Optional[str]:
    if value is None:
        return None
    try:
        int(float(str(value)))
        return None
    except (TypeError, ValueError):
        return f"Expected an integer value, got {type(value).__name__!r}."


def _range(min_val: float, max_val: float) -> FieldRule:
    def _check(value: Any) -> Optional[str]:
        if value is None:
            return None
        try:
            v = float(value)
            if not (min_val <= v <= max_val):
                return f"Value {v} out of allowed range [{min_val}, {max_val}]."
        except (TypeError, ValueError):
            pass
        return None
    return _check


def _iso_datetime(value: Any) -> Optional[str]:
    if value is None:
        return None
    try:
        datetime.fromisoformat(str(value).replace("Z", "+00:00"))
        return None
    except ValueError:
        return f"Expected ISO-8601 datetime string, got {value!r}."


def _min_length(n: int) -> FieldRule:
    def _check(value: Any) -> Optional[str]:
        if value is None:
            return None
        if len(str(value)) < n:
            return f"Value must be at least {n} characters long."
        return None
    return _check


def _not_nan_inf(value: Any) -> Optional[str]:
    if value is None:
        return None
    try:
        v = float(value)
        if math.isnan(v) or math.isinf(v):
            return f"Value must not be NaN or Inf."
    except (TypeError, ValueError):
        pass
    return None


# ---------------------------------------------------------------------------
# Built-in schemas (field_name -> list of rules)
# ---------------------------------------------------------------------------

_SCHEMAS: Dict[str, Dict[str, List[FieldRule]]] = {
    "weather_observation": {
        "station_id":     [_required],
        "latitude":       [_required, _is_float, _range(-90, 90), _not_nan_inf],
        "longitude":      [_required, _is_float, _range(-180, 180), _not_nan_inf],
        "observed_at":    [_required, _iso_datetime],
        "temperature_c":  [_is_float, _range(-60, 60), _not_nan_inf],
        "humidity_pct":   [_is_float, _range(0, 100)],
        "pressure_hpa":   [_is_float, _range(850, 1090)],
        "wind_speed_ms":  [_is_float, _range(0, 120)],
        "rainfall_mm_1h": [_is_float, _range(0, 600)],
    },
    "sensor_reading": {
        "sensor_id":   [_required],
        "sensor_type": [_required],
        "latitude":    [_required, _is_float, _range(-90, 90)],
        "longitude":   [_required, _is_float, _range(-180, 180)],
        "value":       [_required, _is_float, _not_nan_inf],
        "unit":        [_required],
        "observed_at": [_required, _iso_datetime],
    },
    "citizen_report": {
        "report_id":    [_required],
        "latitude":     [_required, _is_float, _range(-90, 90)],
        "longitude":    [_required, _is_float, _range(-180, 180)],
        "description":  [_required, _min_length(10)],
        "channel":      [_required],
        "reported_at":  [_required, _iso_datetime],
    },
    "historical_event": {
        "event_id":           [_required],
        "disaster_category":  [_required],
        "total_deaths":       [_is_int, _range(0, 10_000_000)],
        "total_affected":     [_is_int, _range(0, 500_000_000)],
        "total_damage_usd":   [_is_float, _range(0, 1e12)],
    },
    "satellite_scene": {
        "scene_id":           [_required],
        "acquisition_date":   [_required, _iso_datetime],
        "cloud_cover_pct":    [_is_float, _range(0, 100)],
        "spatial_resolution_m": [_is_float, _range(0.1, 1000)],
    },
}


class SchemaValidator:
    """
    Validate records against named schemas using rule chains.

    Register custom schemas or extend built-in ones for domain-specific
    ingestion sources.

    Example::

        validator = SchemaValidator()
        result = validator.validate(record_dict, schema_name="weather_observation")
        if not result.is_valid:
            for err in result.errors:
                print(err.field_name, err.message)
    """

    def __init__(self) -> None:
        self._schemas: Dict[str, Dict[str, List[FieldRule]]] = dict(_SCHEMAS)

    def register_schema(
        self,
        schema_name: str,
        rules: Dict[str, List[FieldRule]],
        overwrite: bool = False,
    ) -> None:
        """Register a custom or extended schema."""
        if schema_name in self._schemas and not overwrite:
            raise ValueError(
                f"Schema {schema_name!r} already exists. Pass overwrite=True to replace."
            )
        self._schemas[schema_name] = rules

    def validate(
        self,
        record: Dict[str, Any],
        schema_name: str,
        record_id: Optional[str] = None,
    ) -> ValidationResult:
        """
        Validate a record dict against a named schema.

        Returns a ``ValidationResult`` with field-level error details.
        Unknown schemas produce a single schema-not-found error.
        """
        rid = record_id or str(record.get("id", record.get("sensor_id", record.get("report_id", "unknown"))))
        schema = self._schemas.get(schema_name)

        if schema is None:
            return ValidationResult(
                record_id=rid,
                schema_name=schema_name,
                is_valid=False,
                errors=[
                    FieldError(
                        field_name="_schema",
                        error_type="unknown_schema",
                        message=f"No schema named {schema_name!r} is registered.",
                    )
                ],
            )

        errors: List[FieldError] = []
        warnings: List[str] = []

        for field_name, rules in schema.items():
            value = record.get(field_name)
            for rule in rules:
                msg = rule(value)
                if msg:
                    errors.append(
                        FieldError(
                            field_name=field_name,
                            error_type=_infer_error_type(rule),
                            message=msg,
                            actual_value=value,
                        )
                    )
                    break   # First failing rule per field is enough

        # Warn on unknown extra fields
        for key in record:
            if key not in schema:
                warnings.append(f"Unrecognised field {key!r} not in schema — will be stored as-is.")

        return ValidationResult(
            record_id=rid,
            schema_name=schema_name,
            is_valid=len(errors) == 0,
            errors=errors,
            warnings=warnings,
        )

    def validate_batch(
        self,
        records: List[Dict[str, Any]],
        schema_name: str,
    ) -> Tuple[List[ValidationResult], int, int]:
        """
        Validate a batch of records.

        Returns (results, valid_count, invalid_count).
        """
        results = [self.validate(r, schema_name) for r in records]
        valid = sum(1 for r in results if r.is_valid)
        return results, valid, len(results) - valid

    def available_schemas(self) -> List[str]:
        return list(self._schemas.keys())


def _infer_error_type(rule: FieldRule) -> str:
    name = getattr(rule, "__name__", "")
    if "required" in name:
        return "missing"
    if "is_float" in name or "is_int" in name:
        return "type"
    if "range" in name:
        return "range"
    if "iso" in name or "format" in name:
        return "format"
    if "length" in name:
        return "length"
    return "validation"
