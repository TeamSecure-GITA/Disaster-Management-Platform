"""
Hallucination/grounding checks for Copilot responses.

This is a lightweight deterministic checker. It is not a formal proof that
a response is factually correct.
"""

from __future__ import annotations

import re
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional


@dataclass
class HallucinationCheckResult:
    """Result of a grounding check."""

    grounded: bool
    score: float
    unsupported_claims: List[str] = field(default_factory=list)
    warnings: List[str] = field(default_factory=list)

    @property
    def is_consistent(self) -> bool:
        return self.grounded

    def to_dict(self) -> Dict[str, Any]:
        return {
            "grounded": self.grounded,
            "score": self.score,
            "unsupported_claims": self.unsupported_claims,
            "warnings": self.warnings,
        }


class HallucinationChecker:
    """
    Performs basic grounding checks.

    A production system can later replace/augment this with:
    - RAG citation verification
    - NLI/entailment models
    - structured fact verification
    - LLM-based claim verification
    """

    CLAIM_PATTERN = re.compile(
        r"\b(?:is|are|was|were|has|have|will|will be|"
        r"reported|recorded|detected|measured|"
        r"estimated|predicted)\b",
        re.IGNORECASE,
    )

    NUMERIC_PATTERN = re.compile(
        r"\b\d+(?:\.\d+)?\s*(?:%|km|m|mm|cm|°C|hours?|days?)?\b",
        re.IGNORECASE,
    )

    def check(
        self,
        response: str,
        evidence: Optional[List[Any]] = None,
        *,
        threshold: float = 0.5,
        citations: Optional[List[Dict[str, Any]]] = None,
        tool_results: Optional[List[Dict[str, Any]]] = None,
    ) -> HallucinationCheckResult:
        """Check whether a response appears grounded."""

        if not response or not response.strip():
            return HallucinationCheckResult(
                grounded=False,
                score=0.0,
                unsupported_claims=["Empty response."],
            )

        evidence = evidence or []
        citations = citations or []
        tool_results = tool_results or []

        claims = self._extract_claims(response)

        if not claims:
            return HallucinationCheckResult(
                grounded=True,
                score=1.0,
            )

        support_count = 0
        unsupported: List[str] = []

        evidence_text = " ".join(
            self._stringify(item)
            for item in evidence
        ).lower()

        tool_text = " ".join(
            self._stringify(item)
            for item in tool_results
        ).lower()

        citation_text = " ".join(
            self._stringify(item)
            for item in citations
        ).lower()

        combined_evidence = (
            evidence_text + " " + tool_text + " " + citation_text
        )

        for claim in claims:
            normalized_claim = claim.lower()

            # Numeric claims require supporting evidence.
            numeric_values = self.NUMERIC_PATTERN.findall(claim)

            if numeric_values:
                if any(
                    value.lower() in combined_evidence
                    for value in numeric_values
                ):
                    support_count += 1
                else:
                    unsupported.append(claim)

                continue

            # A simple token overlap check.
            tokens = {
                token
                for token in re.findall(r"\b[a-zA-Z]{4,}\b", normalized_claim)
            }

            if not tokens:
                support_count += 1
                continue

            evidence_tokens = {
                token
                for token in re.findall(
                    r"\b[a-zA-Z]{4,}\b",
                    combined_evidence,
                )
            }

            overlap = len(tokens & evidence_tokens) / len(tokens)

            if overlap >= 0.25:
                support_count += 1
            else:
                unsupported.append(claim)

        score = support_count / max(len(claims), 1)

        warnings: List[str] = []

        if score < 0.50:
            warnings.append(
                "Response contains a substantial number of claims "
                "without obvious supporting evidence."
            )

        elif score < 0.80:
            warnings.append(
                "Some claims may require additional verification."
            )

        grounded = score >= 0.50

        return HallucinationCheckResult(
            grounded=grounded,
            score=round(score, 4),
            unsupported_claims=unsupported,
            warnings=warnings,
        )

    def _extract_claims(self, response: str) -> List[str]:
        """
        Split response into sentence-level claims.
        """

        sentences = re.split(
            r"(?<=[.!?])\s+",
            response.strip(),
        )

        claims = []

        for sentence in sentences:
            if self.CLAIM_PATTERN.search(sentence):
                claims.append(sentence.strip())

        return claims

    @staticmethod
    def _stringify(value: Any) -> str:
        if isinstance(value, str):
            return value

        if isinstance(value, dict):
            return " ".join(
                f"{key} {value}"
                for key, value in value.items()
            )

        return str(value)