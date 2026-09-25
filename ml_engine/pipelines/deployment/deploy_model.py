from __future__ import annotations

import json
import shutil
from datetime import datetime, timezone
from pathlib import Path


def deploy_model_to_serving(
    hazard_type: str,
    stage: str = "production",
    target_deploy_dir: str = "models/serving",
) -> Path:
    src_dir = Path(f"model_registry/{stage}/{hazard_type}")
    if not src_dir.exists():
        src_dir = Path(f"models/{hazard_type}/checkpoints")

    serving_path = Path(target_deploy_dir) / hazard_type
    serving_path.mkdir(parents=True, exist_ok=True)

    # Copy latest model joblib and configs
    ckpt = src_dir / "model.joblib"
    if not ckpt.exists():
        # Search subdirectories for model.joblib
        found = list(src_dir.rglob("model.joblib"))
        if found:
            ckpt = found[0]

    if ckpt.exists():
        shutil.copy(ckpt, serving_path / "model.joblib")

    deploy_meta = {
        "hazard_type": hazard_type,
        "deployed_stage": stage,
        "deployed_at": datetime.now(timezone.utc).isoformat(),
        "serving_path": str(serving_path),
    }

    with open(serving_path / "deployment.json", "w") as f:
        json.dump(deploy_meta, f, indent=2)

    print(f"[DEPLOY-MODEL] Model for {hazard_type} deployed to serving directory {serving_path}")
    return serving_path


if __name__ == "__main__":
    deploy_model_to_serving("landslide")
