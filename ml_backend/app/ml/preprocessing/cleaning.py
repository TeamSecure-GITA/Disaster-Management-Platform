"""
Generic data-cleaning utilities.

The cleaner removes or handles invalid values only according to explicit
rules. It never invents missing disaster observations.
"""

from __future__ import annotations

import math
from dataclasses import asdict, dataclass, field
from typing import Any, Mapping, Optional, Sequence


@dataclass
class CleaningResult:
    """Result of a cleaning operation."""

    status: str

    data: dict[str, Any]

    removed_fields: list[str] = field(
        default_factory=list
    )

    converted_fields: list[str] = field(
        default_factory=list
    )

    warnings: list[str] = field(
        default_factory=list
    )

    @property
    def cleaned_features(self) -> dict[str, Any]:
        return self.data

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


class DataCleaner:
    """
    Clean structured ML input.

    Supported operations:
    - Remove null values when requested
    - Convert numeric strings
    - Reject NaN / infinity
    - Apply explicit clipping
    """

    def __init__(
        self,
        remove_nulls: bool = False,
        convert_numeric_strings: bool = True,
        clip_ranges: Optional[
            Mapping[str, tuple[float, float]]
        ] = None,
    ) -> None:
        self.remove_nulls = remove_nulls

        self.convert_numeric_strings = (
            convert_numeric_strings
        )

        self.clip_ranges = dict(
            clip_ranges or {}
        )

    @staticmethod
    def _is_missing(
        value: Any,
    ) -> bool:
        if value is None:
            return True

        if isinstance(
            value,
            float,
        ):
            return math.isnan(value)

        return False

    @staticmethod
    def _is_finite_number(
        value: Any,
    ) -> bool:
        if isinstance(
            value,
            bool,
        ):
            return False

        if isinstance(
            value,
            (int, float),
        ):
            return math.isfinite(
                float(value)
            )

        return True

    def clean(
        self,
        data: Mapping[str, Any],
    ) -> CleaningResult:
        """Clean one structured observation."""

        result: dict[str, Any] = {}

        removed: list[str] = []

        converted: list[str] = []

        warnings: list[str] = []

        for key, original in data.items():
            value = original

            if self._is_missing(value):
                if self.remove_nulls:
                    removed.append(key)
                    continue

                result[key] = value
                continue

            if (
                self.convert_numeric_strings
                and isinstance(value, str)
            ):
                stripped = value.strip()

                try:
                    numeric = float(
                        stripped
                    )

                    if math.isfinite(
                        numeric
                    ):
                        value = numeric
                        converted.append(
                            key
                        )
                except (
                    TypeError,
                    ValueError,
                ):
                    pass

            if not self._is_finite_number(
                value
            ):
                warnings.append(
                    f"Invalid numeric value retained for '{key}'."
                )

            if key in self.clip_ranges:
                minimum, maximum = (
                    self.clip_ranges[key]
                )

                try:
                    numeric = float(
                        value
                    )

                    clipped = min(
                        max(
                            numeric,
                            minimum,
                        ),
                        maximum,
                    )

                    if clipped != numeric:
                        warnings.append(
                            (
                                f"'{key}' was clipped from "
                                f"{numeric} to {clipped}."
                            )
                        )

                    value = clipped

                except (
                    TypeError,
                    ValueError,
                ):
                    warnings.append(
                        (
                            f"Could not apply clipping "
                            f"to '{key}'."
                        )
                    )

            result[key] = value

        return CleaningResult(
            status="success",
            data=result,
            removed_fields=removed,
            converted_fields=converted,
            warnings=warnings,
        )

    def clean_many(
        self,
        rows: Sequence[
            Mapping[str, Any]
        ],
    ) -> list[CleaningResult]:
        """Clean multiple observations."""

        return [
            self.clean(row)
            for row in rows
        ]