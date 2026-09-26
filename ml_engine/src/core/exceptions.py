"""Custom exceptions for the ML Engine."""
from __future__ import annotations


class MLEngineError(Exception):
    """Base exception for all ML Engine errors."""
    pass


class ModelNotFoundError(MLEngineError):
    """Raised when a requested model is not found in the registry or disk."""
    pass


class InferenceError(MLEngineError):
    """Raised when inference execution fails."""
    pass


class ValidationError(MLEngineError):
    """Raised when input data validation fails."""
    pass


class TrainingError(MLEngineError):
    """Raised when model training fails."""
    pass
