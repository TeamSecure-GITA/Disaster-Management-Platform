"""
Historical disaster data ingestion.

Loads and normalises structured historical records from:
- NDMA (National Disaster Management Authority) incident archives
- EM-DAT (International Disaster Database) CSV exports
- State/district disaster management cell records
- Relief Web / UN OCHA humanitarian data
- Internal platform historical event database exports

Normalised records feed baseline calibration for ML models, KPI
benchmarking, trend analysis, and seasonal pattern detection.
"""

from __future__ import annotations

import csv
import io
import json
import logging
from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from enum import Enum
from typing import Any, Dict, Generator, List, Optional


logger = logging.getLogger("disaster-management.data.ingestion.historical")


class HistoricalSource(str, Enum):
    NDMA = "ndma"
    EM_DAT = "em_dat"
    RELIEFWEB = "reliefweb"
    STATE_RECORDS = "state_records"
    INTERNAL_DB = "internal_db"
    CSV_UPLOAD = "csv_upload"
    JSON_UPLOAD = "json_upload"


class DisasterCategory(str, Enum):
    FLOOD = "flood"
    DROUGHT = "drought"
    CYCLONE = "cyclone"
    EARTHQUAKE = "earthquake"
    LANDSLIDE = "landslide"
    TSUNAMI = "tsunami"
    WILDFIRE = "wildfire"
    HEAT_WAVE = "heat_wave"
    COLD_WAVE = "cold_wave"
    INDUSTRIAL = "industrial"
    EPIDEMIC = "epidemic"
    OTHER = "other"


@dataclass
class HistoricalEvent:
    """
    Normalised historical disaster event record.

    All monetary figures in USD (2024 prices); all counts in persons.
    """

    event_id: str
    source: HistoricalSource
    disaster_category: DisasterCategory
    event_name: str
    country: str = "India"
    state: str = "unknown"
    district: str = "unknown"
    region: str = "unknown"

    # Dates
    start_date: Optional[str] = None         # ISO-8601
    end_date: Optional[str] = None
    year: Optional[int] = None

    # Impact statistics
    total_deaths: int = 0
    total_injured: int = 0
    total_missing: int = 0
    total_affected: int = 0                  # Persons affected (not deaths)
    total_displaced: int = 0
    total_insured_damage_usd: float = 0.0
    total_damage_usd: float = 0.0
    houses_destroyed: int = 0
    houses_damaged: int = 0

    # Geographic
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    area_affected_sqkm: float = 0.0

    # Narrative
    description: Optional[str] = None
    response_actions: Optional[str] = None

    ingested_at: str = field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat()
    )
    raw: Optional[Dict[str, Any]] = field(default=None, repr=False)

    def to_dict(self) -> Dict[str, Any]:
        d = asdict(self)
        d["source"] = self.source.value
        d["disaster_category"] = self.disaster_category.value
        return d

    @property
    def mortality_rate(self) -> Optional[float]:
        """Deaths / total affected (returns None if affected == 0)."""
        if self.total_affected > 0:
            return round(self.total_deaths / self.total_affected, 6)
        return None

    @property
    def is_major_event(self) -> bool:
        """NDMA classification: deaths ≥ 100 OR affected ≥ 100,000."""
        return self.total_deaths >= 100 or self.total_affected >= 100_000


