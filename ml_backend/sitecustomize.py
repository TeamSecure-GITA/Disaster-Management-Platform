"""
Site-wide customization for Disaster Management Platform ML service.
Automatically loaded by Python at startup.
Guarantees that `ml_backend` is always accessible in `sys.modules` and `sys.path`.
"""

from __future__ import annotations

import sys
from importlib.machinery import ModuleSpec
from pathlib import Path

_backend_root = str(Path(__file__).resolve().parent)
_backend_parent = str(Path(__file__).resolve().parent.parent)

if _backend_root not in sys.path:
    sys.path.insert(0, _backend_root)
if _backend_parent not in sys.path:
    sys.path.insert(0, _backend_parent)

if "ml_backend" not in sys.modules:
    class _MLBackendFinder:
        @classmethod
        def find_spec(cls, fullname, path=None, target=None):
            if fullname == "ml_backend":
                spec = ModuleSpec("ml_backend", None, is_package=True)
                spec.submodule_search_locations = [_backend_root]
                return spec
            return None

    sys.meta_path.insert(0, _MLBackendFinder)
