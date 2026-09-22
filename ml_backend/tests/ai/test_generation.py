import pytest
from app.ai.generation.situation_brief import SituationBriefGenerator
from app.ai.generation.incident_report import IncidentReportGenerator

def test_situation_brief_generator():
    gen = SituationBriefGenerator()
    brief = gen.generate(headline="Flash Flood Warning", affected_areas=["Sector 1"])
    assert brief.headline == "Flash Flood Warning"
    assert len(brief.situation) > 0

def test_incident_report_generator():
    gen = IncidentReportGenerator()
    rep = gen.generate(incident_id="inc_99", incident_type="flood", severity=4)
    assert rep.incident_id == "inc_99"
    assert rep.severity == 4
