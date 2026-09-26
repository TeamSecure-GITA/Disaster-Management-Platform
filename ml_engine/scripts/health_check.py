"""System and ML pipeline health check script."""
from __future__ import annotations

import sys
import logging
from pathlib import Path

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def check_health() -> bool:
    checks = {
        "configs": Path("configs").exists(),
        "datasets": Path("datasets").exists(),
        "models": Path("models").exists(),
        "src": Path("src").exists(),
    }
    all_healthy = True
    for component, status in checks.items():
        if status:
            logger.info(f"Component [{component}]: OK")
        else:
            logger.error(f"Component [{component}]: FAILED")
            all_healthy = False
    return all_healthy


if __name__ == "__main__":
    ok = check_health()
    sys.exit(0 if ok else 1)
