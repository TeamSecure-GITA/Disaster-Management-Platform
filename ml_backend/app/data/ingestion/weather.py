"""
Weather data ingestion.

Fetches, normalises, and structures meteorological data from:
- IMD (India Meteorological Department) REST feed
- OpenWeatherMap-compatible JSON APIs
- Generic weather station REST endpoints

All raw payloads are normalised into a ``WeatherObservation`` dataclass
so that downstream validation and feature engineering operate on a
single, schema-consistent object regardless of source.
"""

from __future__ import annotations

import json
import logging
import math
import time
import urllib.request
import urllib.error
from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from enum import Enum
from typing import Any, Dict, List, Optional


logger = logging.getLogger("disaster-management.data.ingestion.weather")


class WeatherSource(str, Enum):
    IMD = "imd"
    OPENWEATHERMAP = "openweathermap"
    NOAA = "noaa"
    GENERIC = "generic"
    MOCK = "mock"


@dataclass
class WeatherObservation:
    """
    Normalised weather observation record.

    All numeric fields use SI units unless noted.
    """

    source: WeatherSource
    station_id: str
    region: str
    latitude: float
    longitude: float
    observed_at: str                     # ISO-8601 UTC
    ingested_at: str = field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat()
    )

    # Meteorological fields
    temperature_c: Optional[float] = None          # Celsius
    feels_like_c: Optional[float] = None
    humidity_pct: Optional[float] = None           # 0 – 100
    pressure_hpa: Optional[float] = None           # hPa
    wind_speed_ms: Optional[float] = None          # m/s
    wind_direction_deg: Optional[float] = None     # 0 – 360
    wind_gust_ms: Optional[float] = None
    rainfall_mm_1h: Optional[float] = None         # mm in past hour
    rainfall_mm_24h: Optional[float] = None
    visibility_km: Optional[float] = None
    cloud_cover_pct: Optional[float] = None        # 0 – 100
    uv_index: Optional[float] = None
    dew_point_c: Optional[float] = None
    snow_depth_cm: Optional[float] = None

    # Alert / warning indicators
    cyclone_warning: bool = False
    flood_watch: bool = False
    heat_wave: bool = False

    raw: Optional[Dict[str, Any]] = field(default=None, repr=False)

    def to_dict(self) -> Dict[str, Any]:
        d = asdict(self)
        d["source"] = self.source.value
        return d

    @property
    def has_extreme_rain(self) -> bool:
        """True if rainfall exceeds NDMA heavy-rain threshold (64.5 mm/24 h)."""
        return (self.rainfall_mm_24h or 0.0) >= 64.5

    @property
    def has_extreme_wind(self) -> bool:
        """True if sustained wind speed ≥ 17.2 m/s (≈ 62 km/h, cyclone-watch level)."""
        return (self.wind_speed_ms or 0.0) >= 17.2


