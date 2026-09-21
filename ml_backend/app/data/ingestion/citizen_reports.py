"""
Citizen / crowdsourced disaster report ingestion.

Accepts and normalises field reports submitted by:
- Mobile app users (geo-tagged photos, voice descriptions)
- WhatsApp / SMS gateway integrations
- Community coordinators using the web portal
- Social media monitored feeds (filtered & de-noised)

Includes basic credibility scoring, deduplication fingerprinting,
and priority triage based on report type and urgency keywords.
"""

from __future__ import annotations

import hashlib
import logging
import re
from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from enum import Enum
from typing import Any, Dict, List, Optional


logger = logging.getLogger("disaster-management.data.ingestion.citizen_reports")


class ReportChannel(str, Enum):
    MOBILE_APP = "mobile_app"
    SMS = "sms"
    WHATSAPP = "whatsapp"
    WEB_PORTAL = "web_portal"
    SOCIAL_MEDIA = "social_media"
    VOICE_CALL = "voice_call"
    FIELD_COORDINATOR = "field_coordinator"
    UNKNOWN = "unknown"


class ReportType(str, Enum):
    FLOOD = "flood"
    LANDSLIDE = "landslide"
    CYCLONE_DAMAGE = "cyclone_damage"
    BUILDING_COLLAPSE = "building_collapse"
    FIRE = "fire"
    ROAD_BLOCKED = "road_blocked"
    POWER_OUTAGE = "power_outage"
    WATER_CONTAMINATION = "water_contamination"
    MISSING_PERSON = "missing_person"
    TRAPPED_PERSON = "trapped_person"
    MEDICAL_EMERGENCY = "medical_emergency"
    RESOURCE_NEED = "resource_need"
    INFRASTRUCTURE_DAMAGE = "infrastructure_damage"
    OTHER = "other"


class ReportStatus(str, Enum):
    PENDING = "pending"
    VERIFIED = "verified"
    REJECTED = "rejected"
    IN_PROGRESS = "in_progress"
    RESOLVED = "resolved"
    DUPLICATE = "duplicate"


class UrgencyLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    LIFE_THREATENING = "life_threatening"


# Keywords that escalate urgency to LIFE_THREATENING
_CRITICAL_KEYWORDS = {
    "trapped", "drowning", "unconscious", "bleeding", "collapsed",
    "missing", "swept away", "buried", "critical", "dead", "dying",
    "help", "stuck", "no oxygen", "mayday",
}

# Keywords that signal HIGH urgency
_HIGH_URGENCY_KEYWORDS = {
    "flood", "fire", "landslide", "rescue", "urgent", "emergency",
    "building down", "house collapsed", "road blocked", "water level",
}


def _classify_urgency(text: str) -> UrgencyLevel:
    lower = text.lower()
    if any(kw in lower for kw in _CRITICAL_KEYWORDS):
        return UrgencyLevel.LIFE_THREATENING
    if any(kw in lower for kw in _HIGH_URGENCY_KEYWORDS):
        return UrgencyLevel.HIGH
    return UrgencyLevel.MEDIUM


def _classify_type(text: str) -> ReportType:
    lower = text.lower()
    mapping: List[tuple[ReportType, List[str]]] = [
        (ReportType.TRAPPED_PERSON, ["trapped", "stuck", "buried under"]),
        (ReportType.MISSING_PERSON, ["missing", "lost contact", "swept away"]),
        (ReportType.BUILDING_COLLAPSE, ["collapse", "building down", "house fell"]),
        (ReportType.FLOOD, ["flood", "water level", "inundated", "submerged"]),
        (ReportType.LANDSLIDE, ["landslide", "mudslide", "debris flow"]),
        (ReportType.FIRE, ["fire", "blaze", "burning"]),
        (ReportType.ROAD_BLOCKED, ["road blocked", "bridge down", "highway"]),
        (ReportType.MEDICAL_EMERGENCY, ["injured", "hospital", "medical", "bleeding"]),
        (ReportType.RESOURCE_NEED, ["need food", "need water", "supplies", "relief"]),
        (ReportType.POWER_OUTAGE, ["power out", "no electricity", "blackout"]),
        (ReportType.WATER_CONTAMINATION, ["water contaminate", "dirty water", "smell"]),
    ]
    for report_type, keywords in mapping:
        if any(kw in lower for kw in keywords):
            return report_type
    return ReportType.OTHER


