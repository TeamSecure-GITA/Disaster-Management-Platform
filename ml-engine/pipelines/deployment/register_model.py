from __future__ import annotations

import json
import shutil
from datetime import datetime, timezone
from pathlib import Path


def register_model_to_registry(
    hazard_type: str,
    version: str = "1.0.0",
    stage: str = "development",
) -> Path:
    source_package = Path(f"models/{hazard_type}/artifacts/v{version}")
    target_registry = Path(f"model_registry/{stage}/{hazard_type}/v{version}")
    target_registry.mkdir(parents=True, exist_ok=True)

    if source_package.exists():
        for item in source_package.glob("*"):
            if item.is_file():
                shutil.copy(item, target_registry / item.name)

    reg_metadata = {
        "hazard_type": hazard_type,
        "version": version,
        "stage": stage,
        "registered_at": datetime.now(timezone.utc).isoformat(),
    }

    with open(target_registry / "registry_meta.json", "w") as f:
        json.dump(reg_metadata, f, indent=2)

    print(f"[REGISTER-MODEL] Registered {hazard_type} (v{version}) into {stage} registry")
    return target_registry


if __name__ == "__main__":
    register_model_to_registry("landslide")
