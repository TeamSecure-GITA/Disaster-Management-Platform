from typing import List, Dict, Any

class ShortTermMemory:
    def __init__(self, capacity: int = 15):
        self.capacity = capacity
        self.items: List[Dict[str, Any]] = []

    def push(self, item: Dict[str, Any]):
        self.items.append(item)
        if len(self.items) > self.capacity:
            self.items.pop(0)

    def retrieve(self) -> List[Dict[str, Any]]:
        return list(self.items)
