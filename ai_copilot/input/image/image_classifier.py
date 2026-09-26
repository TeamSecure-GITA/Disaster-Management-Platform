from typing import Dict, Any, List

class ImageHazardClassifier:
    def classify_hazard(self, image_bytes: bytes) -> Dict[str, Any]:
        # Emergency CV classification mock
        return {
            "detected_hazards": [
                {"hazard": "flood_inundation", "confidence": 0.91, "bounding_box": [0.1, 0.2, 0.8, 0.9]},
                {"hazard": "infrastructure_damage", "confidence": 0.78, "bounding_box": [0.4, 0.5, 0.7, 0.8]}
            ],
            "estimated_severity": "high",
            "scene_description": "Submerged residential street with vehicle trapped and downed power lines."
        }
