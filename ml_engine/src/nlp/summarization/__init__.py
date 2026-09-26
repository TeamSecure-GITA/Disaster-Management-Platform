"""Disaster situational and incident summarization."""
from .model import SummarizationModel
from .summarizer import EmergencySummarizer
from .incident_summary import IncidentSummarizer
from .situation_summary import SituationReportGenerator
from .evaluation import SummarizationEvaluator

# Alias TextSummarizer to EmergencySummarizer for root NLP interface compatibility
TextSummarizer = EmergencySummarizer

__all__ = [
    "SummarizationModel",
    "EmergencySummarizer",
    "IncidentSummarizer",
    "SituationReportGenerator",
    "SummarizationEvaluator",
    "TextSummarizer",
]
