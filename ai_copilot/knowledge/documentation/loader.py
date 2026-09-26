from typing import List, Dict, Any

class DocLoader:
    def load_all_docs(self) -> List[Dict[str, Any]]:
        return [
            {"title": "Platform User Guide", "content": "How to operate AI Copilot in Emergency Operations Center."},
            {"title": "Sensor Calibration Specs", "content": "Thresholds for pore pressure, seismograph and rain gauge alarms."}
        ]
