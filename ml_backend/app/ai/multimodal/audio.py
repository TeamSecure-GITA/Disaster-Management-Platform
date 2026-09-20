"""
Audio analysis abstraction.

Designed for:
- emergency voice reports
- field responder recordings
- distress calls
- speech transcription
- environmental sound analysis

No transcription or classification is fabricated when a provider is absent.
"""

from __future__ import annotations

import hashlib
import mimetypes
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Dict, List, Optional


@dataclass
class AudioAnalysisResult:
    """Structured audio-analysis result."""

    success: bool
    status: str
    audio_id: str
    duration_seconds: Optional[float] = None
    transcript: Optional[str] = None
    language: Optional[str] = None
    speaker_count: Optional[int] = None
    events: List[Dict[str, Any]] = field(
        default_factory=list
    )
    keywords: List[str] = field(
        default_factory=list
    )
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
            "audio_id": self.audio_id,
            "duration_seconds": self.duration_seconds,
            "transcript": self.transcript,
            "language": self.language,
            "speaker_count": self.speaker_count,
            "events": self.events,
            "keywords": self.keywords,
            "confidence": self.confidence,
            "warnings": self.warnings,
            "metadata": self.metadata,
        }


class AudioAnalyzer:
    """
    Provider-agnostic audio analyzer.

    A speech-to-text or audio intelligence provider can be injected later.
    """

    SUPPORTED_TYPES = {
        "audio/mpeg",
        "audio/wav",
        "audio/x-wav",
        "audio/ogg",
        "audio/webm",
        "audio/mp4",
        "audio/flac",
    }

    def __init__(
        self,
        provider: Optional[Any] = None,
    ):
        self.provider = provider

    def analyze(
        self,
        audio_path: str,
        *,
        transcribe: bool = True,
        detect_events: bool = False,
        language: Optional[str] = None,
    ) -> AudioAnalysisResult:
        """Analyze audio."""

        path = Path(audio_path)

        if not path.exists():
            return AudioAnalysisResult(
                success=False,
                status="not_found",
                audio_id="",
                warnings=[
                    "Audio file was not found."
                ],
            )

        mime_type, _ = mimetypes.guess_type(
            str(path)
        )

        if mime_type not in self.SUPPORTED_TYPES:
            return AudioAnalysisResult(
                success=False,
                status="unsupported_format",
                audio_id="",
                warnings=[
                    f"Unsupported audio type: {mime_type}"
                ],
            )

        audio_id = self._file_id(path)

        if self.provider is not None:
            try:
                result = self.provider.analyze_audio(
                    audio_path=str(path),
                    transcribe=transcribe,
                    detect_events=detect_events,
                    language=language,
                )

                return self._normalize(
                    audio_id,
                    result,
                )

            except Exception as exc:
                return AudioAnalysisResult(
                    success=False,
                    status="provider_error",
                    audio_id=audio_id,
                    warnings=[
                        f"Audio provider failed: {exc}"
                    ],
                )

        return AudioAnalysisResult(
            success=True,
            status="provider_not_connected",
            audio_id=audio_id,
            warnings=[
                "No audio-analysis provider is connected.",
                "No transcript or audio event was generated.",
            ],
            metadata={
                "filename": path.name,
                "mime_type": mime_type,
                "transcription_requested": transcribe,
                "event_detection_requested": detect_events,
                "requested_language": language,
            },
        )

    def _normalize(
        self,
        audio_id: str,
        result: Any,
    ) -> AudioAnalysisResult:

        if isinstance(result, AudioAnalysisResult):
            result.audio_id = audio_id
            return result

        if not isinstance(result, dict):
            return AudioAnalysisResult(
                success=False,
                status="invalid_provider_response",
                audio_id=audio_id,
            )

        return AudioAnalysisResult(
            success=bool(result.get("success", True)),
            status=result.get("status", "completed"),
            audio_id=audio_id,
            duration_seconds=result.get(
                "duration_seconds"
            ),
            transcript=result.get("transcript"),
            language=result.get("language"),
            speaker_count=result.get(
                "speaker_count"
            ),
            events=result.get("events", []),
            keywords=result.get("keywords", []),
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
            "service": "audio_analyzer",
            "status": (
                "connected"
                if self.provider is not None
                else "provider_not_connected"
            ),
        }