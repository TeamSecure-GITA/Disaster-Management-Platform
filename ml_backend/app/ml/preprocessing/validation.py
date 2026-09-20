"""
ML input validation.

Validates:
- Required fields
- Numeric types
- Finite values
- Allowed ranges
- Enumerated values
"""

from __future__ import annotations

import math
from dataclasses import asdict, dataclass, field
from typing import Any, Mapping, Optional


@dataclass
class ValidationResult:
    """Validation result."""

    valid: bool

    status: str

    errors: list[str] = field(
        default_factory=list
    )

    warnings: list[str] = field(
        default_factory=list
    )

    validated_fields: list[str] = field(
        default_factory=list
    )

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


class DataValidator:
    """
    Schema-light validation layer.

    Configuration example:

        required_fields=["rainfall", "temperature"]

        numeric_fields=["rainfall", "temperature"]

        ranges={
            "rainfall": (0, 1000),
            "temperature": (-50, 60),
        }
    """

    def __init__(
        self,
        required_fields: Optional[
            list[str]
        ] = None,
        numeric_fields: Optional[
            list[str]
        ] = None,
        ranges: Optional[
            Mapping[
                str,
                tuple[float, float],
            ]
        ] = None,
        allowed_values: Optional[
            Mapping[
                str,
                set[Any],
            ]
        ] = None,
    ) -> None:
        self.required_fields = (
            required_fields or []
        )

        self.numeric_fields = (
            numeric_fields or []
        )

        self.ranges = dict(
            ranges or {}
        )

        self.allowed_values = dict(
            allowed_values or {}
        )

    def validate(
        self,
        data: Mapping[str, Any],
    ) -> ValidationResult:
        """Validate one observation."""

        errors: list[str] = []

        warnings: list[str] = []

        validated: list[str] = []

        for field_name in (
            self.required_fields
        ):
            if (
                field_name not in data
                or data[field_name] is None
            ):
                errors.append(
                    f"Missing required field: {field_name}"
                )

        for field_name in (
            self.numeric_fields
        ):
            if field_name not in data:
                continue

            value = data[field_name]

            if isinstance(
                value,
                bool,
            ):
                errors.append(
                    f"{field_name} must be numeric."
                )
                continue

            try:
                numeric = float(value)
            except (
                TypeError,
                ValueError,
            ):
                errors.append(
                    f"{field_name} must be numeric."
                )
                continue

            if not math.isfinite(
                numeric
            ):
                errors.append(
                    f"{field_name} must be finite."
                )
                continue

            if field_name in self.ranges:
                minimum, maximum = (
                    self.ranges[field_name]
                )

                if not (
                    minimum
                    <= numeric
                    <= maximum
                ):
                    errors.append(
                        (
                            f"{field_name}={numeric} is outside "
                            f"the allowed range "
                            f"[{minimum}, {maximum}]."
                        )
                    )

            validated.append(
                field_name
            )

        for field_name, allowed in (
            self.allowed_values.items()
        ):
            if field_name not in data:
                continue

            if data[field_name] not in allowed:
                errors.append(
                    (
                        f"{field_name} has unsupported value "
                        f"{data[field_name]!r}."
                    )
                )
            else:
                validated.append(
                    field_name
                )

        if not data:
            warnings.append(
                "No fields were supplied."
            )

        return ValidationResult(
            valid=not errors,
            status=(
                "valid"
                if not errors
                else "invalid"
            ),
            errors=errors,
            warnings=warnings,
            validated_fields=sorted(
                set(validated)
            ),
        )

    def require_valid(
        self,
        data: Mapping[str, Any],
    ) -> None:
        """Raise ValueError if validation fails."""

        result = self.validate(
            data
        )

        if not result.valid:
            raise ValueError(
                "; ".join(
                    result.errors
                )
            )