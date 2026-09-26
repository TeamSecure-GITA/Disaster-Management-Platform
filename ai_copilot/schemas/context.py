from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

from .input import GeoPoint


class UserRole(str, Enum):
    CITIZEN = "citizen"
    FIRST_RESPONDER = "first_responder"
    INCIDENT_COMMANDER = "incident_commander"
    GOVERNMENT_OFFICIAL = "government_official"
    ANALYST = "analyst"


class UserContext(BaseModel):
    user_id: str = "anonymous"
    role: UserRole = UserRole.INCIDENT_COMMANDER
    name: Optional[str] = None
    agency: Optional[str] = "Disaster Management Authority"
    permissions: List[str] = Field(default_factory=lambda: ["read", "query", "dispatch_request"])


class LocationContext(BaseModel):
    current_location: Optional[GeoPoint] = None
    jurisdiction: Optional[str] = "Metro Emergency Operations Center"
    affected_zones: List[str] = Field(default_factory=list)
    nearest_shelter_id: Optional[str] = None

    @property
    def latitude(self) -> Optional[float]:
        return self.current_location.latitude if self.current_location else None

    @property
    def longitude(self) -> Optional[float]:
        return self.current_location.longitude if self.current_location else None


class IncidentContext(BaseModel):
    active_incident_id: Optional[str] = None
    incident_type: Optional[str] = None
    severity: Optional[str] = "moderate"
    status: Optional[str] = "active"
    reported_casualties: int = 0
    assigned_units_count: int = 0


class DisasterContext(BaseModel):
    disaster_type: Optional[str] = "flood"
    warning_level: str = "alert"
    weather_condition: Optional[str] = "heavy_rain"
    is_declared_state_of_emergency: bool = False

    @property
    def hazard_type(self) -> Optional[str]:
        return self.disaster_type

    @hazard_type.setter
    def hazard_type(self, value: Optional[str]):
        self.disaster_type = value


class ConversationTurn(BaseModel):
    role: str
    content: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    intent: Optional[str] = None
    tool_calls: List[str] = Field(default_factory=list)


class UnifiedContext(BaseModel):
    session_id: str
    user: UserContext = Field(default_factory=UserContext)
    location: LocationContext = Field(default_factory=LocationContext)
    incident: IncidentContext = Field(default_factory=IncidentContext)
    disaster: DisasterContext = Field(default_factory=DisasterContext)
    history: List[ConversationTurn] = Field(default_factory=list)
    metadata: Dict[str, Any] = Field(default_factory=dict)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
