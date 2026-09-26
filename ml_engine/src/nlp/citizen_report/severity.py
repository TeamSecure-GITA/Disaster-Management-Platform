from __future__ import annotations

class ReportSeverityEstimator:
    def estimate_severity(self, text: str) -> str:
        low = text.lower()
        if any(w in low for w in ["fatal", "critical", "collapsed", "submerged", "dying"]):
            return "CRITICAL"
        elif any(w in low for w in ["injured", "rising", "trapped", "smoke"]):
            return "HIGH"
        return "MODERATE"
