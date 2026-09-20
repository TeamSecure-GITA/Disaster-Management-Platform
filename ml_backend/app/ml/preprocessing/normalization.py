"""
Feature normalization utilities.

Supports:
- Min-max normalization
- Standardization

Parameters should normally be fitted on training data and reused during
inference. They must not be silently refitted on production observations.
"""

from __future__ import annotations

import math
from dataclasses import asdict, dataclass, field
from typing import Mapping, Optional, Sequence


@dataclass
class NormalizationResult:
    """Normalized feature output."""

    status: str

    values: dict[str, float]

    method: str

    warnings: list[str] = field(
        default_factory=list
    )

    def to_dict(self) -> dict:
        return asdict(self)


class DataNormalizer:
    """
    Normalize numeric feature dictionaries.

    Example:

        normalizer = DataNormalizer(
            method="minmax",
            parameters={
                "rainfall": (0.0, 500.0),
            },
        )
    """

    VALID_METHODS = {
        "minmax",
        "standard",
    }

    def __init__(
        self,
        method: str = "minmax",
        parameters: Optional[
            Mapping[
                str,
                tuple[float, float],
            ]
        ] = None,
    ) -> None:
        method = method.lower()

        if method not in self.VALID_METHODS:
            raise ValueError(
                f"Unsupported normalization method: {method}"
            )

        self.method = method

        self.parameters = dict(
            parameters or {}
        )

    @staticmethod
    def _finite(
        value: float,
    ) -> float:
        value = float(value)

        if not math.isfinite(value):
            raise ValueError(
                "Normalization requires finite numeric values."
            )

        return value

    def transform(
        self,
        data: Mapping[str, float],
    ) -> NormalizationResult:
        """Normalize supplied features."""

        output: dict[str, float] = {}

        warnings: list[str] = []

        for name, raw_value in data.items():
            try:
                value = self._finite(
                    raw_value
                )
            except ValueError as exc:
                return NormalizationResult(
                    status="invalid_input",
                    values={},
                    method=self.method,
                    warnings=[
                        f"{name}: {exc}"
                    ],
                )

            if name not in self.parameters:
                warnings.append(
                    (
                        f"No normalization parameters for "
                        f"'{name}'; original value retained."
                    )
                )

                output[name] = value
                continue

            first, second = (
                self.parameters[name]
            )

            if self.method == "minmax":
                minimum = float(first)
                maximum = float(second)

                if maximum <= minimum:
                    return NormalizationResult(
                        status="invalid_parameters",
                        values={},
                        method=self.method,
                        warnings=[
                            (
                                f"Invalid min-max parameters "
                                f"for '{name}'."
                            )
                        ],
                    )

                normalized = (
                    (value - minimum)
                    / (
                        maximum
                        - minimum
                    )
                )

                output[name] = normalized

            else:
                mean = float(first)
                standard_deviation = float(
                    second
                )

                if standard_deviation <= 0:
                    return NormalizationResult(
                        status="invalid_parameters",
                        values={},
                        method=self.method,
                        warnings=[
                            (
                                f"Invalid standard deviation "
                                f"for '{name}'."
                            )
                        ],
                    )

                output[name] = (
                    (
                        value
                        - mean
                    )
                    / standard_deviation
                )

        return NormalizationResult(
            status="success",
            values=output,
            method=self.method,
            warnings=warnings,
        )

    def transform_vector(
        self,
        values: Sequence[float],
        feature_names: Sequence[str],
    ) -> NormalizationResult:
        """Normalize an ordered feature vector."""

        if len(values) != len(
            feature_names
        ):
            return NormalizationResult(
                status="dimension_mismatch",
                values={},
                method=self.method,
                warnings=[
                    (
                        "Feature vector and feature-name "
                        "lengths do not match."
                    )
                ],
            )

        return self.transform(
            dict(
                zip(
                    feature_names,
                    values,
                )
            )
        )