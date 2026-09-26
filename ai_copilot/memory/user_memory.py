from typing import Dict, Any

class UserPreferenceMemory:
    def __init__(self):
        self._users: Dict[str, Dict[str, Any]] = {}

    def set_pref(self, user_id: str, key: str, val: Any):
        if user_id not in self._users:
            self._users[user_id] = {}
        self._users[user_id][key] = val

    def get_pref(self, user_id: str, key: str, default: Any = None) -> Any:
        return self._users.get(user_id, {}).get(key, default)
