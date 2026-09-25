from typing import Any

from .base import BaseIngestionAdapter, Observation


class WildfireIngestion(BaseIngestionAdapter):
    source_name = "wildfire"

    def ingest(self, records: list[dict[str, Any]]) -> list[Observation]:
        result = []

        for record in records:
            values = {
                "temperature": record.get("temperature"),
                "humidity": record.get("humidity"),
                "wind_speed": record.get("wind_speed"),
                "vegetation_index": record.get("vegetation_index"),
                "fire_radiative_power": record.get("fire_radiative_power"),
            }

            result.append(
                Observation(
                    source=self.source,
                    timestamp=self.normalize_timestamp(record.get("timestamp")),
                    location=self.normalize_location(record),
                    values=values,
                    metadata={"type": "wildfire"},
                )
            )

        return result