"""
Validation sub-package.

Exports schema validation, data quality assessment, and deduplication
through a unified ``ValidationService`` facade.
"""

from __future__ import annotations

from .deduplication import (
    DeduplicationEngine,
    DeduplicationSummary,
    DuplicateCheckResult,
)
from .quality import (
    BatchQualitySummary,
    DataQualityAssessor,
    QualityDimension,
    QualityReport,
)
from .schema import (
    FieldError,
    SchemaValidator,
    ValidationResult,
)


class ValidationService:
    """
    Unified facade for schema validation, quality assessment, and deduplication.

    Example::

        svc = ValidationService()

        # Schema check
        result = svc.schema.validate(record, "weather_observation")

        # Quality assessment
        report = svc.quality.assess(record, "weather_observation", source="imd")

        # Deduplication
        dup_result = svc.dedup.check(record, "sensor_reading")
    """

    def __init__(
        self,
        schema_validator: SchemaValidator | None = None,
        quality_assessor: DataQualityAssessor | None = None,
        dedup_engine: DeduplicationEngine | None = None,
    ):
        self.schema: SchemaValidator = schema_validator or SchemaValidator()
        self.quality: DataQualityAssessor = quality_assessor or DataQualityAssessor()
        self.dedup: DeduplicationEngine = dedup_engine or DeduplicationEngine()

    def validate_and_assess(
        self,
        record: dict,
        schema_name: str,
        source: str = "unknown",
    ) -> dict:
        """
        Run all three validation stages and return a combined summary dict.
        Convenience method for pipeline entry points.
        """
        schema_result = self.schema.validate(record, schema_name)
        quality_report = self.quality.assess(record, schema_name, source=source)
        dup_result = self.dedup.check(record, schema_name)

        return {
            "schema_valid": schema_result.is_valid,
            "quality_score": quality_report.overall_score,
            "quality_label": quality_report.quality_label,
            "is_duplicate": dup_result.is_duplicate,
            "duplicate_of": dup_result.duplicate_of,
            "schema_errors": [e.message for e in schema_result.errors],
            "quality_recommendations": quality_report.recommendations,
        }

    def health(self) -> dict:
        return {
            "service": "validation",
            "status": "ok",
            "components": ["schema", "quality", "dedup"],
        }


__all__ = [
    "ValidationService",
    "SchemaValidator",
    "ValidationResult",
    "FieldError",
    "DataQualityAssessor",
    "QualityReport",
    "QualityDimension",
    "BatchQualitySummary",
    "DeduplicationEngine",
    "DuplicateCheckResult",
    "DeduplicationSummary",
]
