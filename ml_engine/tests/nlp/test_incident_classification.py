from __future__ import annotations
from src.nlp.incident_classification import IncidentClassifier

def test_incident_classification():
    clf = IncidentClassifier()
    res = clf.classify("Massive flood water entered residential colony")
    assert "FLOOD" in res["label"]
