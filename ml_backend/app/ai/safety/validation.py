"""
General safety validation for AI responses and tool outputs.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional


@dataclass
class SafetyValidationResult:
    """Result produced by the safety validator."""

    valid: bool
    severity: str = "low"
    issues: List[str] = field(default_factory=list)
    warnings: List[str] = field(default_factory=list)
    sanitized_output: Optional[Any] = None
    requires_human_review: bool = False

    @property
    def is_safe(self) -> bool:
        return self.valid

    def to_dict(self) -> Dict[str, Any]:
        return {
            "valid": self.valid,
            "severity": self.severity,
            "issues": self.issues,
            "warnings": self.warnings,
            "sanitized_output": self.sanitized_output,
            "requires_human_review": self.requires_human_review,
        }


class SafetyValidator:
    """
    Validates Copilot responses before they reach the user.

    This is intentionally conservative for disaster-management use cases.
    """

    HIGH_IMPACT_KEYWORDS = {
        "evacuate",
        "evacuation",
        "dispatch",
        "deploy",
        "rescue",
        "shutdown",
        "close road",
        "open dam",
        "emergency alert",
        "shelter order",
    }

    UNSUPPORTED_CERTAINTY_PHRASES = {
        "guaranteed",
        "certain to happen",
        "will definitely happen",
        "100% accurate",
        "cannot fail",
        "exactly when",
        "exact time",
    }

    def __init__(
        self,
        require_human_confirmation: bool = True,
    ):
        self.require_human_confirmation = require_human_confirmation

    def validate(
        self,
        output: Any,
        *,
        source_data: Optional[List[Any]] = None,
        action: Optional[str] = None,
        confidence: Optional[float] = None,
    ) -> SafetyValidationResult:
        """Run the complete safety validation pipeline."""

        issues: List[str] = []
        warnings: List[str] = []

        text = self._extract_text(output).lower()

        # ---------------------------------------------------------
        # Empty output
        # ---------------------------------------------------------

        if not text.strip():
            issues.append("AI response is empty.")

        # ---------------------------------------------------------
        # Unsupported certainty
        # ---------------------------------------------------------

        for phrase in self.UNSUPPORTED_CERTAINTY_PHRASES:
            if phrase in text:
                issues.append(
                    f"Unsupported certainty detected: '{phrase}'."
                )

        # ---------------------------------------------------------
        # Earthquake deterministic prediction protection
        # ---------------------------------------------------------

        earthquake_prediction_phrases = (
            "earthquake will happen",
            "earthquake will occur",
            "earthquake exactly",
            "earthquake at exactly",
            "earthquake prediction",
        )

        if "earthquake" in text:
            for phrase in earthquake_prediction_phrases:
                if phrase in text:
                    warnings.append(
                        "Earthquake statements must be framed as "
                        "hazard assessment, detection, monitoring, "
                        "or susceptibility rather than deterministic "
                        "prediction."
                    )
                    break

        # ---------------------------------------------------------
        # Confidence validation
        # ---------------------------------------------------------

        if confidence is not None:
            if not 0.0 <= confidence <= 1.0:
                issues.append(
                    "Confidence value must be between 0 and 1."
                )

            elif confidence < 0.40:
                warnings.append(
                    "Low-confidence result should be clearly disclosed."
                )

        # ---------------------------------------------------------
        # High-impact action detection
        # ---------------------------------------------------------

        detected_high_impact = self._contains_high_impact_action(
            text,
            action,
        )

        requires_review = (
            self.require_human_confirmation
            and detected_high_impact
        )

        if requires_review:
            warnings.append(
                "High-impact disaster-management action requires "
                "human confirmation."
            )

        # ---------------------------------------------------------
        # Determine severity
        # ---------------------------------------------------------

        if issues:
            severity = "high"
            valid = False
        elif requires_review:
            severity = "medium"
            valid = True
        elif warnings:
            severity = "low"
            valid = True
        else:
            severity = "low"
            valid = True

        sanitized = self._sanitize(output)

        return SafetyValidationResult(
            valid=valid,
            severity=severity,
            issues=issues,
            warnings=warnings,
            sanitized_output=sanitized,
            requires_human_review=requires_review,
        )

    def validate_tool_result(
        self,
        tool_result: Dict[str, Any],
    ) -> SafetyValidationResult:
        """
        Validate a tool result.

        Tool errors are not converted into fake successful results.
        """

        issues: List[str] = []
        warnings: List[str] = []

        if not isinstance(tool_result, dict):
            return SafetyValidationResult(
                valid=False,
                severity="high",
                issues=["Tool result must be a dictionary."],
            )

        status = tool_result.get("status")

        if status == "error":
            warnings.append(
                "The underlying tool reported an error."
            )

        if status == "not_connected":
            warnings.append(
                "The requested data/service is not connected."
            )

        if status == "not_found":
            warnings.append(
                "The requested resource was not found."
            )

        if "success" not in tool_result:
            warnings.append(
                "Tool result does not explicitly provide success status."
            )

        return SafetyValidationResult(
            valid=not issues,
            severity="high" if issues else "low",
            issues=issues,
            warnings=warnings,
            sanitized_output=tool_result,
        )

    def _extract_text(self, value: Any) -> str:
        if value is None:
            return ""

        if isinstance(value, str):
            return value

        if isinstance(value, dict):
            parts = []

            for key in ("answer", "message", "text", "summary"):
                if key in value:
                    parts.append(str(value[key]))

            return " ".join(parts)

        return str(value)

    def _contains_high_impact_action(
        self,
        text: str,
        action: Optional[str],
    ) -> bool:

        if action:
            action_text = action.lower()

            if any(
                keyword in action_text
                for keyword in self.HIGH_IMPACT_KEYWORDS
            ):
                return True

        return any(
            keyword in text
            for keyword in self.HIGH_IMPACT_KEYWORDS
        )

    def _sanitize(self, output: Any) -> Any:
        """
        Basic sanitization.

        This intentionally does not rewrite factual content because changing
        a disaster-management result silently can itself be dangerous.
        """

        if isinstance(output, str):
            return output.strip()

        return output