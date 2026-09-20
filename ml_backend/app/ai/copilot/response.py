"""
Structured response layer for the AI Copilot.

Ensures responses contain:
- Answer
- Intent
- Confidence
- Sources
- Tool results
- Uncertainty
- Safety information
"""

from __future__ import annotations

from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional


@dataclass
class SourceReference:
    """Reference used to support an answer."""

    title: str

    source_type: str

    uri: Optional[str] = None

    timestamp: Optional[str] = None

    metadata: Dict = field(
        default_factory=dict
    )


@dataclass
class ToolResult:
    """Result returned by a Copilot tool."""

    tool_name: str

    success: bool

    data: Any = None

    error: Optional[str] = None

    latency_ms: Optional[float] = None


@dataclass
class CopilotResponse:
    """Standard Copilot response."""

    success: bool

    answer: str

    conversation_id: str

    intent: str

    intent_confidence: float

    requires_human_confirmation: bool = False

    uncertainty: Optional[str] = None

    sources: List[
        SourceReference
    ] = field(
        default_factory=list
    )

    tool_results: List[
        ToolResult
    ] = field(
        default_factory=list
    )

    metadata: Dict = field(
        default_factory=dict
    )

    timestamp: str = field(
        default_factory=lambda:
            datetime.now(
                timezone.utc
            ).isoformat()
    )

    def to_dict(self) -> Dict:
        return asdict(self)


class ResponseBuilder:
    """
    Fluent response builder.
    """

    def __init__(
        self,
        conversation_id: str,
        intent: str,
        confidence: float,
    ):

        self._response = CopilotResponse(
            success=True,
            answer="",
            conversation_id=conversation_id,
            intent=intent,
            intent_confidence=confidence,
        )

    def answer(
        self,
        text: str,
    ) -> "ResponseBuilder":

        self._response.answer = text

        return self

    def human_confirmation(
        self,
        required: bool = True,
    ) -> "ResponseBuilder":

        self._response.requires_human_confirmation = (
            required
        )

        return self

    def uncertainty(
        self,
        text: Optional[str],
    ) -> "ResponseBuilder":

        self._response.uncertainty = text

        return self

    def add_source(
        self,
        title: str,
        source_type: str,
        uri: Optional[str] = None,
        timestamp: Optional[str] = None,
        metadata: Optional[Dict] = None,
    ) -> "ResponseBuilder":

        self._response.sources.append(
            SourceReference(
                title=title,
                source_type=source_type,
                uri=uri,
                timestamp=timestamp,
                metadata=metadata or {},
            )
        )

        return self

    def add_tool_result(
        self,
        tool_name: str,
        success: bool,
        data: Any = None,
        error: Optional[str] = None,
        latency_ms: Optional[float] = None,
    ) -> "ResponseBuilder":

        self._response.tool_results.append(
            ToolResult(
                tool_name=tool_name,
                success=success,
                data=data,
                error=error,
                latency_ms=latency_ms,
            )
        )

        return self

    def metadata(
        self,
        values: Dict,
    ) -> "ResponseBuilder":

        self._response.metadata.update(
            values
        )

        return self

    def failure(
        self,
        message: str,
    ) -> "ResponseBuilder":

        self._response.success = False
        self._response.answer = message

        return self

    def build(self) -> CopilotResponse:

        if not self._response.answer:
            self._response.answer = (
                "No response was generated."
            )

        return self._response


def build_simple_response(
    conversation_id: str,
    intent: str,
    confidence: float,
    answer: str,
) -> CopilotResponse:

    return (
        ResponseBuilder(
            conversation_id,
            intent,
            confidence,
        )
        .answer(answer)
        .build()
    )