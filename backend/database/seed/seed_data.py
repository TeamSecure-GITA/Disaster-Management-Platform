"""
Canonical seed data for Disaster Management Platform (backend layer).
Populates base administrative users, telemetry sensor stations, designated emergency shelters,
critical relief stockpiles, and official responder units.
"""

from __future__ import annotations

import hashlib
import logging
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from sqlalchemy.orm import Session

try:
    from backend.database import get_db_session, init_db
    from backend.database.models import (
        AuditAction,
        AuditLog,
        AuditStatus,
        ReadingAlertLevel,
        Resource,
        ResourceStatus,
        ResourceType,
        Responder,
        ResponderStatus,
        Sensor,
        SensorReading,
        SensorStatus,
        SensorType,
        Shelter,
        ShelterStatus,
        User,
        UserRole,
    )
except ImportError:
    from ml_backend.database import get_db_session, init_db
    from ml_backend.database.models import (
        AuditAction,
        AuditLog,
        AuditStatus,
        ReadingAlertLevel,
        Resource,
        ResourceStatus,
        ResourceType,
        Responder,
        ResponderStatus,
        Sensor,
        SensorReading,
        SensorStatus,
        SensorType,
        Shelter,
        ShelterStatus,
        User,
        UserRole,
    )

logger = logging.getLogger(__name__)


def hash_password(password: str) -> str:
    """Create deterministic SHA-256 hashed password with salt for seed data."""
    salt = "disaster_mgmt_salt_2026"
    return hashlib.sha256(f"{salt}_{password}".encode("utf-8")).hexdigest()


def get_canonical_users() -> List[Dict[str, Any]]:
    """Base administrative, responder, and volunteer accounts."""
    return [
        {
            "id": "usr-admin-0000-0000-000000000001",
            "name": "State Disaster Operations Center Admin",
            "email": "admin@disaster.gov.in",
            "phone": "+91-9876543210",
            "hashed_password": hash_password("Admin@Disaster2026!"),
            "role": UserRole.ADMIN,
            "address": "SDMA Control Room, Secretariat Complex",
            "city": "Dispur",
            "district": "Kamrup Metropolitan",
            "state": "Assam",
            "pincode": "781006",
            "latitude": 26.1445,
            "longitude": 91.7362,
            "is_active": True,
            "is_verified": True,
        },
        {
            "id": "usr-operator-0000-0000-000000000002",
            "name": "Senior Incident Dispatcher",
            "email": "operator@disaster.gov.in",
            "phone": "+91-9876543211",
            "hashed_password": hash_password("Operator@Disaster2026!"),
            "role": UserRole.OPERATOR,
            "address": "Emergency Operations Center, Floor 2",
            "city": "Guwahati",
            "district": "Kamrup Metropolitan",
            "state": "Assam",
            "pincode": "781005",
            "latitude": 26.1856,
            "longitude": 91.7478,
            "is_active": True,
            "is_verified": True,
        },
        {
            "id": "usr-responder-0000-0000-000000000003",
            "name": "Commander Rajesh Sharma (NDRF)",
            "email": "commander.rajesh@ndrf.gov.in",
            "phone": "+91-9876543212",
            "hashed_password": hash_password("Ndrf@Secure2026!"),
            "role": UserRole.RESPONDER,
            "address": "1st Battalion NDRF Base, Patgaon",
            "city": "Guwahati",
            "district": "Kamrup Metropolitan",
            "state": "Assam",
            "pincode": "781017",
            "latitude": 26.1205,
            "longitude": 91.6015,
            "is_active": True,
            "is_verified": True,
        },
        {
            "id": "usr-responder-0000-0000-000000000004",
            "name": "Inspector Sunita Roy (SDRF)",
            "email": "sunita.sdrf@assam.gov.in",
            "phone": "+91-9876543213",
            "hashed_password": hash_password("Sdrf@Secure2026!"),
            "role": UserRole.RESPONDER,
            "address": "SDRF Regional Hub, Silchar",
            "city": "Silchar",
            "district": "Cachar",
            "state": "Assam",
            "pincode": "788001",
            "latitude": 24.8333,
            "longitude": 92.7789,
            "is_active": True,
            "is_verified": True,
        },
        {
            "id": "usr-volunteer-0000-0000-000000000005",
            "name": "Arun Barman (Aapda Mitra)",
            "email": "arun.volunteer@disaster.org",
            "phone": "+91-9876543214",
            "hashed_password": hash_password("Volunteer@2026!"),
            "role": UserRole.VOLUNTEER,
            "address": "Barpeta Town Road",
            "city": "Barpeta",
            "district": "Barpeta",
            "state": "Assam",
            "pincode": "781301",
            "latitude": 26.3200,
            "longitude": 91.0050,
            "is_active": True,
            "is_verified": True,
        },
    ]