class WeatherIngester:
    """
    Pull weather observations from configured REST endpoints.

    Example::

        ingester = WeatherIngester(
            api_url="https://api.openweathermap.org/data/2.5/weather",
            api_key="YOUR_KEY",
            source=WeatherSource.OPENWEATHERMAP,
        )
        observation = ingester.fetch(lat=26.1, lon=91.7, station_id="guwahati")
    """

    _TIMEOUT_S = 10

    def __init__(
        self,
        api_url: Optional[str] = None,
        api_key: Optional[str] = None,
        source: WeatherSource = WeatherSource.GENERIC,
        region: str = "unknown",
    ):
        self.api_url = api_url
        self.api_key = api_key
        self.source = source
        self.region = region

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def fetch(
        self,
        lat: float,
        lon: float,
        station_id: str = "auto",
    ) -> WeatherObservation:
        """
        Fetch and return a normalised weather observation.

        Falls back to a mock observation when the API URL is not configured
        or the network request fails, ensuring the pipeline always returns data.
        """
        if not self.api_url:
            logger.warning("Weather API URL not configured — returning mock observation.")
            return self._mock_observation(lat, lon, station_id)

        try:
            raw = self._http_get(self._build_url(lat, lon))
            return self._normalise(raw, lat, lon, station_id)
        except Exception as exc:
            logger.warning(
                "Weather fetch failed (station=%s): %s — falling back to mock.",
                station_id,
                exc,
            )
            return self._mock_observation(lat, lon, station_id)

    def fetch_batch(
        self,
        stations: List[Dict[str, Any]],
    ) -> List[WeatherObservation]:
        """
        Fetch observations for multiple stations.

        Each station dict must contain: ``lat``, ``lon``, ``station_id``.
        """
        results: List[WeatherObservation] = []
        for s in stations:
            obs = self.fetch(
                lat=s["lat"],
                lon=s["lon"],
                station_id=s.get("station_id", "unknown"),
            )
            results.append(obs)
        return results

    # ------------------------------------------------------------------
    # Private helpers
    # ------------------------------------------------------------------

    def _build_url(self, lat: float, lon: float) -> str:
        base = self.api_url.rstrip("/")
        if self.source == WeatherSource.OPENWEATHERMAP:
            return (
                f"{base}?lat={lat}&lon={lon}"
                f"&appid={self.api_key or ''}&units=metric"
            )
        if self.source == WeatherSource.IMD:
            return f"{base}?lat={lat}&lon={lon}"
        return f"{base}?lat={lat}&lon={lon}"

    def _http_get(self, url: str) -> Dict[str, Any]:
        req = urllib.request.Request(
            url,
            headers={"Accept": "application/json"},
        )
        with urllib.request.urlopen(req, timeout=self._TIMEOUT_S) as resp:
            return json.loads(resp.read().decode())

    def _normalise(
        self,
        raw: Dict[str, Any],
        lat: float,
        lon: float,
        station_id: str,
    ) -> WeatherObservation:
        """Normalise source-specific JSON into a ``WeatherObservation``."""
        if self.source == WeatherSource.OPENWEATHERMAP:
            return self._normalise_owm(raw, lat, lon, station_id)
        if self.source == WeatherSource.IMD:
            return self._normalise_imd(raw, lat, lon, station_id)
        return self._normalise_generic(raw, lat, lon, station_id)

    def _normalise_owm(
        self,
        raw: Dict,
        lat: float,
        lon: float,
        station_id: str,
    ) -> WeatherObservation:
        main = raw.get("main", {})
        wind = raw.get("wind", {})
        rain = raw.get("rain", {})
        clouds = raw.get("clouds", {})
        ts = raw.get("dt", int(time.time()))
        obs_at = datetime.fromtimestamp(ts, tz=timezone.utc).isoformat()

        return WeatherObservation(
            source=WeatherSource.OPENWEATHERMAP,
            station_id=station_id,
            region=raw.get("name", self.region),
            latitude=lat,
            longitude=lon,
            observed_at=obs_at,
            temperature_c=main.get("temp"),
            feels_like_c=main.get("feels_like"),
            humidity_pct=main.get("humidity"),
            pressure_hpa=main.get("pressure"),
            wind_speed_ms=wind.get("speed"),
            wind_direction_deg=wind.get("deg"),
            wind_gust_ms=wind.get("gust"),
            rainfall_mm_1h=rain.get("1h"),
            cloud_cover_pct=clouds.get("all"),
            visibility_km=(raw.get("visibility", 0) / 1000.0) or None,
            raw=raw,
        )

    def _normalise_imd(
        self,
        raw: Dict,
        lat: float,
        lon: float,
        station_id: str,
    ) -> WeatherObservation:
        """IMD feed normaliser — fields may vary; safe fallback for missing keys."""
        return WeatherObservation(
            source=WeatherSource.IMD,
            station_id=station_id,
            region=raw.get("station_name", self.region),
            latitude=lat,
            longitude=lon,
            observed_at=raw.get("obs_time", datetime.now(timezone.utc).isoformat()),
            temperature_c=self._safe_float(raw, "temp"),
            humidity_pct=self._safe_float(raw, "rh"),
            pressure_hpa=self._safe_float(raw, "slp"),
            wind_speed_ms=self._safe_float(raw, "wind_speed_ms"),
            wind_direction_deg=self._safe_float(raw, "wind_dir"),
            rainfall_mm_1h=self._safe_float(raw, "rain_1h"),
            rainfall_mm_24h=self._safe_float(raw, "rain_24h"),
            cyclone_warning=bool(raw.get("cyclone_alert")),
            flood_watch=bool(raw.get("flood_alert")),
            raw=raw,
        )

    def _normalise_generic(
        self,
        raw: Dict,
        lat: float,
        lon: float,
        station_id: str,
    ) -> WeatherObservation:
        return WeatherObservation(
            source=WeatherSource.GENERIC,
            station_id=station_id,
            region=raw.get("region", self.region),
            latitude=lat,
            longitude=lon,
            observed_at=raw.get("timestamp", datetime.now(timezone.utc).isoformat()),
            temperature_c=self._safe_float(raw, "temperature_c"),
            humidity_pct=self._safe_float(raw, "humidity_pct"),
            pressure_hpa=self._safe_float(raw, "pressure_hpa"),
            wind_speed_ms=self._safe_float(raw, "wind_speed_ms"),
            rainfall_mm_1h=self._safe_float(raw, "rainfall_mm_1h"),
            rainfall_mm_24h=self._safe_float(raw, "rainfall_mm_24h"),
            raw=raw,
        )

    @staticmethod
    def _safe_float(d: Dict, key: str) -> Optional[float]:
        try:
            v = d.get(key)
            return float(v) if v is not None else None
        except (TypeError, ValueError):
            return None

    def _mock_observation(
        self,
        lat: float,
        lon: float,
        station_id: str,
    ) -> WeatherObservation:
        """Return a deterministic mock based on lat/lon hash — useful in dev/test."""
        seed = abs(hash((round(lat, 2), round(lon, 2))))
        temp_c = 22.0 + (seed % 20) - 10
        rain_mm = float((seed % 50))
        return WeatherObservation(
            source=WeatherSource.MOCK,
            station_id=station_id,
            region=self.region,
            latitude=lat,
            longitude=lon,
            observed_at=datetime.now(timezone.utc).isoformat(),
            temperature_c=round(temp_c, 1),
            humidity_pct=float(60 + seed % 40),
            pressure_hpa=1013.25,
            wind_speed_ms=round(float(seed % 15), 1),
            rainfall_mm_1h=round(rain_mm / 24.0, 2),
            rainfall_mm_24h=round(rain_mm, 1),
            cloud_cover_pct=float(seed % 100),
            flood_watch=rain_mm >= 64.5,
        )
