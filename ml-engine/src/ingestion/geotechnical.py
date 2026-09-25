from typing import Any

from .base import BaseIngestionAdapter, Observation


class GeotechnicalIngestion(BaseIngestionAdapter):
    source_name = "geotechnical"

    def ingest(self, records: list[dict[str, Any]]) -> list[Observation]:
        result = []

        for record in records:
            values = {
                "slope_angle": record.get("slope_angle"),
                "displacement": record.get("displacement"),
                "pore_pressure": record.get("pore_pressure"),
                "factor_of_safety": record.get("factor_of_safety"),
                "crack_width": record.get("crack_width"),
            }

            result.append(
                Observation(
                    source=self.source,
                    timestamp=self.normalize_timestamp(record.get("timestamp")),
                    location=self.normalize_location(record),
                    values=values,
                    metadata={"type": "geotechnical"},
                )
            )

        return result