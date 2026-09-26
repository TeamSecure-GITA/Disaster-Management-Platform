from typing import List, Dict, Any
from datetime import datetime

class ErrorLogger:
    def __init__(self):
        self.errors: List[Dict[str, Any]] = []

    def log_error(self, component: str, message: str):
        self.errors.append({
            "component": component,
            "message": message,
            "timestamp": datetime.utcnow().isoformat()
        })