def get_canonical_sensors() -> List[Dict[str, Any]]:
    """Base environmental IoT monitoring and hydrological telemetry stations."""
    now = datetime.now(timezone.utc)
    return [
        {
            "id": "snr-brahmaputra-guwahati-001",
            "device_id": "IOT-WL-AS-001",
            "name": "Brahmaputra River Gauge Station - Saraighat",
            "type": SensorType.WATER_LEVEL,
            "latitude": 26.1287,
            "longitude": 91.6811,
            "altitude": 54.0,
            "station_code": "AS-GHY-WL01",
            "basin_or_region": "Brahmaputra Basin",
            "district": "Kamrup Metropolitan",
            "state": "Assam",
            "status": SensorStatus.ONLINE,
            "unit": "meters",
            "warning_threshold": 49.68,
            "critical_threshold": 50.50,
            "last_reading_value": 48.20,
            "last_reading_time": now,
            "battery_level": 94.0,
            "device_metadata": {
                "sensor_model": "OTT RLS Radar Level Sensor",
                "telemetry_protocol": "LoRaWAN / 4G Fallback",
                "sampling_interval_minutes": 15,
            },
        },
        {
            "id": "snr-cherrapunji-rainfall-002",
            "device_id": "IOT-RF-ML-002",
            "name": "Sohra Telemetry Rain Gauge",
            "type": SensorType.RAINFALL,
            "latitude": 25.2986,
            "longitude": 91.7301,
            "altitude": 1430.0,
            "station_code": "ML-SHR-RF01",
            "basin_or_region": "Meghalaya Plateau",
            "district": "East Khasi Hills",
            "state": "Meghalaya",
            "status": SensorStatus.ONLINE,
            "unit": "mm/hr",
            "warning_threshold": 35.0,
            "critical_threshold": 65.0,
            "last_reading_value": 18.5,
            "last_reading_time": now,
            "battery_level": 98.0,
            "device_metadata": {
                "sensor_model": "Tipping Bucket Rain Gauge TB4",
                "telemetry_protocol": "4G MQTT",
            },
        },
        {
            "id": "snr-gangtok-slope-003",
            "device_id": "IOT-SM-SK-003",
            "name": "Gangtok Hill Slope Extensometer & Moisture",
            "type": SensorType.SOIL_MOISTURE,
            "latitude": 27.3389,
            "longitude": 88.6065,
            "altitude": 1650.0,
            "station_code": "SK-GTK-SL01",
            "basin_or_region": "Teesta River Valley",
            "district": "East Sikkim",
            "state": "Sikkim",
            "status": SensorStatus.ONLINE,
            "unit": "% volumetric",
            "warning_threshold": 75.0,
            "critical_threshold": 88.0,
            "last_reading_value": 62.4,
            "last_reading_time": now,
            "battery_level": 89.0,
            "device_metadata": {
                "sensor_model": "Decagon 5TM TDR Soil Probe",
                "telemetry_protocol": "Satellite Iridium",
            },
        },
        {
            "id": "snr-majuli-flood-004",
            "device_id": "IOT-WL-AS-004",
            "name": "Majuli River Island Inundation Station",
            "type": SensorType.WATER_LEVEL,
            "latitude": 26.9634,
            "longitude": 94.2185,
            "altitude": 85.0,
            "station_code": "AS-MAJ-WL02",
            "basin_or_region": "Upper Brahmaputra",
            "district": "Majuli",
            "state": "Assam",
            "status": SensorStatus.ONLINE,
            "unit": "meters",
            "warning_threshold": 86.5,
            "critical_threshold": 87.3,
            "last_reading_value": 85.1,
            "last_reading_time": now,
            "battery_level": 91.0,
            "device_metadata": {
                "sensor_model": "Aanderaa Submersible Pressure Transmitter",
                "telemetry_protocol": "LoRaWAN",
            },
        },
    ]