def _compute_fingerprint(
    latitude: float,
    longitude: float,
    report_type: str,
    text: str,
) -> str:
    """
    Deterministic hash for near-duplicate detection.
    Rounds coords to ~100 m precision for spatial grouping.
    """
    canonical = (
        f"{round(latitude, 3)}"
        f"|{round(longitude, 3)}"
        f"|{report_type}"
        f"|{re.sub(r'[^a-z0-9]', '', text.lower()[:80])}"
    )
    return hashlib.sha256(canonical.encode()).hexdigest()[:16]


@dataclass
class CitizenReport:
    """
    Normalised crowdsourced disaster field report.
    """

    report_id: str
    channel: ReportChannel
    report_type: ReportType
    urgency: UrgencyLevel
    latitude: float
    longitude: float
    description: str
    reporter_name: Optional[str] = None
    reporter_contact: Optional[str] = None
    region: str = "unknown"
    landmark: Optional[str] = None
    image_urls: List[str] = field(default_factory=list)
    video_urls: List[str] = field(default_factory=list)
    status: ReportStatus = ReportStatus.PENDING
    credibility_score: float = 0.5        # 0.0 – 1.0
    duplicate_fingerprint: str = ""
    verified_by: Optional[str] = None
    reported_at: str = field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat()
    )
    ingested_at: str = field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat()
    )
    raw: Optional[Dict[str, Any]] = field(default=None, repr=False)

    def to_dict(self) -> Dict[str, Any]:
        d = asdict(self)
        d["channel"] = self.channel.value
        d["report_type"] = self.report_type.value
        d["urgency"] = self.urgency.value
        d["status"] = self.status.value
        return d


def _compute_credibility(payload: Dict[str, Any]) -> float:
    """
    Heuristic credibility scoring (0.0 – 1.0).

    Higher scores for: verified app user, geo-tagged, has media,
    named reporter, and description length.
    """
    score = 0.5   # Base
    if payload.get("channel") == ReportChannel.MOBILE_APP.value:
        score += 0.15   # App users are often registered / KYC
    if payload.get("reporter_name"):
        score += 0.05
    if payload.get("image_urls") or payload.get("images"):
        score += 0.15
    if payload.get("video_urls"):
        score += 0.10
    desc = payload.get("description", "")
    if len(desc) >= 80:
        score += 0.05
    # Geo precision: if lat/lon supplied by GPS (not typed), boost
    if payload.get("gps_source") == "gps":
        score += 0.05
    return min(score, 1.0)


