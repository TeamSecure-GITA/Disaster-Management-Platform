"""
what_if sub-package public interface.

Re-exports all types and the engine from the split implementation files::

    from app.simulation.what_if import (
        WhatIfEngine,
        WhatIfScenario,
        BaselineScenario,
        InterventionType,
    )
"""

from .comparison import ComparisonResult, InterventionComparison, InterventionDelta
from .engine     import WhatIfEngine, WhatIfResult
from .scenarios  import (
    AnalysisStatus,
    BaselineScenario,
    InterventionParameter,
    InterventionType,
    WhatIfScenario,
)

__all__ = [
    # Engine
    "WhatIfEngine",
    "WhatIfResult",
    # Scenarios
    "InterventionType",
    "AnalysisStatus",
    "BaselineScenario",
    "InterventionParameter",
    "WhatIfScenario",
    # Comparison
    "InterventionDelta",
    "ComparisonResult",
    "InterventionComparison",
]
