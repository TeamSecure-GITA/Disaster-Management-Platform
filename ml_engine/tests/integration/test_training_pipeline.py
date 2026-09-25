from pipelines.training.train_landslide import run_landslide_training


def test_training_pipeline_execution(tmp_path):
    ckpt = tmp_path / "model.joblib"
    metrics = run_landslide_training(
        dataset_path="datasets/test/landslide/test_landslide.csv",
        output_checkpoint=str(ckpt),
    )
    assert ckpt.exists()
    assert "accuracy" in metrics
    assert "f1" in metrics
