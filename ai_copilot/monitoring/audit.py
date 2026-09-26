from typing import List, Dict, Any
from datetime import datetime

class AuditLogger:
    def __init__(self):
        self.audit_trail: List[Dict[str, Any]] = []

    def log_action(self, user_id: str, action: str, details: dict):
        self.audit_trail.append({
            "user_id": user_id,
            "action": action,
            "details": details,
            "timestamp": datetime.utcnow().isoformat()
        })
