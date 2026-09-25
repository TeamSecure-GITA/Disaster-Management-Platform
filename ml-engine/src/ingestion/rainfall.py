from typing import Any

from .base import BaseIngestionAdapter, Observation


class RainfallIngestion(BaseIngestionAdapter):
    source_name = "rainfall"

    def ingest(self, records: list[dict[str, Any]]) -> list[Observation]:
        result = []

        for record in records:
            values = {
                "rainfall_mm": record.get("rainfall_mm"),
                "duration_hours": record.get("duration_hours"),
                "intensity": record.get("intensity"),
            }

            result.append(
                Observation(
                    source=self.source,
                    timestamp=self.normalize_timestamp(record.get("timestamp")),
                    location=self.normalize_location(record),
                    values=values,
                    metadata={"type": "rainfall"},
                )
            )

        return result