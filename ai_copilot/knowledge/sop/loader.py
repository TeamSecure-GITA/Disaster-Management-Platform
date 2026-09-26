from typing import List, Dict, Any

DEFAULT_SOPS = [
    {
        "id": "SOP-FLD-01",
        "title": "Flash Flood Inundation & Dam Overspill Response",
        "hazard": "flood",
        "procedures": "1. Verify hydrological sensor telemetry at primary river gauges. 2. Sound Level-3 acoustic sirens. 3. Establish upstream bypass barrier. 4. Evacuate low-lying riverbank sectors."
    },
    {
        "id": "SOP-LND-02",
        "title": "Slope Failure & Landslide Debris Flow Mitigation",
        "hazard": "landslide",
        "procedures": "1. Close arterial mountain highways. 2. Dispatch geological survey drone. 3. Triage uphill residents to pre-designated rock-stabilized shelters."
    }
]

class SOPLoader:
    def load(self) -> List[Dict[str, Any]]:
        return list(DEFAULT_SOPS)
