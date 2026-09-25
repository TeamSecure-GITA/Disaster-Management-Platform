from typing import Any

from .base import BaseIngestionAdapter, Observation


class DroneIngestion(BaseIngestionAdapter):
    source_name = "drone"

    def ingest(self, records: list[dict[str, Any]]) -> list[Observation]:
        result = []

        for record in records:
            values = {
                "image_path": record.get("image_path"),
                "altitude": record.get("altitude"),
                "crack_score": record.get("crack_score"),
                "damage_score": record.get("damage_score"),
            }

            result.append(
                Observation(
                    source=self.source,
                    timestamp=self.normalize_timestamp(record.get("timestamp")),
                    location=self.normalize_location(record),
                    values=values,
                    metadata={"type": "drone"},
                )
            )

        return result