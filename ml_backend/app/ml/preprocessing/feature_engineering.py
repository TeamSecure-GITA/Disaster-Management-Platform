"""
Generic feature-engineering utilities.

Provides deterministic transformations that can be shared across
hazard-specific models.

No missing real-world observation is fabricated.
"""

from __future__ import annotations

import math
from dataclasses import asdict, dataclass, field
from typing import Any, Mapping, Optional, Sequence


@dataclass
class FeatureEngineeringResult:
    """Feature-engineering output."""

    status: str

    features: dict[str, float]

    generated_features: list[str] = field(
        default_factory=list
    )

    warnings: list[str] = field(
        default_factory=list
    )

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


class FeatureEngineer:
    """
    Generic deterministic feature engineer.

    Built-in transformations:
    - Difference
    - Ratio
    - Sum
    - Mean
    - Product
    - Absolute difference
    - Log1p

    Example:

        engineer.add_difference(
            "rainfall_change",
            "rainfall_24h",
            "rainfall_previous_24h",
        )
    """

    def __init__(self) -> None:
        self._operations: list[
            tuple[str, str, tuple[str, ...]]
        ] = []

    def add_difference(
        self,
        output: str,
        first: str,
        second: str,
    ) -> "FeatureEngineer":
        self._operations.append(
            (
                "difference",
                output,
                (
                    first,
                    second,
                ),
            )
        )

        return self

    def add_absolute_difference(
        self,
        output: str,
        first: str,
        second: str,
    ) -> "FeatureEngineer":
        self._operations.append(
            (
                "absolute_difference",
                output,
                (
                    first,
                    second,
                ),
            )
        )

        return self

    def add_ratio(
        self,
        output: str,
        numerator: str,
        denominator: str,
    ) -> "FeatureEngineer":
        self._operations.append(
            (
                "ratio",
                output,
                (
                    numerator,
                    denominator,
                ),
            )
        )

        return self

    def add_sum(
        self,
        output: str,
        *features: str,
    ) -> "FeatureEngineer":
        self._operations.append(
            (
                "sum",
                output,
                tuple(features),
            )
        )

        return self

    def add_mean(
        self,
        output: str,
        *features: str,
    ) -> "FeatureEngineer":
        self._operations.append(
            (
                "mean",
                output,
                tuple(features),
            )
        )

        return self

    def add_product(
        self,
        output: str,
        *features: str,
    ) -> "FeatureEngineer":
        self._operations.append(
            (
                "product",
                output,
                tuple(features),
            )
        )

        return self

    def add_log1p(
        self,
        output: str,
        feature: str,
    ) -> "FeatureEngineer":
        self._operations.append(
            (
                "log1p",
                output,
                (feature,),
            )
        )

        return self

    @staticmethod
    def _number(
        value: Any,
        feature: str,
    ) -> float:
        if isinstance(
            value,
            bool,
        ):
            raise ValueError(
                f"{feature} cannot be boolean."
            )

        number = float(value)

        if not math.isfinite(
            number
        ):
            raise ValueError(
                f"{feature} must be finite."
            )

        return number

    def transform(
        self,
        data: Mapping[str, Any],
    ) -> FeatureEngineeringResult:
        """Apply configured transformations."""

        features: dict[str, float] = {}

        warnings: list[str] = []

        generated: list[str] = []

        # Preserve numeric input fields.
        for name, value in data.items():
            try:
                features[name] = (
                    self._number(
                        value,
                        name,
                    )
                )
            except (
                TypeError,
                ValueError,
            ):
                # Non-numeric fields may still be useful metadata.
                continue

        for operation, output, inputs in (
            self._operations
        ):
            missing = [
                name
                for name in inputs
                if name not in features
            ]

            if missing:
                warnings.append(
                    (
                        f"Cannot generate '{output}'; "
                        f"missing: {', '.join(missing)}."
                    )
                )
                continue

            values = [
                features[name]
                for name in inputs
            ]

            try:
                if operation == "difference":
                    result = (
                        values[0]
                        - values[1]
                    )

                elif operation == "absolute_difference":
                    result = abs(
                        values[0]
                        - values[1]
                    )

                elif operation == "ratio":
                    if values[1] == 0:
                        warnings.append(
                            (
                                f"Cannot generate '{output}': "
                                "division by zero."
                            )
                        )
                        continue

                    result = (
                        values[0]
                        / values[1]
                    )

                elif operation == "sum":
                    result = sum(values)

                elif operation == "mean":
                    result = (
                        sum(values)
                        / len(values)
                    )

                elif operation == "product":
                    result = 1.0

                    for value in values:
                        result *= value

                elif operation == "log1p":
                    if values[0] <= -1:
                        warnings.append(
                            (
                                f"Cannot generate '{output}': "
                                "log1p domain error."
                            )
                        )
                        continue

                    result = math.log1p(
                        values[0]
                    )

                else:
                    warnings.append(
                        (
                            f"Unknown feature operation: "
                            f"{operation}"
                        )
                    )
                    continue

                if not math.isfinite(
                    result
                ):
                    warnings.append(
                        (
                            f"Generated feature '{output}' "
                            "is not finite."
                        )
                    )
                    continue

                features[output] = result

                generated.append(
                    output
                )

            except Exception as exc:
                warnings.append(
                    (
                        f"Failed to generate '{output}': "
                        f"{exc}"
                    )
                )

        return FeatureEngineeringResult(
            status="success",
            features=features,
            generated_features=generated,
            warnings=warnings,
        )