def get_canonical_shelters() -> List[Dict[str, Any]]:
    """Designated disaster evacuation shelters and relief centers."""
    return [
        {
            "id": "shl-sarusajai-guwahati-001",
            "name": "Sarusajai Multipurpose Indoor Stadium Relief Camp",
            "address": "National Highway 37, Sarusajai Sports Complex",
            "city": "Guwahati",
            "district": "Kamrup Metropolitan",
            "state": "Assam",
            "pincode": "781040",
            "latitude": 26.1158,
            "longitude": 91.7582,
            "capacity": 2500,
            "current_occupancy": 0,
            "contact_person": "Dr. Prabal Das (Camp Officer)",
            "contact_number": "+91-361-2299100",
            "status": ShelterStatus.ACTIVE,
            "facilities": ["Drinking Water", "Sanitation Blocks", "Emergency Kitchen", "Backup Generator", "Medical Post"],
            "supplies_status": {
                "food_kits_days_remaining": 14,
                "clean_water_liters": 25000,
                "first_aid_kits": 50,
                "blankets": 3000,
            },
            "is_accessible": True,
            "pet_friendly": True,
            "medical_facility_available": True,
            "notes": "Primary category-1 regional mass evacuation hub.",
        },
        {
            "id": "shl-gangtok-community-002",
            "name": "TNA Community Hall Cyclone & Landslide Refuge",
            "address": "Development Area, Near Paljor Stadium",
            "city": "Gangtok",
            "district": "East Sikkim",
            "state": "Sikkim",
            "pincode": "737101",
            "latitude": 27.3325,
            "longitude": 88.6142,
            "capacity": 600,
            "current_occupancy": 0,
            "contact_person": "Karma Bhutia (Executive Magistrate)",
            "contact_number": "+91-3592-202300",
            "status": ShelterStatus.ACTIVE,
            "facilities": ["Heated Dormitories", "Solar Lighting", "Emergency Rations", "Infirmary"],
            "supplies_status": {
                "food_kits_days_remaining": 21,
                "clean_water_liters": 8000,
                "thermal_blankets": 800,
            },
            "is_accessible": True,
            "pet_friendly": False,
            "medical_facility_available": True,
            "notes": "Reinforced structural concrete shelter safe from high-grade landslides.",
        },
        {
            "id": "shl-shillong-state-hall-003",
            "name": "State Central Library Evacuation Facility",
            "address": "Secretariat Hills, IGP Point",
            "city": "Shillong",
            "district": "East Khasi Hills",
            "state": "Meghalaya",
            "pincode": "793001",
            "latitude": 25.5760,
            "longitude": 91.8825,
            "capacity": 1200,
            "current_occupancy": 0,
            "contact_person": "P. Lyngdoh (Disaster Manager)",
            "contact_number": "+91-364-2224150",
            "status": ShelterStatus.ACTIVE,
            "facilities": ["Potable Water", "High-Speed Wi-Fi", "Community Kitchen", "Baby Care Station"],
            "supplies_status": {
                "food_kits_days_remaining": 10,
                "clean_water_liters": 15000,
                "cots_available": 1000,
            },
            "is_accessible": True,
            "pet_friendly": True,
            "medical_facility_available": True,
            "notes": "Central Shillong safe assembly ground.",
        },
    ]


