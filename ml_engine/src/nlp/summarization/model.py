from __future__ import annotations

class SummarizationModel:
    def generate_summary(self, context: str) -> str:
        lines = [l.strip() for l in context.split('.') if l.strip()]
        return lines[0] + '.' if lines else "No incident context provided."
