from __future__ import annotations
from src.pipelines.training_pipeline import TrainingPipeline

def test_training_pipeline():
    pipe = TrainingPipeline()
    res = pipe.run("datasets/raw/sample.csv", hazard_type="landslide")
    assert res["status"] == "SUCCESS"
