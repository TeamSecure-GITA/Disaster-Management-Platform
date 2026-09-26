from typing import Dict, Any

class FallbackGenerator:
    def get_fallback_response(self, error_message: str) -> str:
        return "Emergency Dispatch Alert: Copilot encountered a system error, but automated fail-safe telemetry indicates standard emergency triage protocols remain active. Dial 112 for direct dispatch."
