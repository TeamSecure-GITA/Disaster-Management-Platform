from __future__ import annotations
from .model import CitizenReportModel

class CitizenReportClassifier:
    def __init__(self) -> None:
        self.model = CitizenReportModel()
    def classify(self, report: str) -> dict:
        return self.model.analyze_report(report)
