"""
Satellite imagery metadata ingestion.

Fetches scene metadata from:
- Sentinel Hub / Copernicus Open Access Hub
- ISRO Bhuvan / Resourcesat
- Generic STAC (SpatioTemporal Asset Catalog) REST endpoints

Note: Actual GeoTIFF / COG image downloads are handled separately by the
storage layer. This module only ingests and normalises scene *metadata*
records for indexing, triage, and ML pipeline scheduling.
"""

from __future__ import annotations

import json
import logging
import urllib.request
import urllib.error
from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from enum import Enum
from typing import Any, Dict, List, Optional


logger = logging.getLogger("disaster-management.data.ingestion.satellite")


class SatelliteSource(str, Enum):
    SENTINEL_2 = "sentinel_2"
    SENTINEL_1 = "sentinel_1"
    LANDSAT_8 = "landsat_8"
    LANDSAT_9 = "landsat_9"
    RESOURCESAT = "resourcesat"
    MODIS = "modis"
    VIIRS = "viirs"
    BHUVAN = "bhuvan"
    STAC_GENERIC = "stac_generic"
    MOCK = "mock"


class BandType(str, Enum):
    RGB = "rgb"
    NEAR_INFRARED = "nir"
    SHORT_WAVE_INFRARED = "swir"
    THERMAL = "thermal"
    SAR = "sar"             # Synthetic Aperture Radar
    MULTISPECTRAL = "multispectral"
    PANCHROMATIC = "panchromatic"


@dataclass
class BoundingBox:
    """Axis-aligned geographic bounding box in WGS-84."""

    min_lon: float
    min_lat: float
    max_lon: float
    max_lat: float

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)

    @property
    def center_lat(self) -> float:
        return (self.min_lat + self.max_lat) / 2.0

    @property
    def center_lon(self) -> float:
        return (self.min_lon + self.max_lon) / 2.0


@dataclass
class SatelliteScene:
    """
    Normalised satellite scene metadata record.

    Does not carry pixel data — only scene identification, geometry,
    cloud cover, and download links for downstream processing.
    """

    scene_id: str
    source: SatelliteSource
    band_type: BandType
    acquisition_date: str            # ISO-8601 UTC
    ingested_at: str = field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat()
    )

    bounding_box: Optional[BoundingBox] = None
    cloud_cover_pct: float = 0.0     # 0 – 100
    spatial_resolution_m: float = 10.0
    orbit_number: Optional[int] = None
    processing_level: str = "L2A"    # L1C, L2A, L3, etc.

    # Download / access links
    preview_url: Optional[str] = None
    download_url: Optional[str] = None
    thumbnail_url: Optional[str] = None

    # Disaster relevance scoring (set by downstream triage)
    disaster_relevance_score: Optional[float] = None

    # Raw source metadata
    raw: Optional[Dict[str, Any]] = field(default=None, repr=False)

    def to_dict(self) -> Dict[str, Any]:
        d = asdict(self)
        d["source"] = self.source.value
        d["band_type"] = self.band_type.value
        if self.bounding_box:
            d["bounding_box"] = self.bounding_box.to_dict()
        return d

    @property
    def is_usable(self) -> bool:
        """True if cloud cover is below 30% — usable for visual change detection."""
        return self.cloud_cover_pct <= 30.0


