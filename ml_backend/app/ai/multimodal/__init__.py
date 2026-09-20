"""
Multimodal AI subsystem.

Supports provider-agnostic processing of:
- images
- videos
- audio
- documents

The implementations provide safe extraction/analysis contracts that can later
be connected to dedicated AI/ML providers.
"""

from .image import (
    ImageAnalysisResult,
    ImageAnalyzer,
)

from .video import (
    VideoAnalysisResult,
    VideoAnalyzer,
)

from .audio import (
    AudioAnalysisResult,
    AudioAnalyzer,
)

from .document import (
    DocumentAnalysisResult,
    DocumentAnalyzer,
)


__all__ = [
    "ImageAnalysisResult",
    "ImageAnalyzer",
    "VideoAnalysisResult",
    "VideoAnalyzer",
    "AudioAnalysisResult",
    "AudioAnalyzer",
    "DocumentAnalysisResult",
    "DocumentAnalyzer",
]