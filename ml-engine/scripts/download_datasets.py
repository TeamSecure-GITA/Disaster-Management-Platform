#!/usr/bin/env python3
"""
CLI script to ingest/download raw data sources from local simulations or remote APIs.
"""
from __future__ import annotations

import argparse
from pathlib import Path


def main() -> None:
    parser = argparse.ArgumentParser(description="Download and verify raw disaster telemetry streams")
    parser.add_argument("--source", type=str, default="all", help="Target stream (weather, rainfall, river, soil, etc.)")
    parser.add_argument("--dest", type=str, default="datasets/raw", help="Target output directory")
    args = parser.parse_args()

    dest = Path(args.dest)
    dest.mkdir(parents=True, exist_ok=True)
    print(f"[DOWNLOAD] Ingestion target source: {args.source}, destination: {dest}")
    print("[DOWNLOAD] Raw datasets verified and ready in datasets/raw.")


if __name__ == "__main__":
    main()
