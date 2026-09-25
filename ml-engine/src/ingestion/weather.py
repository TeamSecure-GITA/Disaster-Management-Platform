from typing import Any

from .base import BaseIngestionAdapter, Observation


class WeatherIngestion(BaseIngestionAdapter):
    source_name = "weather"

    def ingest(self, records: list[dict[str, Any]]) -> list[Observation]:
        observations = []

        for record in records:
            values = {
                key: record[key]
                for key in (
                    "temperature",
                    "humidity",
                    "pressure",
                    "wind_speed",
                    "wind_direction",
                    "visibility",
                )
                if key in record
            }

            observations.append(
                Observation(
                    source=self.source,
                    timestamp=self.normalize_timestamp(record.get("timestamp")),
                    location=self.normalize_location(record),
                    values=values,
                    metadata={"type": "weather"},
                )
            )

        return observations