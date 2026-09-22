import pytest
from app.analytics.historical.incidents import HistoricalIncidentAnalyzer
from app.analytics.historical.hazards import HistoricalHazardAnalyzer

def test_historical_incident_analyzer():
    analyzer = HistoricalIncidentAnalyzer()
    stats = analyzer.compute_statistics()
    assert stats is not None

def test_historical_hazard_analyzer():
    analyzer = HistoricalHazardAnalyzer()
    summary = analyzer.summarize_all()
    assert summary is not None
