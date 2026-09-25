from __future__ import annotations

import json
import shutil
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


def package_model_artifacts(
    hazard_type: str,
    version: str = "1.0.0",
) -> Path:
    checkpoint_file = Path(f"models/{hazard_type}/checkpoints/model.joblib")
    config_file = Path(f"models/{hazard_type}/configs/model.yaml")
    package_dir = Path(f"models/{hazard_type}/artifacts/v{version}")
    package_dir.mkdir(parents=True, exist_ok=True)

    if checkpoint_file.exists():
        shutil.copy(checkpoint_file, package_dir / "model.joblib")

    if config_file.exists():
        shutil.copy(config_file, package_dir / "model.yaml")

    manifest = {
        "hazard_type": hazard_type,
        "version": version,
        "packaged_at": datetime.now(timezone.utc).isoformat(),
        "files": [f.name for f in package_dir.glob("*") if f.name != "manifest.json"],
    }

    with open(package_dir / "manifest.json", "w") as f:
        json.dump(manifest, f, indent=2)

    print(f"[PACKAGE-MODEL] Packaged {hazard_type} (v{version}) into {package_dir}")
    return package_dir


if __name__ == "__main__":
    package_model_artifacts("landslide")