def get_canonical_resources() -> List[Dict[str, Any]]:
    """Emergency logistics stockpiles, rescue craft, medical supplies, and food."""
    return [
        {
            "id": "res-boat-ndrf-001",
            "name": "Inflatable Motorized Rescue Boats (Zodiac Gemini)",
            "type": ResourceType.VEHICLE,
            "description": "Heavy-duty 10-person swift water flood rescue craft with 40HP outboards",
            "quantity": 18.0,
            "unit": "boats",
            "min_threshold": 4.0,
            "depot_name": "NDRF Battalion Central Depot",
            "latitude": 26.1205,
            "longitude": 91.6015,
            "district": "Kamrup Metropolitan",
            "state": "Assam",
            "status": ResourceStatus.AVAILABLE,
            "supplier_info": {"manufacturer": "Zodiac Milpro", "last_inspected": "2026-08-15"},
        },
        {
            "id": "res-water-purifier-002",
            "name": "RO Water Purification Mobile Skids",
            "type": ResourceType.WATER,
            "description": "5000 liters/hour trailer-mounted rapid water treatment units",
            "quantity": 8.0,
            "unit": "mobile units",
            "min_threshold": 2.0,
            "depot_name": "Public Health Engineering Department Yard",
            "latitude": 26.1750,
            "longitude": 91.7820,
            "district": "Kamrup Metropolitan",
            "state": "Assam",
            "status": ResourceStatus.AVAILABLE,
            "supplier_info": {"capacity_lph": 5000, "chlorine_dosing": True},
        },
        {
            "id": "res-trauma-meds-003",
            "name": "Emergency Medical Trauma & Anti-Venom Kits",
            "type": ResourceType.MEDICINE,
            "description": "Level-3 disaster trauma packs, polyvalent snake anti-venom, IV fluids",
            "quantity": 450.0,
            "unit": "trauma packs",
            "min_threshold": 100.0,
            "depot_name": "Guwahati Medical College Disaster Warehouse",
            "latitude": 26.1550,
            "longitude": 91.7700,
            "district": "Kamrup Metropolitan",
            "state": "Assam",
            "status": ResourceStatus.AVAILABLE,
            "supplier_info": {"distributor": "Assam Medical Services Corp", "cold_chain": True},
        },
        {
            "id": "res-food-rations-004",
            "name": "Ready-to-Eat Emergency Relief Food Rations (7-Day)",
            "type": ResourceType.FOOD,
            "description": "High-calorie shelf-stable nutritional food kits (3 meals/day for family of 4)",
            "quantity": 12500.0,
            "unit": "family ration packs",
            "min_threshold": 2000.0,
            "depot_name": "FCI Regional Granary Complex",
            "latitude": 26.1300,
            "longitude": 91.7100,
            "district": "Kamrup Metropolitan",
            "state": "Assam",
            "status": ResourceStatus.AVAILABLE,
            "supplier_info": {"packaging": "Vacuum Sealed MRE", "shelf_life_months": 24},
        },
        {
            "id": "res-generators-005",
            "name": "Diesel Generator Mobile Towers (65 kVA)",
            "type": ResourceType.GENERATOR,
            "description": "Soundproof diesel power generators with integral LED floodlights",
            "quantity": 25.0,
            "unit": "generators",
            "min_threshold": 5.0,
            "depot_name": "State Electricity Board Emergency Depot",
            "latitude": 26.1400,
            "longitude": 91.7500,
            "district": "Kamrup Metropolitan",
            "state": "Assam",
            "status": ResourceStatus.AVAILABLE,
            "supplier_info": {"fuel_capacity_liters": 180, "run_time_full_load_hours": 14},
        },
    ]


