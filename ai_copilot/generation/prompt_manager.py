from typing import Dict, Any

class PromptManager:
    def __init__(self):
        self.templates = {
            "disaster_copilot": "You are a crisis decision support assistant for disaster management.",
            "emergency_synthesis": "Synthesize verified emergency facts and provide life-critical actions."
        }

    def format_prompt(self, template_name: str, **kwargs) -> str:
        tpl = self.templates.get(template_name, self.templates["disaster_copilot"])
        return tpl
