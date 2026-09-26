"""Register model artifacts to the model registry."""
from __future__ import annotations

import argparse
import logging
from pathlib import Path
import json
from datetime import datetime, timezone

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def register(model_name: str, version: str, stage: str = "staging") -> None:
    registry_file = Path("models/metadata/registry_catalog.json")
    registry_file.parent.mkdir(parents=True, exist_ok=True)
    catalog = {}
    if registry_file.exists():
        try:
            with open(registry_file) as f:
                catalog = json.load(f)
        except Exception:
            catalog = {}
    
    catalog[model_name] = {
        "version": version,
        "stage": stage,
        "updated_at": datetime.now(timezone.utc).isoformat(),
        "status": "READY"
    }
    with open(registry_file, "w") as f:
        json.dump(catalog, f, indent=2)
    logger.info(f"Registered {model_name} version {version} to {stage}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Register model version")
    parser.add_argument("--name", type=str, default="landslide_detector")
    parser.add_argument("--version", type=str, default="1.0.0")
    parser.add_argument("--stage", type=str, default="production")
    args = parser.parse_args()
    register(args.name, args.version, args.stage)


if __name__ == "__main__":
    main()
