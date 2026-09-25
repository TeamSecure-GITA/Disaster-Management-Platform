from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any


@dataclass
class Observation:
    source: str
    timestamp: datetime
    location: dict[str, float] = field(default_factory=dict)
    values: dict[str, Any] = field(default_factory=dict)
    metadata: dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> dict[str, Any]:
        return {
            "source": self.source,
            "timestamp": self.timestamp.isoformat(),
            "location": self.location,
            "values": self.values,
            "metadata": self.metadata,
        }


class BaseIngestionAdapter(ABC):
    """Base interface for all ML data ingestion adapters."""

    source_name = "unknown"

    def __init__(self, source: str | None = None) -> None:
        self.source = source or self.source_name

    @abstractmethod
    def ingest(self, records: list[dict[str, Any]]) -> list[Observation]:
        """Convert raw records into normalized observations."""

    @staticmethod
    def utc_now() -> datetime:
        return datetime.now(timezone.utc)

    def normalize_timestamp(self, value: Any) -> datetime:
        if isinstance(value, datetime):
            return value

        if isinstance(value, str):
            parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))

            if parsed.tzinfo is None:
                parsed = parsed.replace(tzinfo=timezone.utc)

            return parsed

        return self.utc_now()

    def normalize_location(
        self,
        record: dict[str, Any],
    ) -> dict[str, float]:
        result: dict[str, float] = {}

        if "latitude" in record:
            result["latitude"] = float(record["latitude"])

        if "longitude" in record:
            result["longitude"] = float(record["longitude"])

        if "lat" in record:
            result["latitude"] = float(record["lat"])

        if "lon" in record:
            result["longitude"] = float(record["lon"])

        return result