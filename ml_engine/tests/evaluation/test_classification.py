from src.evaluation.classification import ClassificationEvaluator


def test_classification_evaluator():
    y_true = [0, 1, 0, 1, 1, 0]
    y_pred = [0, 1, 0, 0, 1, 0]
    metrics = ClassificationEvaluator.evaluate(y_true, y_pred)
    assert "accuracy" in metrics
    assert "f1_weighted" in metrics
    assert metrics["accuracy"] > 0.8
