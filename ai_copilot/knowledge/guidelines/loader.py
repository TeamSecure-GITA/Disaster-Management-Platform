from typing import List, Dict, Any

class GuidelinesLoader:
    def load_guidelines(self) -> List[Dict[str, Any]]:
        return [
            {"id": "NDMA-01", "name": "National Evacuation Protocol", "min_clearance_hours": 4},
            {"id": "NDMA-02", "name": "Community Relief Shelter Health & Sanitization", "capacity_buffer": 0.20}
        ]