class SatelliteIngester:
    """
    Fetch and normalise satellite scene metadata from STAC endpoints or
    source-specific APIs.

    Example::

        ingester = SatelliteIngester(
            stac_api_url="https://earth-search.aws.element84.com/v1",
            source=SatelliteSource.SENTINEL_2,
        )
        scenes = ingester.search_scenes(
            bbox=BoundingBox(90.0, 25.0, 93.0, 28.0),
            start_date="2026-09-01",
            end_date="2026-09-21",
            max_cloud_cover=30.0,
        )
    """

    _TIMEOUT_S = 15

    def __init__(
        self,
        stac_api_url: Optional[str] = None,
        api_key: Optional[str] = None,
        source: SatelliteSource = SatelliteSource.STAC_GENERIC,
    ):
        self.stac_api_url = stac_api_url
        self.api_key = api_key
        self.source = source

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def search_scenes(
        self,
        bbox: BoundingBox,
        start_date: str,
        end_date: str,
        max_cloud_cover: float = 30.0,
        max_results: int = 20,
    ) -> List[SatelliteScene]:
        """
        Search for scenes overlapping ``bbox`` within the date range.
        Returns mock data when API is not configured.
        """
        if not self.stac_api_url:
            logger.warning("Satellite STAC API not configured — returning mock scenes.")
            return self._mock_scenes(bbox, start_date, end_date, max_results)

        try:
            payload = self._build_stac_query(
                bbox, start_date, end_date, max_cloud_cover, max_results
            )
            url = f"{self.stac_api_url.rstrip('/')}/search"
            raw = self._http_post(url, payload)
            return self._parse_stac_response(raw, max_cloud_cover)
        except Exception as exc:
            logger.warning("Satellite search failed: %s — falling back to mock.", exc)
            return self._mock_scenes(bbox, start_date, end_date, max_results)

    def ingest_single(self, raw: Dict[str, Any]) -> SatelliteScene:
        """Normalise a single raw STAC item dict into a ``SatelliteScene``."""
        return self._parse_stac_item(raw)

    # ------------------------------------------------------------------
    # Private: STAC query and parsing
    # ------------------------------------------------------------------

    def _build_stac_query(
        self,
        bbox: BoundingBox,
        start_date: str,
        end_date: str,
        max_cloud: float,
        limit: int,
    ) -> Dict[str, Any]:
        return {
            "bbox": [bbox.min_lon, bbox.min_lat, bbox.max_lon, bbox.max_lat],
            "datetime": f"{start_date}T00:00:00Z/{end_date}T23:59:59Z",
            "limit": limit,
            "query": {
                "eo:cloud_cover": {"lte": max_cloud},
            },
        }

    def _http_post(self, url: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        data = json.dumps(payload).encode()
        req = urllib.request.Request(
            url,
            data=data,
            headers={
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=self._TIMEOUT_S) as resp:
            return json.loads(resp.read().decode())

    def _parse_stac_response(
        self,
        raw: Dict[str, Any],
        max_cloud: float,
    ) -> List[SatelliteScene]:
        features = raw.get("features", [])
        return [
            self._parse_stac_item(f)
            for f in features
            if f.get("properties", {}).get("eo:cloud_cover", 0) <= max_cloud
        ]

    def _parse_stac_item(self, item: Dict[str, Any]) -> SatelliteScene:
        props = item.get("properties", {})
        geom = item.get("bbox", [])
        bbox = None
        if len(geom) >= 4:
            bbox = BoundingBox(
                min_lon=geom[0], min_lat=geom[1],
                max_lon=geom[2], max_lat=geom[3],
            )

        band_str = props.get("instruments", ["rgb"])[0] if props.get("instruments") else "rgb"
        try:
            band = BandType(band_str.lower())
        except ValueError:
            band = BandType.MULTISPECTRAL

        links = {lnk.get("rel"): lnk.get("href") for lnk in item.get("links", [])}
        assets = item.get("assets", {})

        return SatelliteScene(
            scene_id=item.get("id", "unknown"),
            source=self.source,
            band_type=band,
            acquisition_date=props.get("datetime", datetime.now(timezone.utc).isoformat()),
            bounding_box=bbox,
            cloud_cover_pct=float(props.get("eo:cloud_cover", 0)),
            spatial_resolution_m=float(props.get("gsd", 10.0)),
            orbit_number=props.get("sat:absolute_orbit"),
            processing_level=props.get("processing:level", "L2A"),
            preview_url=assets.get("thumbnail", {}).get("href"),
            download_url=assets.get("visual", {}).get("href"),
            thumbnail_url=links.get("thumbnail"),
            raw=item,
        )

    def _mock_scenes(
        self,
        bbox: BoundingBox,
        start_date: str,
        end_date: str,
        count: int,
    ) -> List[SatelliteScene]:
        scenes = []
        for i in range(min(count, 5)):
            scenes.append(SatelliteScene(
                scene_id=f"MOCK-SCENE-{i:04d}",
                source=SatelliteSource.MOCK,
                band_type=BandType.RGB if i % 2 == 0 else BandType.SAR,
                acquisition_date=f"{start_date}T{6 + i * 2:02d}:00:00Z",
                bounding_box=bbox,
                cloud_cover_pct=float(i * 5),
                spatial_resolution_m=10.0,
                processing_level="L2A",
            ))
        return scenes
