from typing import Any

from .base import BaseIngestionAdapter, Observation


class CitizenReportsIngestion(BaseIngestionAdapter):
    source_name = "citizen_reports"

    def ingest(self, records: list[dict[str, Any]]) -> list[Observation]:
        result = []

        for record in records:
            values = {
                "hazard_type": record.get("hazard_type"),
                "severity": record.get("severity"),
                "description": record.get("description"),
                "verified": bool(record.get("verified", False)),
                "upvotes": int(record.get("upvotes", 0)),
                "media_url": record.get("media_url"),
            }

            result.append(
                Observation(
                    source=self.source,
                    timestamp=self.normalize_timestamp(record.get("timestamp")),
                    location=self.normalize_location(record),
                    values=values,
                    metadata={
                        "type": "citizen_report",
                        "reporter_id": record.get("reporter_id"),
                        "report_id": record.get("report_id") or record.get("id"),
                    },
                )
            )

        return result
