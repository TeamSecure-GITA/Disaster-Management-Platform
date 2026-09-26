from __future__ import annotations
from src.nlp.citizen_report import CitizenReportClassifier, ReportSeverityEstimator

def test_citizen_report():
    clf = CitizenReportClassifier()
    res = clf.classify("Building collapsed with people trapped")
    assert res["is_emergency"] is True
    sev = ReportSeverityEstimator()
    assert sev.estimate_severity("Critical casualties reported") == "CRITICAL"