def get_canonical_responders() -> List[Dict[str, Any]]:
    """Official responder units linked to user accounts."""
    return [
        {
            "id": "rsp-rajesh-ndrf-001",
            "user_id": "usr-responder-0000-0000-000000000003",
            "badge_number": "NDRF-1BN-042",
            "organization": "National Disaster Response Force (NDRF)",
            "team_name": "Alpha Quick Reaction Team",
            "designation": "Battalion Commander",
            "availability_status": ResponderStatus.AVAILABLE,
            "latitude": 26.1205,
            "longitude": 91.6015,
            "service_radius_km": 150.0,
            "specializations": ["swift_water_rescue", "collapsed_structure_search", "incident_command"],
            "certifications": ["INSARAG Heavy Team Lead", "Swiftwater Technician III", "HAZMAT Ops"],
            "has_emergency_training": True,
            "blood_group": "O+",
            "emergency_contact": "+91-9876543299",
            "vehicle_identifier": "NDRF-AS-QRT-01",
        },
        {
            "id": "rsp-sunita-sdrf-002",
            "user_id": "usr-responder-0000-0000-000000000004",
            "badge_number": "SDRF-AS-219",
            "organization": "State Disaster Response Force (SDRF)",
            "team_name": "Bravo Riverine Squad",
            "designation": "Rescue Inspector",
            "availability_status": ResponderStatus.AVAILABLE,
            "latitude": 24.8333,
            "longitude": 92.7789,
            "service_radius_km": 100.0,
            "specializations": ["flood_evacuation", "diver_level_2", "first_aid"],
            "certifications": ["National Diver License", "Tactical Emergency Casualty Care"],
            "has_emergency_training": True,
            "blood_group": "B+",
            "emergency_contact": "+91-9876543298",
            "vehicle_identifier": "SDRF-AS-BOAT-04",
        },
    ]


def seed_canonical_data(session: Optional[Session] = None, reset: bool = False) -> Dict[str, int]:
    """
    Populate database with baseline administrative, IoT, shelter, and resource data.
    Idempotent: skips existing records by primary key.
    """
    if reset:
        init_db(drop_first=True)
    else:
        init_db(drop_first=False)

    counts = {"users": 0, "sensors": 0, "shelters": 0, "resources": 0, "responders": 0}

    def _execute(s: Session) -> Dict[str, int]:
        for user_data in get_canonical_users():
            if not s.get(User, user_data["id"]):
                user = User(**user_data)
                s.add(user)
                counts["users"] += 1
        s.flush()

        for rsp_data in get_canonical_responders():
            if not s.get(Responder, rsp_data["id"]):
                rsp = Responder(**rsp_data)
                s.add(rsp)
                counts["responders"] += 1
        s.flush()

        for snr_data in get_canonical_sensors():
            if not s.get(Sensor, snr_data["id"]):
                snr = Sensor(**snr_data)
                s.add(snr)
                counts["sensors"] += 1
        s.flush()

        for shl_data in get_canonical_shelters():
            if not s.get(Shelter, shl_data["id"]):
                shl = Shelter(**shl_data)
                s.add(shl)
                counts["shelters"] += 1
        s.flush()

        for res_data in get_canonical_resources():
            if not s.get(Resource, res_data["id"]):
                res = Resource(**res_data)
                s.add(res)
                counts["resources"] += 1
        s.flush()

        audit = AuditLog(
            action=AuditAction.SYSTEM_JOB,
            entity_type="system",
            entity_id="seed_canonical_data",
            new_values=counts,
            status=AuditStatus.SUCCESS,
        )
        s.add(audit)
        s.commit()
        return counts

    if session:
        return _execute(session)
    else:
        with get_db_session() as s:
            return _execute(s)


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    logger.info("Seeding backend canonical disaster platform database...")
    results = seed_canonical_data()
    logger.info(f"Seeding completed successfully: {results}")
