from typing import Any

from .base import BaseIngestionAdapter, Observation


class CycloneIngestion(BaseIngestionAdapter):
    source_name = "cyclone"

    def ingest(self, records: list[dict[str, Any]]) -> list[Observation]:
        result = []

        for record in records:
            values = {
                "wind_speed": record.get("wind_speed"),
                "central_pressure": record.get("central_pressure"),
                "storm_surge": record.get("storm_surge"),
                "radius_max_wind": record.get("radius_max_wind"),
                "movement_speed": record.get("movement_speed"),
                "movement_direction": record.get("movement_direction"),
                "category": record.get("category"),
            }

            result.append(
                Observation(
                    source=self.source,
                    timestamp=self.normalize_timestamp(record.get("timestamp")),
                    location=self.normalize_location(record),
                    values=values,
                    metadata={
                        "type": "cyclone",
                        "cyclone_id": record.get("cyclone_id") or record.get("name"),
                    },
                )
            )

        return result
