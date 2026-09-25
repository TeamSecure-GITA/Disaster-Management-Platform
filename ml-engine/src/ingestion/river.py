from typing import Any

from .base import BaseIngestionAdapter, Observation


class RiverIngestion(BaseIngestionAdapter):
    source_name = "river"

    def ingest(self, records: list[dict[str, Any]]) -> list[Observation]:
        result = []

        for record in records:
            values = {
                "water_level": record.get("water_level"),
                "flow_rate": record.get("flow_rate"),
                "discharge": record.get("discharge"),
            }

            result.append(
                Observation(
                    source=self.source,
                    timestamp=self.normalize_timestamp(record.get("timestamp")),
                    location=self.normalize_location(record),
                    values=values,
                    metadata={"type": "river"},
                )
            )

        return result