"""
Safety layer for the Disaster Management AI Copilot.

The safety layer is responsible for:
- validating AI/tool outputs
- detecting unsupported claims
- estimating response confidence
- checking permissions
- requiring human confirmation for high-impact actions
"""

from .validation import (
    SafetyValidationResult,
    SafetyValidator,
)

from .hallucination_check import (
    HallucinationCheckResult,
    HallucinationChecker,
)

from .confidence import (
    ConfidenceLevel,
    ConfidenceResult,
    ConfidenceManager,
)

from .permissions import (
    PermissionResult,
    PermissionManager,
)

from .human_confirmation import (
    ConfirmationRequest,
    HumanConfirmationManager,
)


__all__ = [
    "SafetyValidationResult",
    "SafetyValidator",
    "HallucinationCheckResult",
    "HallucinationChecker",
    "ConfidenceLevel",
    "ConfidenceResult",
    "ConfidenceManager",
    "PermissionResult",
    "PermissionManager",
    "ConfirmationRequest",
    "HumanConfirmationManager",
]