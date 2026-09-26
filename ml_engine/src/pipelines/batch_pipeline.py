from __future__ import annotations
from typing import Any

class BatchPipeline:
    def process_batch(self, items: list[dict[str, Any]]) -> list[dict[str, Any]]:
        return [{"item_id": i, "status": "PROCESSED"} for i in range(len(items))]
