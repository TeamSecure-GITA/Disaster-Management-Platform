from __future__ import annotations
from src.pipelines.realtime_pipeline import RealtimePipeline

def test_realtime_pipeline():
    pipe = RealtimePipeline()
    res = pipe.stream_process({"id": "sensor_1", "val": 42.0})
    assert res["processed"] is True
