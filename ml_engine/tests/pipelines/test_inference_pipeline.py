from __future__ import annotations
from src.pipelines.inference_pipeline import InferencePipeline

def test_inference_pipeline():
    pipe = InferencePipeline()
    res = pipe.execute({"features": [1.0, 2.0]})
    assert res["status"] == "PROCESSED"
