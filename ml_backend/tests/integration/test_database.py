import pytest
from database.models import Incident, IncidentSeverity, IncidentStatus, IncidentType

def test_database_models():
    inc = Incident(
        title='Flash Flood Test',
        incident_type=IncidentType.FLOOD,
        severity=IncidentSeverity.HIGH,
        latitude=19.07,
        longitude=72.87,
    )
    assert inc.title == 'Flash Flood Test'
    assert inc.severity == IncidentSeverity.HIGH
