from typing import Dict, Any

class AnswerFormatter:
    def format(self, narrative: str, bullet_points: list = None) -> str:
        res = narrative.strip()
        if bullet_points:
            res += "\n\nKey Action Items:\n" + "\n".join(f"- {b}" for b in bullet_points)
        return res
