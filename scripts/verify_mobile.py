#!/usr/bin/env python3
import os
import sys

base = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "mobile"))

required = [
    "app/_layout.tsx",
    "app/(main)/home.tsx",
    "app/(main)/emergency/sos.tsx",
    "components/emergency/SOSButton.tsx",
    "services/api/ai.api.ts",
    "lora/lora-manager.ts",
    "database/schema.ts",
    "offline/sync-engine.ts",
    "app.json",
    "package.json"
]

missing = [f for f in required if not os.path.exists(os.path.join(base, f))]

if missing:
    print(f"ERROR: Missing mobile core files: {missing}")
    sys.exit(1)

print(f"Verified all {len(required)} core mobile subsystem modules intact at {base}.")
sys.exit(0)
