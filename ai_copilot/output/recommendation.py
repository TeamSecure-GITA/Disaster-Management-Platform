from typing import List
from schemas.output import ActionItem

class RecommendationBuilder:
    def build_recommendations(self, actions: List[str]) -> List[ActionItem]:
        items = []
        for i, a in enumerate(actions):
            items.append(ActionItem(
                action_id=f"ACT-{i+1}",
                title=f"Emergency Directive {i+1}",
                description=a,
                urgency="immediate" if "evacuate" in a.lower() else "high"
            ))
        return items
