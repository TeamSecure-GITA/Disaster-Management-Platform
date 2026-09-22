"""
Rich dynamic demo scenario data for live demonstrations, end-to-end testing, and UI validation (backend layer).
Creates an active multi-hazard emergency situation:
- Severe monsoon flash flooding in the Brahmaputra basin (Kamrup & Barpeta)
- Slope failure and landslide along the NH-10 highway corridor in Sikkim
- Live incident reports, sensor alarm triggers, AI predictions, emergency broadcasts, and responder deployments.
"""

from __future__ import annotations

import logging
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List, Optional

from sqlalchemy.orm import Session

try:
    from backend.database import get_db_session, init_db
    from backend.database.models import (
        Alert,
        AlertSeverity,
        AlertStatus,
        AlertType,
        AuditAction,
        AuditLog,
        AuditStatus,
        DisasterType,
        Incident,
        IncidentSeverity,
        IncidentStatus,
        IncidentType,
        Prediction,
        ReadingAlertLevel,
        Resource,
        ResourceStatus,
        Responder,
        ResponderStatus,
        RiskLevel,
        Sensor,
        SensorReading,
        SensorType,
        Shelter,
        User,
        utc_now,
    )
    from backend.database.seed.seed_data import seed_canonical_data
except ImportError:
    from ml_backend.database import get_db_session, init_db
    from ml_backend.database.models import (
        Alert,
        AlertSeverity,
        AlertStatus,
        AlertType,
        AuditAction,
        AuditLog,
        AuditStatus,
        DisasterType,
        Incident,
        IncidentSeverity,
        IncidentStatus,
        IncidentType,
        Prediction,
        ReadingAlertLevel,
        Resource,
        ResourceStatus,
        Responder,
        ResponderStatus,
        RiskLevel,
        Sensor,
        SensorReading,
        SensorType,
        Shelter,
        User,
        utc_now,
    )
    from ml_backend.database.seed.seed_data import seed_canonical_data

logger = logging.getLogger(__name__)


