#!/usr/bin/env python3
"""
CLI utility to clean up temporary experiment logs, cache files, and pytest leftovers.
"""
from __future__ import annotations

import shutil
from pathlib import Path


def cleanup() -> None:
    root = Path(__file__).resolve().parent.parent
    patterns = ["__pycache__", ".pytest_cache", ".coverage", "*.pyc", "*.pyo"]

    print(f"[CLEANUP] Purging build and cache artifacts in {root}...")
    removed_count = 0

    for pattern in patterns:
        for p in root.rglob(pattern):
            try:
                if p.is_dir():
                    shutil.rmtree(p)
                else:
                    p.unlink()
                removed_count += 1
            except Exception:
                pass

    print(f"[CLEANUP] Finished. Removed {removed_count} temporary items.")


if __name__ == "__main__":
    cleanup()
