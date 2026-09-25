from __future__ import annotations

import json
import shutil
from datetime import datetime, timezone
from pathlib import Path


def promote_model_stage(
    hazard_type: str,
    version: str,
    from_stage: str = "staging",
    to_stage: str = "production",
) -> Path:
    src = Path(f"model_registry/{from_stage}/{hazard_type}/v{version}")
    dst = Path(f"model_registry/{to_stage}/{hazard_type}/v{version}")

    if not src.exists():
        raise FileNotFoundError(f"Source model not found in {src}")

    dst.mkdir(parents=True, exist_ok=True)
    for item in src.glob("*"):
        if item.is_file():
            shutil.copy(item, dst / item.name)

    promo_meta = {
        "hazard_type": hazard_type,
        "version": version,
        "promoted_from": from_stage,
        "promoted_to": to_stage,
        "promoted_at": datetime.now(timezone.utc).isoformat(),
    }

    with open(dst / "promotion_meta.json", "w") as f:
        json.dump(promo_meta, f, indent=2)

    print(f"[PROMOTE-MODEL] Successfully promoted {hazard_type} (v{version}) from {from_stage} -> {to_stage}")
    return dst


if __name__ == "__main__":
    pass
