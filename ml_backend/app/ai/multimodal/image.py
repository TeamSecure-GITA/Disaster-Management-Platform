"""
Image analysis abstraction for disaster-management imagery.

Possible future providers:
- computer vision models
- satellite-image models
- damage detection models
- OCR
- multimodal LLMs

This module does not fabricate visual findings when no vision provider
is connected.
"""

from __future__ import annotations

import hashlib
import mimetypes
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Dict, List, Optional


@dataclass
class ImageAnalysisResult:
    """Structured image-analysis result."""

    success: bool
    status: str
    image_id: str
    description: Optional[str] = None
    labels: List[str] = field(default_factory=list)
    detected_objects: List[Dict[str, Any]] = field(
        default_factory=list
    )
    damage_indicators: List[Dict[str, Any]] = field(
        default_factory=list
    )
    location: Optional[Dict[str, Any]] = None
    confidence: Optional[float] = None
    warnings: List[str] = field(
        default_factory=list
    )
    metadata: Dict[str, Any] = field(
        default_factory=dict
    )

    def to_dict(self) -> Dict[str, Any]:
        return {
            "success": self.success,
            "status": self.status,
            "image_id": self.image_id,
            "description": self.description,
            "labels": self.labels,
            "detected_objects": self.detected_objects,
            "damage_indicators": self.damage_indicators,
            "location": self.location,
            "confidence": self.confidence,
            "warnings": self.warnings,
            "metadata": self.metadata,
        }


class ImageAnalyzer:
    """
    Provider-agnostic image analyzer.

    Without an external vision provider this class only validates the input
    and returns metadata. It never invents objects, damage, or locations.
    """

    SUPPORTED_TYPES = {
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/tiff",
        "image/bmp",
    }

    def __init__(
        self,
        provider: Optional[Any] = None,
    ):
        self.provider = provider

    def analyze(
        self,
        image_path: str,
        *,
        context: Optional[str] = None,
        detect_damage: bool = True,
        detect_location: bool = False,
    ) -> ImageAnalysisResult:
        """Analyze an image."""

        path = Path(image_path)

        if not path.exists():
            return ImageAnalysisResult(
                success=False,
                status="not_found",
                image_id="",
                warnings=[
                    "Image file was not found."
                ],
            )

        mime_type, _ = mimetypes.guess_type(
            str(path)
        )

        if mime_type not in self.SUPPORTED_TYPES:
            return ImageAnalysisResult(
                success=False,
                status="unsupported_format",
                image_id="",
                warnings=[
                    f"Unsupported image type: {mime_type}"
                ],
            )

        image_id = self._file_id(path)

        # ---------------------------------------------------------
        # Provider-connected path
        # ---------------------------------------------------------

        if self.provider is not None:
            try:
                result = self.provider.analyze_image(
                    image_path=str(path),
                    context=context,
                    detect_damage=detect_damage,
                    detect_location=detect_location,
                )

                return self._normalize_provider_result(
                    image_id,
                    result,
                )

            except Exception as exc:
                return ImageAnalysisResult(
                    success=False,
                    status="provider_error",
                    image_id=image_id,
                    warnings=[
                        f"Image provider failed: {exc}"
                    ],
                )

        # ---------------------------------------------------------
        # Safe fallback
        # ---------------------------------------------------------

        return ImageAnalysisResult(
            success=True,
            status="provider_not_connected",
            image_id=image_id,
            description=None,
            labels=[],
            detected_objects=[],
            damage_indicators=[],
            confidence=None,
            warnings=[
                "No image-analysis provider is connected.",
                "No visual findings were generated.",
            ],
            metadata={
                "filename": path.name,
                "mime_type": mime_type,
                "context_provided": bool(context),
                "damage_detection_requested": detect_damage,
                "location_detection_requested": detect_location,
            },
        )

    def _normalize_provider_result(
        self,
        image_id: str,
        result: Any,
    ) -> ImageAnalysisResult:
        if isinstance(result, ImageAnalysisResult):
            result.image_id = image_id
            return result

        if not isinstance(result, dict):
            return ImageAnalysisResult(
                success=False,
                status="invalid_provider_response",
                image_id=image_id,
                warnings=[
                    "Image provider returned an invalid response."
                ],
            )

        return ImageAnalysisResult(
            success=bool(result.get("success", True)),
            status=result.get("status", "completed"),
            image_id=image_id,
            description=result.get("description"),
            labels=result.get("labels", []),
            detected_objects=result.get(
                "detected_objects",
                [],
            ),
            damage_indicators=result.get(
                "damage_indicators",
                [],
            ),
            location=result.get("location"),
            confidence=result.get("confidence"),
            warnings=result.get("warnings", []),
            metadata=result.get("metadata", {}),
        )

    @staticmethod
    def _file_id(path: Path) -> str:
        digest = hashlib.sha256()

        with path.open("rb") as file:
            for block in iter(
                lambda: file.read(1024 * 1024),
                b"",
            ):
                digest.update(block)

        return digest.hexdigest()[:32]

    def health(self) -> Dict[str, Any]:
        return {
            "service": "image_analyzer",
            "status": (
                "connected"
                if self.provider is not None
                else "provider_not_connected"
            ),
        }