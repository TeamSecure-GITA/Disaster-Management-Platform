from reasoning.evidence import EvidenceAggregator
from schemas.tool import ToolExecutionResult

def test_evidence_aggregator():
    aggregator = EvidenceAggregator()
    tool_results = [
        ToolExecutionResult(tool_name="weather_forecast", success=True, data={"rain": "heavy"})
    ]
    docs = [{"source_id": "sop_001", "text": "Deploy sandbags if river exceeds threshold."}]
    evidence = aggregator.aggregate(tool_results, docs)
    assert len(evidence) == 2
    assert evidence[0].source == "tool:weather_forecast"
    assert evidence[1].source == "sop_001"
    assert evidence[0].confidence > 0.8
