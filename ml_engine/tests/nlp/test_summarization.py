from __future__ import annotations
from src.nlp.summarization import EmergencySummarizer

def test_summarization():
    summarizer = EmergencySummarizer()
    text = "Cyclone Warning in effect. Evacuation centers are active. Please seek high ground."
    summary = summarizer.summarize(text)
    assert len(summary) > 0
