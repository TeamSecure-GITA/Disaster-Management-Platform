from typing import Any

from .base import BaseIngestionAdapter, Observation


class SatelliteIngestion(BaseIngestionAdapter):
    source_name = "satellite"

    def ingest(self, records: list[dict[str, Any]]) -> list[Observation]:
        result = []

        for record in records:
            values = {
                "ndvi": record.get("ndvi"),
                "ndwi": record.get("ndwi"),
                "surface_temperature": record.get("surface_temperature"),
                "elevation": record.get("elevation"),
            }

            result.append(
                Observation(
                    source=self.source,
                    timestamp=self.normalize_timestamp(record.get("timestamp")),
                    location=self.normalize_location(record),
                    values=values,
                    metadata={
                        "type": "satellite",
                        "satellite": record.get("satellite"),
                    },
                )
            )

        return result