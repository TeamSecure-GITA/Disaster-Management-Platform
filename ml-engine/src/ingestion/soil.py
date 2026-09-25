from typing import Any

from .base import BaseIngestionAdapter, Observation


class SoilIngestion(BaseIngestionAdapter):
    source_name = "soil"

    def ingest(self, records: list[dict[str, Any]]) -> list[Observation]:
        result = []

        for record in records:
            values = {
                "soil_moisture": record.get("soil_moisture"),
                "soil_temperature": record.get("soil_temperature"),
                "soil_type": record.get("soil_type"),
            }

            result.append(
                Observation(
                    source=self.source,
                    timestamp=self.normalize_timestamp(record.get("timestamp")),
                    location=self.normalize_location(record),
                    values=values,
                    metadata={"type": "soil"},
                )
            )

        return result