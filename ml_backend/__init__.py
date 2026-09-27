"""
Backend root package for Disaster Management Platform.
"""

from __future__ import annotations

import sys
from importlib.machinery import ModuleSpec
from pathlib import Path

# Ensure this directory and its parent are in sys.path
_current_dir = str(Path(__file__).resolve().parent)
_parent_dir = str(Path(__file__).resolve().parent.parent)

if _current_dir not in sys.path:
    sys.path.insert(0, _current_dir)
if _parent_dir not in sys.path:
    sys.path.insert(0, _parent_dir)

# Ensure `import ml_backend` resolves correctly regardless of whether
# the working directory is the repository root or ml_backend itself
if "ml_backend" not in sys.modules:
    class _MLBackendFinder:
        @classmethod
        def find_spec(cls, fullname, path=None, target=None):
            if fullname == "ml_backend":
                spec = ModuleSpec("ml_backend", None, is_package=True)
                spec.submodule_search_locations = [_current_dir]
                return spec
            return None

    sys.meta_path.insert(0, _MLBackendFinder)
