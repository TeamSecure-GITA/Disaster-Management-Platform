#!/usr/bin/env python3
"""
CLI script to evaluate hazard models against test benchmarks and output verification metrics.
"""
from __future__ import annotations

import argparse
import sys
from pathlib import Path

# Add root to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from pipelines.validation import run_all_validation


def main() -> None:
    parser = argparse.ArgumentParser(description="Evaluate Disaster Hazard Models")
    parser.add_argument("--hazard", type=str, default="all", help="Target hazard domain or 'all'")
    parser.add_argument("--all", action="store_true", help="Evaluate all hazard models")
    args = parser.parse_args()

    print(f"[EVALUATE] Evaluating models (target={args.hazard})...")
    res = run_all_validation()
    print("[EVALUATE] Evaluation complete. Reports written to experiments/metrics/")


if __name__ == "__main__":
    main()