class CitizenReportIngester:
    """
    Ingest, triage, and normalise citizen disaster reports from multiple channels.

    Example::

        ingester = CitizenReportIngester()
        report = ingester.ingest({
            "channel": "mobile_app",
            "latitude": 26.14,
            "longitude": 91.72,
            "description": "Large area flooded, 50 families trapped on rooftops.",
            "image_urls": ["https://cdn.example.com/img/abc.jpg"],
            "reporter_name": "Amit Das",
        })
    """

    def __init__(self, auto_classify: bool = True):
        self.auto_classify = auto_classify
        self._reports: Dict[str, CitizenReport] = {}
        self._fingerprints: Dict[str, str] = {}  # fingerprint -> report_id

    # ------------------------------------------------------------------
    # Ingestion
    # ------------------------------------------------------------------

    def ingest(self, payload: Dict[str, Any]) -> CitizenReport:
        """
        Parse and normalise a raw submission payload into a ``CitizenReport``.

        Auto-classifies report type and urgency from description text
        when ``auto_classify=True`` and explicit types are not provided.
        """
        import uuid

        raw_channel = payload.get("channel", "unknown")
        try:
            channel = ReportChannel(raw_channel)
        except ValueError:
            channel = ReportChannel.UNKNOWN

        description = payload.get("description", "").strip()
        lat = float(payload.get("latitude", 0.0))
        lon = float(payload.get("longitude", 0.0))

        # Report type classification
        raw_type = payload.get("report_type")
        if raw_type:
            try:
                report_type = ReportType(raw_type)
            except ValueError:
                report_type = ReportType.OTHER
        elif self.auto_classify:
            report_type = _classify_type(description)
        else:
            report_type = ReportType.OTHER

        # Urgency classification
        raw_urgency = payload.get("urgency")
        if raw_urgency:
            try:
                urgency = UrgencyLevel(raw_urgency)
            except ValueError:
                urgency = UrgencyLevel.MEDIUM
        elif self.auto_classify:
            urgency = _classify_urgency(description)
        else:
            urgency = UrgencyLevel.MEDIUM

        credibility = _compute_credibility(payload)
        fingerprint = _compute_fingerprint(lat, lon, report_type.value, description)

        # Duplicate detection
        status = ReportStatus.PENDING
        if fingerprint in self._fingerprints:
            status = ReportStatus.DUPLICATE
            logger.info(
                "Duplicate report detected (fingerprint=%s) — original: %s",
                fingerprint,
                self._fingerprints[fingerprint],
            )

        report_id = payload.get("report_id") or f"CR-{uuid.uuid4().hex[:8].upper()}"

        report = CitizenReport(
            report_id=report_id,
            channel=channel,
            report_type=report_type,
            urgency=urgency,
            latitude=lat,
            longitude=lon,
            description=description,
            reporter_name=payload.get("reporter_name"),
            reporter_contact=payload.get("reporter_contact"),
            region=payload.get("region", "unknown"),
            landmark=payload.get("landmark"),
            image_urls=payload.get("image_urls", []),
            video_urls=payload.get("video_urls", []),
            status=status,
            credibility_score=credibility,
            duplicate_fingerprint=fingerprint,
            reported_at=payload.get(
                "reported_at",
                datetime.now(timezone.utc).isoformat(),
            ),
            raw=payload,
        )

        self._reports[report_id] = report
        if status != ReportStatus.DUPLICATE:
            self._fingerprints[fingerprint] = report_id

        if urgency == UrgencyLevel.LIFE_THREATENING:
            logger.warning(
                "LIFE-THREATENING report ingested: %s @ (%.4f, %.4f) — %s",
                report_id, lat, lon, description[:80],
            )

        return report

    def ingest_batch(self, payloads: List[Dict[str, Any]]) -> List[CitizenReport]:
        return [self.ingest(p) for p in payloads]

    # ------------------------------------------------------------------
    # Verification
    # ------------------------------------------------------------------

    def verify(self, report_id: str, verified_by: str) -> bool:
        r = self._reports.get(report_id)
        if r:
            r.status = ReportStatus.VERIFIED
            r.verified_by = verified_by
            return True
        return False

    def reject(self, report_id: str) -> bool:
        r = self._reports.get(report_id)
        if r:
            r.status = ReportStatus.REJECTED
            return True
        return False

    # ------------------------------------------------------------------
    # Queries
    # ------------------------------------------------------------------

    def get_pending(self) -> List[CitizenReport]:
        return [r for r in self._reports.values() if r.status == ReportStatus.PENDING]

    def get_critical(self) -> List[CitizenReport]:
        return [
            r for r in self._reports.values()
            if r.urgency == UrgencyLevel.LIFE_THREATENING
               and r.status in (ReportStatus.PENDING, ReportStatus.VERIFIED)
        ]

    def get_by_region(self, region: str) -> List[CitizenReport]:
        return [r for r in self._reports.values() if r.region == region]

    def total_reports(self) -> int:
        return len(self._reports)