class HistoricalIngester:
    """
    Load, parse, and normalise historical disaster records from multiple formats.

    Supported formats: JSON (list of dicts), CSV (EM-DAT style), NDMA archive.

    Example::

        ingester = HistoricalIngester()

        # From JSON list
        events = ingester.from_json(json_str)

        # From CSV string (EM-DAT export)
        events = ingester.from_emdat_csv(csv_str)

        # From a list of dicts (internal DB query result)
        events = ingester.from_records(records)
    """

    # EM-DAT column name → HistoricalEvent field mapping
    _EMDAT_COL_MAP: Dict[str, str] = {
        "Disaster Type": "disaster_category",
        "Event Name": "event_name",
        "Country": "country",
        "Region": "region",
        "Start Year": "year",
        "Start Date": "start_date",
        "End Date": "end_date",
        "Total Deaths": "total_deaths",
        "No. Injured": "total_injured",
        "No. Affected": "total_affected",
        "No. Homeless": "total_displaced",
        "Total Damage ('000 US$)": "_damage_k",   # 1000s USD
        "Latitude": "latitude",
        "Longitude": "longitude",
    }

    # EM-DAT disaster subtype → DisasterCategory
    _EMDAT_TYPE_MAP: Dict[str, DisasterCategory] = {
        "flood": DisasterCategory.FLOOD,
        "flash flood": DisasterCategory.FLOOD,
        "riverine flood": DisasterCategory.FLOOD,
        "drought": DisasterCategory.DROUGHT,
        "cyclone": DisasterCategory.CYCLONE,
        "tropical cyclone": DisasterCategory.CYCLONE,
        "storm": DisasterCategory.CYCLONE,
        "earthquake": DisasterCategory.EARTHQUAKE,
        "landslide": DisasterCategory.LANDSLIDE,
        "mudslide": DisasterCategory.LANDSLIDE,
        "tsunami": DisasterCategory.TSUNAMI,
        "wildfire": DisasterCategory.WILDFIRE,
        "extreme temperature": DisasterCategory.HEAT_WAVE,
        "heat wave": DisasterCategory.HEAT_WAVE,
        "industrial accident": DisasterCategory.INDUSTRIAL,
        "epidemic": DisasterCategory.EPIDEMIC,
    }

    def __init__(self):
        self._events: List[HistoricalEvent] = []

    # ------------------------------------------------------------------
    # JSON ingestion
    # ------------------------------------------------------------------

    def from_json(self, json_str: str) -> List[HistoricalEvent]:
        """Parse a JSON array of historical event dicts."""
        try:
            records = json.loads(json_str)
            if not isinstance(records, list):
                records = [records]
            return self.from_records(records)
        except json.JSONDecodeError as exc:
            logger.error("JSON parse error: %s", exc)
            return []

    def from_records(
        self,
        records: List[Dict[str, Any]],
        source: HistoricalSource = HistoricalSource.INTERNAL_DB,
    ) -> List[HistoricalEvent]:
        """Normalise a list of record dicts (internal DB / API format)."""
        events: List[HistoricalEvent] = []
        for i, r in enumerate(records):
            event = self._normalise_record(r, i, source)
            if event:
                events.append(event)
                self._events.append(event)
        logger.info("Ingested %d historical events from records.", len(events))
        return events

    # ------------------------------------------------------------------
    # CSV ingestion (EM-DAT)
    # ------------------------------------------------------------------

    def from_emdat_csv(self, csv_content: str) -> List[HistoricalEvent]:
        """
        Parse an EM-DAT style CSV export into historical events.

        EM-DAT CSV column names may vary by export version.
        Handles missing columns gracefully.
        """
        reader = csv.DictReader(io.StringIO(csv_content))
        events: List[HistoricalEvent] = []
        for i, row in enumerate(reader):
            event = self._normalise_emdat_row(row, i)
            if event:
                events.append(event)
                self._events.append(event)
        logger.info("Ingested %d events from EM-DAT CSV.", len(events))
        return events

    # ------------------------------------------------------------------
    # Streaming / generator API
    # ------------------------------------------------------------------

    def stream_large_csv(
        self,
        filepath: str,
        batch_size: int = 500,
    ) -> Generator[List[HistoricalEvent], None, None]:
        """
        Memory-efficient generator for large CSV files.
        Yields batches of normalised events.
        """
        batch: List[HistoricalEvent] = []
        try:
            with open(filepath, newline="", encoding="utf-8") as fh:
                reader = csv.DictReader(fh)
                for i, row in enumerate(reader):
                    event = self._normalise_emdat_row(row, i)
                    if event:
                        batch.append(event)
                    if len(batch) >= batch_size:
                        yield batch
                        batch = []
            if batch:
                yield batch
        except OSError as exc:
            logger.error("Error reading CSV file %s: %s", filepath, exc)

    # ------------------------------------------------------------------
    # Normalisation helpers
    # ------------------------------------------------------------------

    def _normalise_record(
        self,
        r: Dict[str, Any],
        idx: int,
        source: HistoricalSource,
    ) -> Optional[HistoricalEvent]:
        try:
            raw_cat = r.get("disaster_category", r.get("type", "other"))
            try:
                category = DisasterCategory(str(raw_cat).lower())
            except ValueError:
                category = DisasterCategory.OTHER

            year = r.get("year") or (
                int(r["start_date"][:4]) if r.get("start_date") else None
            )

            return HistoricalEvent(
                event_id=str(r.get("event_id", f"EVT-{idx:06d}")),
                source=source,
                disaster_category=category,
                event_name=r.get("event_name", r.get("name", f"Event-{idx}")),
                country=r.get("country", "India"),
                state=r.get("state", "unknown"),
                district=r.get("district", "unknown"),
                region=r.get("region", "unknown"),
                start_date=r.get("start_date"),
                end_date=r.get("end_date"),
                year=int(year) if year else None,
                total_deaths=self._int(r.get("total_deaths", 0)),
                total_injured=self._int(r.get("total_injured", 0)),
                total_missing=self._int(r.get("total_missing", 0)),
                total_affected=self._int(r.get("total_affected", 0)),
                total_displaced=self._int(r.get("total_displaced", 0)),
                total_damage_usd=self._float(r.get("total_damage_usd", 0)),
                houses_destroyed=self._int(r.get("houses_destroyed", 0)),
                houses_damaged=self._int(r.get("houses_damaged", 0)),
                latitude=self._float(r.get("latitude")),
                longitude=self._float(r.get("longitude")),
                area_affected_sqkm=self._float(r.get("area_affected_sqkm", 0)),
                description=r.get("description"),
                response_actions=r.get("response_actions"),
                raw=r,
            )
        except Exception as exc:
            logger.warning("Failed to normalise record %d: %s", idx, exc)
            return None

    def _normalise_emdat_row(
        self, row: Dict[str, str], idx: int
    ) -> Optional[HistoricalEvent]:
        try:
            raw_type = row.get("Disaster Type", "other").lower().strip()
            category = self._EMDAT_TYPE_MAP.get(raw_type, DisasterCategory.OTHER)

            damage_k = self._float(row.get("Total Damage ('000 US$)"))
            damage_usd = (damage_k * 1000.0) if damage_k else 0.0

            year_str = row.get("Start Year", "")
            year = int(year_str) if year_str.isdigit() else None

            start_date = row.get("Start Date") or None
            end_date = row.get("End Date") or None

            event_id = (
                row.get("DisNo.", "")
                or row.get("Dis No", "")
                or f"EMDAT-{idx:06d}"
            )

            return HistoricalEvent(
                event_id=event_id,
                source=HistoricalSource.EM_DAT,
                disaster_category=category,
                event_name=row.get("Event Name", f"EM-DAT Event {idx}"),
                country=row.get("Country", "India"),
                region=row.get("Region", "unknown"),
                start_date=start_date,
                end_date=end_date,
                year=year,
                total_deaths=self._int(row.get("Total Deaths", "0")),
                total_injured=self._int(row.get("No. Injured", "0")),
                total_affected=self._int(row.get("No. Affected", "0")),
                total_displaced=self._int(row.get("No. Homeless", "0")),
                total_damage_usd=damage_usd,
                latitude=self._float(row.get("Latitude")),
                longitude=self._float(row.get("Longitude")),
                raw=dict(row),
            )
        except Exception as exc:
            logger.warning("Failed to normalise EM-DAT row %d: %s", idx, exc)
            return None

    @staticmethod
    def _int(v: Any) -> int:
        try:
            return int(float(str(v).replace(",", ""))) if v is not None else 0
        except (ValueError, TypeError):
            return 0

    @staticmethod
    def _float(v: Any) -> Optional[float]:
        try:
            return float(str(v).replace(",", "")) if v is not None else None
        except (ValueError, TypeError):
            return None

    # ------------------------------------------------------------------
    # Query helpers
    # ------------------------------------------------------------------

    def get_all(self) -> List[HistoricalEvent]:
        return list(self._events)

    def filter_by_category(self, category: DisasterCategory) -> List[HistoricalEvent]:
        return [e for e in self._events if e.disaster_category == category]

    def filter_by_year_range(self, start: int, end: int) -> List[HistoricalEvent]:
        return [e for e in self._events if e.year and start <= e.year <= end]

    def major_events(self) -> List[HistoricalEvent]:
        return [e for e in self._events if e.is_major_event]
