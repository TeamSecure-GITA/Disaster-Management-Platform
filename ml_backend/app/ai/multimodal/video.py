"""
Video analysis abstraction.

Video processing can later connect to:
- OpenCV
- FFmpeg
- object-detection models
- activity/event recognition
- multimodal AI
"""

from __future__ import annotations

import hashlib
import mimetypes
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Dict, List, Optional


@dataclass
class VideoAnalysisResult:
    """Structured video-analysis result."""

    success: bool
    status: str
    video_id: str
    duration_seconds: Optional[float] = None
    frame_count: Optional[int] = None
    fps: Optional[float] = None
    description: Optional[str] = None
    events: List[Dict[str, Any]] = field(
        default_factory=list
    )
    objects: List[Dict[str, Any]] = field(
        default_factory=list
    )
    damage_indicators: List[Dict[str, Any]] = field(
        default_factory=list
    )
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
            "video_id": self.video_id,
            "duration_seconds": self.duration_seconds,
            "frame_count": self.frame_count,
            "fps": self.fps,
            "description": self.description,
            "events": self.events,
            "objects": self.objects,
            "damage_indicators": self.damage_indicators,
            "warnings": self.warnings,
            "metadata": self.metadata,
        }


class VideoAnalyzer:
    """
    Provider-agnostic video analyzer.

    The fallback implementation does not claim to inspect video frames.
    """

    SUPPORTED_TYPES = {
        "video/mp4",
        "video/mpeg",
        "video/webm",
        "video/quicktime",
        "video/x-msvideo",
    }

    def __init__(
        self,
        provider: Optional[Any] = None,
    ):
        self.provider = provider

    def analyze(
        self,
        video_path: str,
        *,
        sample_interval_seconds: float = 2.0,
        detect_events: bool = True,
        detect_damage: bool = True,
    ) -> VideoAnalysisResult:
        """Analyze a video."""

        path = Path(video_path)

        if not path.exists():
            return VideoAnalysisResult(
                success=False,
                status="not_found",
                video_id="",
                warnings=[
                    "Video file was not found."
                ],
            )

        mime_type, _ = mimetypes.guess_type(
            str(path)
        )

        if mime_type not in self.SUPPORTED_TYPES:
            return VideoAnalysisResult(
                success=False,
                status="unsupported_format",
                video_id="",
                warnings=[
                    f"Unsupported video type: {mime_type}"
                ],
            )

        video_id = self._file_id(path)

        if sample_interval_seconds <= 0:
            raise ValueError(
                "sample_interval_seconds must be greater than zero."
            )

        if self.provider is not None:
            try:
                result = self.provider.analyze_video(
                    video_path=str(path),
                    sample_interval_seconds=(
                        sample_interval_seconds
                    ),
                    detect_events=detect_events,
                    detect_damage=detect_damage,
                )

                return self._normalize(
                    video_id,
                    result,
                )

            except Exception as exc:
                return VideoAnalysisResult(
                    success=False,
                    status="provider_error",
                    video_id=video_id,
                    warnings=[
                        f"Video provider failed: {exc}"
                    ],
                )

        return VideoAnalysisResult(
            success=True,
            status="provider_not_connected",
            video_id=video_id,
            warnings=[
                "No video-analysis provider is connected.",
                "No video events or objects were inferred.",
            ],
            metadata={
                "filename": path.name,
                "mime_type": mime_type,
                "sample_interval_seconds": (
                    sample_interval_seconds
                ),
                "event_detection_requested": detect_events,
                "damage_detection_requested": detect_damage,
            },
        )

    def _normalize(
        self,
        video_id: str,
        result: Any,
    ) -> VideoAnalysisResult:

        if isinstance(result, VideoAnalysisResult):
            result.video_id = video_id
            return result

        if not isinstance(result, dict):
            return VideoAnalysisResult(
                success=False,
                status="invalid_provider_response",
                video_id=video_id,
            )

        return VideoAnalysisResult(
            success=bool(result.get("success", True)),
            status=result.get("status", "completed"),
            video_id=video_id,
            duration_seconds=result.get(
                "duration_seconds"
            ),
            frame_count=result.get(
                "frame_count"
            ),
            fps=result.get("fps"),
            description=result.get(
                "description"
            ),
            events=result.get("events", []),
            objects=result.get("objects", []),
            damage_indicators=result.get(
                "damage_indicators",
                [],
            ),
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
            "service": "video_analyzer",
            "status": (
                "connected"
                if self.provider is not None
                else "provider_not_connected"
            ),
        }