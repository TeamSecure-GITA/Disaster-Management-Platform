from typing import Any

from .base import BaseIngestionAdapter, Observation


class SeismicIngestion(BaseIngestionAdapter):
    source_name = "seismic"

    def ingest(self, records: list[dict[str, Any]]) -> list[Observation]:
        result = []

        for record in records:
            values = {
                "magnitude": record.get("magnitude"),
                "depth_km": record.get("depth_km"),
                "pga": record.get("pga"),
                "pgv": record.get("pgv"),
                "frequency": record.get("frequency"),
            }

            result.append(
                Observation(
                    source=self.source,
                    timestamp=self.normalize_timestamp(record.get("timestamp")),
                    location=self.normalize_location(record),
                    values=values,
                    metadata={"type": "seismic"},
                )
            )

        return result