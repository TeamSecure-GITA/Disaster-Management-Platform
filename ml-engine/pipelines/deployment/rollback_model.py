from __future__ import annotations

import json
import shutil
from datetime import datetime, timezone
from pathlib import Path


def rollback_production_model(
    hazard_type: str,
    target_version: str,
) -> Path:
    prod_dir = Path(f"model_registry/production/{hazard_type}")
    target_src = prod_dir / f"v{target_version}"

    if not target_src.exists():
        # Check staging or development
        target_src = Path(f"model_registry/staging/{hazard_type}/v{target_version}")

    if not target_src.exists():
        raise FileNotFoundError(f"Target version v{target_version} for rollback not found.")

    active_dir = prod_dir / "current"
    active_dir.mkdir(parents=True, exist_ok=True)

    for item in target_src.glob("*"):
        if item.is_file():
            shutil.copy(item, active_dir / item.name)

    rollback_meta = {
        "hazard_type": hazard_type,
        "restored_version": target_version,
        "rollback_at": datetime.now(timezone.utc).isoformat(),
    }
    with open(active_dir / "rollback_meta.json", "w") as f:
        json.dump(rollback_meta, f, indent=2)

    print(f"[ROLLBACK-MODEL] Rolled back production {hazard_type} to v{target_version}")
    return active_dir


if __name__ == "__main__":
    pass