def seed_demo_scenario(session: Optional[Session] = None, reset: bool = False) -> Dict[str, Any]:
    """
    Populate a live realistic disaster response scenario.
    First ensures canonical seed entities exist, then inserts connected incidents,
    telemetry reading spikes, ML forecasts, emergency alerts, and responder dispatches.
    """
    if reset:
        init_db(drop_first=True)
        seed_canonical_data(reset=False)
    else:
        init_db(drop_first=False)
        seed_canonical_data(reset=False)

    now = utc_now()
    summary: Dict[str, int] = {
        "incidents": 0,
        "sensor_readings": 0,
        "predictions": 0,
        "alerts": 0,
        "dispatches": 0,
    }

    def _execute(s: Session) -> Dict[str, Any]:
        operator = s.query(User).filter(User.email == "operator@disaster.gov.in").first()
        volunteer = s.query(User).filter(User.email == "arun.volunteer@disaster.org").first()
        citizen = s.query(User).filter(User.email == "admin@disaster.gov.in").first()
        commander_ndrf = s.query(Responder).filter(Responder.badge_number == "NDRF-1BN-042").first()
        inspector_sdrf = s.query(Responder).filter(Responder.badge_number == "SDRF-AS-219").first()

        reporter_id = volunteer.id if volunteer else citizen.id
        verifier_id = operator.id if operator else citizen.id

        # 1. Incidents
        demo_incidents = [
            {
                "id": "inc-demo-landslide-nh10-001",
                "reported_by_id": reporter_id,
                "incident_type": IncidentType.LANDSLIDE_CRACK,
                "severity": IncidentSeverity.CRITICAL,
                "description": (
                    "Major fissure crack of 35cm detected across NH-10 near 29th Mile. "
                    "Slump movement of upper retaining wall observed following 48 hours of torrential rains. "
                    "All vehicular traffic completely halted."
                ),
                "latitude": 27.0850,
                "longitude": 88.4620,
                "address": "NH-10 Highway KM 29, Teesta River Bank",
                "district": "Kalimpong",
                "state": "Sikkim",
                "altitude": 720.0,
                "slope_angle": 58.0,
                "witness_count": 14,
                "is_road_blocked": True,
                "affected_villages": ["29th Mile", "Rongpo Outskirts", "Teesta Bazar"],
                "risk_score": 92.5,
                "media": [
                    {
                        "url": "https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80",
                        "resourceType": "image",
                        "caption": "Highway pavement fissure and mud slope slump",
                    }
                ],
                "status": IncidentStatus.ESCALATED,
                "verified_by_id": verifier_id,
                "verified_at": now - timedelta(hours=2),
                "remarks": "Priority 1 NDRF rescue detachment alerted. Heavy earth-moving machinery requested.",
            },
            {
                "id": "inc-demo-flood-anilnagar-002",
                "reported_by_id": reporter_id,
                "incident_type": IncidentType.FLOODING,
                "severity": IncidentSeverity.HIGH,
                "description": (
                    "Bharalu river overflow inundating residential colony. "
                    "Water level currently at 1.4 meters on main street and entering ground-floor dwellings. "
                    "Elderly residents trapped in 12 houses."
                ),
                "latitude": 26.1785,
                "longitude": 91.7765,
                "address": "Anil Nagar By-lane 3, Near Rajgarh Road",
                "district": "Kamrup Metropolitan",
                "state": "Assam",
                "altitude": 52.0,
                "slope_angle": 2.0,
                "witness_count": 28,
                "is_road_blocked": True,
                "affected_villages": ["Anil Nagar", "Nabin Nagar", "Lachit Nagar"],
                "risk_score": 84.0,
                "media": [
                    {
                        "url": "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80",
                        "resourceType": "image",
                        "caption": "Street submerged up to waist depth",
                    }
                ],
                "status": IncidentStatus.VERIFIED,
                "verified_by_id": verifier_id,
                "verified_at": now - timedelta(hours=1),
                "remarks": "Inflatable dinghy deployed for elderly evacuation.",
            },
            {
                "id": "inc-demo-bridge-barpeta-003",
                "reported_by_id": reporter_id,
                "incident_type": IncidentType.BRIDGE_DAMAGE,
                "severity": IncidentSeverity.CRITICAL,
                "description": (
                    "Timber and concrete bridge pillar scour on Beki river tributary. "
                    "Central span showing noticeable sagging. Danger of total collapse."
                ),
                "latitude": 26.3350,
                "longitude": 91.0120,
                "address": "Barpeta - Sarthebari Link Road",
                "district": "Barpeta",
                "state": "Assam",
                "altitude": 48.0,
                "slope_angle": 1.0,
                "witness_count": 8,
                "is_road_blocked": True,
                "affected_villages": ["Barpeta Town", "Sarthebari", "Chenga"],
                "risk_score": 88.0,
                "media": [],
                "status": IncidentStatus.VERIFIED,
                "verified_by_id": verifier_id,
                "verified_at": now - timedelta(minutes=45),
                "remarks": "Police barricades set up. Diversion routed via NH-27.",
            },
            {
                "id": "inc-demo-erosion-majuli-004",
                "reported_by_id": reporter_id,
                "incident_type": IncidentType.SOIL_EROSION,
                "severity": IncidentSeverity.MEDIUM,
                "description": (
                    "Rapid embankment bank cutting along southern shore of Majuli. "
                    "Over 15 meters of agrarian embankment eroded into river within 6 hours."
                ),
                "latitude": 26.9450,
                "longitude": 94.1950,
                "address": "Salmora Embankment Section 4",
                "district": "Majuli",
                "state": "Assam",
                "altitude": 84.0,
                "slope_angle": 8.0,
                "witness_count": 19,
                "is_road_blocked": False,
                "affected_villages": ["Salmora", "Kamalabari"],
                "risk_score": 67.0,
                "media": [],
                "status": IncidentStatus.PENDING,
                "remarks": "Awaiting satellite SAR verification pass.",
            },
        ]

        for inc_data in demo_incidents:
            if not s.get(Incident, inc_data["id"]):
                inc = Incident(**inc_data)
                s.add(inc)
                summary["incidents"] += 1
        s.flush()

        # 2. Sensor Telemetry Readings
        sensors = s.query(Sensor).all()
        for snr in sensors:
            for step in range(6):
                reading_time = now - timedelta(minutes=30 * (5 - step))
                if snr.type == SensorType.WATER_LEVEL:
                    val = (snr.warning_threshold or 49.0) + (step * 0.35)
                elif snr.type == SensorType.RAINFALL:
                    val = 25.0 + (step * 8.5)
                elif snr.type == SensorType.SOIL_MOISTURE:
                    val = 65.0 + (step * 4.2)
                else:
                    val = 28.0 + (step * 0.5)

                level = ReadingAlertLevel.NORMAL
                if snr.critical_threshold and val >= snr.critical_threshold:
                    level = ReadingAlertLevel.CRITICAL
                elif snr.warning_threshold and val >= snr.warning_threshold:
                    level = ReadingAlertLevel.WARNING

                reading = SensorReading(
                    sensor_id=snr.id,
                    value=round(val, 2),
                    raw_value=round(val, 2),
                    recorded_at=reading_time,
                    alert_level=level,
                    battery_percentage=92.0 - step,
                    signal_strength_rssi=-68 + step,
                )
                s.add(reading)
                summary["sensor_readings"] += 1

                if step == 5:
                    snr.last_reading_value = round(val, 2)
                    snr.last_reading_time = reading_time
                    s.add(snr)
        s.flush()

        # 3. AI/ML Predictions
        demo_predictions = [
            {
                "id": "prd-demo-flood-kamrup-001",
                "disaster_type": DisasterType.FLOOD,
                "model_name": "HydroGNN_Transformer_Ensemble",
                "model_version": "2.4.1",
                "latitude": 26.1850,
                "longitude": 91.7500,
                "district": "Kamrup Metropolitan",
                "state": "Assam",
                "risk_level": RiskLevel.CRITICAL,
                "probability": 0.94,
                "confidence": 0.89,
                "severity_index": 8.7,
                "predicted_at": now - timedelta(hours=3),
                "valid_until": now + timedelta(hours=24),
                "affected_population_estimate": 84500,
                "features_used": {
                    "upstream_river_discharge_cumecs": 48200,
                    "rainfall_72h_accumulated_mm": 218.4,
                    "soil_saturation_index": 0.92,
                    "river_elevation_above_danger_m": 1.25,
                },
                "spatial_extent_geojson": {
                    "type": "Polygon",
                    "coordinates": [
                        [
                            [91.65, 26.10],
                            [91.82, 26.10],
                            [91.82, 26.22],
                            [91.65, 26.22],
                            [91.65, 26.10],
                        ]
                    ],
                },
                "mitigation_recommendations": [
                    "Evacuate low-lying residents in Anil Nagar, Nabin Nagar, and Chandmari within 6 hours.",
                    "Pre-position 8 motorboats at Sarusajai hub.",
                    "Activate emergency pumps at Bharalu sluice gates.",
                ],
                "summary_text": "Extreme flood inundation forecast with 94% probability. Inundation depth expected between 1.2m and 2.1m.",
            },
            {
                "id": "prd-demo-landslide-sikkim-002",
                "disaster_type": DisasterType.LANDSLIDE,
                "model_name": "SlopeStability_XGB_Physics_Hybrid",
                "model_version": "1.8.0",
                "latitude": 27.2500,
                "longitude": 88.5500,
                "district": "East Sikkim",
                "state": "Sikkim",
                "risk_level": RiskLevel.HIGH,
                "probability": 0.82,
                "confidence": 0.86,
                "severity_index": 7.4,
                "predicted_at": now - timedelta(hours=2),
                "valid_until": now + timedelta(hours=18),
                "affected_population_estimate": 14200,
                "features_used": {
                    "antecedent_rainfall_index_ari": 148.0,
                    "slope_angle_degrees": 52.0,
                    "shear_strength_factor": 0.78,
                },
                "spatial_extent_geojson": {
                    "type": "Polygon",
                    "coordinates": [
                        [
                            [88.48, 27.18],
                            [88.62, 27.18],
                            [88.62, 27.32],
                            [88.48, 27.32],
                            [88.48, 27.18],
                        ]
                    ],
                },
                "mitigation_recommendations": [
                    "Close NH-10 corridor to non-essential civilian vehicles.",
                    "Issue immediate hillside advisory to Rangpo settlement.",
                ],
                "summary_text": "High landslide reactivation risk along Teesta fault line triggered by antecedent pore pressure.",
            },
        ]

        for prd_data in demo_predictions:
            if not s.get(Prediction, prd_data["id"]):
                prd = Prediction(**prd_data)
                s.add(prd)
                summary["predictions"] += 1
        s.flush()

        # 4. Emergency Public Warning Alerts
        demo_alerts = [
            {
                "id": "alt-demo-flood-red-001",
                "title": "RED ALERT: Catastrophic Flash Flood Evacuation Notice",
                "message": (
                    "URGENT: Flash flood alert issued for Kamrup Metropolitan district. "
                    "Brahmaputra river and tributaries overflowing. Evacuate immediately to designated relief shelters. "
                    "Emergency helpline: 1070 / 112."
                ),
                "type": AlertType.FLOOD,
                "severity": AlertSeverity.CRITICAL,
                "status": AlertStatus.ACTIVE,
                "latitude": 26.1445,
                "longitude": 91.7362,
                "radius_km": 40.0,
                "affected_districts": ["Kamrup Metropolitan", "Kamrup Rural", "Darrang"],
                "affected_state": "Assam",
                "channels": ["push", "sms", "siren", "whatsapp"],
                "broadcast_count": 184500,
                "acknowledgements_count": 42100,
                "issued_by_id": operator.id if operator else None,
                "issued_at": now - timedelta(hours=2),
                "expires_at": now + timedelta(hours=22),
            },
            {
                "id": "alt-demo-landslide-orange-002",
                "title": "ORANGE WARNING: Landslide Vulnerability Advisory - NH-10",
                "message": (
                    "Severe landslide hazard along NH-10 between Teesta Bazar and Rangpo. "
                    "Highway blocked at 29th Mile. Travelers instructed to halt at check posts."
                ),
                "type": AlertType.LANDSLIDE,
                "severity": AlertSeverity.HIGH,
                "status": AlertStatus.ACTIVE,
                "latitude": 27.1800,
                "longitude": 88.5200,
                "radius_km": 30.0,
                "affected_districts": ["East Sikkim", "Kalimpong"],
                "affected_state": "Sikkim",
                "channels": ["push", "sms"],
                "broadcast_count": 35200,
                "acknowledgements_count": 11800,
                "issued_by_id": operator.id if operator else None,
                "issued_at": now - timedelta(hours=1),
                "expires_at": now + timedelta(hours=12),
            },
        ]

        for alt_data in demo_alerts:
            if not s.get(Alert, alt_data["id"]):
                alt = Alert(**alt_data)
                s.add(alt)
                summary["alerts"] += 1
        s.flush()

        # 5. Shelter Occupancy Update
        shelter1 = s.query(Shelter).filter(Shelter.id == "shl-sarusajai-guwahati-001").first()
        if shelter1:
            shelter1.current_occupancy = 680
            s.add(shelter1)

        shelter2 = s.query(Shelter).filter(Shelter.id == "shl-gangtok-community-002").first()
        if shelter2:
            shelter2.current_occupancy = 210
            s.add(shelter2)

        # 6. Responder Mobilization
        if commander_ndrf:
            commander_ndrf.active_incident_id = "inc-demo-landslide-nh10-001"
            commander_ndrf.availability_status = ResponderStatus.DISPATCHED
            commander_ndrf.latitude = 27.0850
            commander_ndrf.longitude = 88.4620
            s.add(commander_ndrf)
            summary["dispatches"] += 1

        if inspector_sdrf:
            inspector_sdrf.active_incident_id = "inc-demo-flood-anilnagar-002"
            inspector_sdrf.availability_status = ResponderStatus.ON_SCENE
            inspector_sdrf.latitude = 26.1785
            inspector_sdrf.longitude = 91.7765
            s.add(inspector_sdrf)
            summary["dispatches"] += 1

        # Resource allocation
        boat_res = s.query(Resource).filter(Resource.id == "res-boat-ndrf-001").first()
        if boat_res:
            boat_res.quantity = 12.0
            boat_res.allocated_incident_id = "inc-demo-flood-anilnagar-002"
            s.add(boat_res)

        audit = AuditLog(
            action=AuditAction.SYSTEM_JOB,
            entity_type="system",
            entity_id="seed_demo_scenario",
            new_values=summary,
            status=AuditStatus.SUCCESS,
        )
        s.add(audit)
        s.commit()
        return summary

    if session:
        return _execute(session)
    else:
        with get_db_session() as s:
            return _execute(s)


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    logger.info("Injecting dynamic disaster demo scenario into backend database...")
    res = seed_demo_scenario()
    logger.info(f"Backend demo scenario injected successfully: {res}")
