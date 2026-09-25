from sklearn.ensemble import RandomForestClassifier
from src.explainability.feature_importance import FeatureImportanceAnalyzer


def test_feature_importance():
    X = [[1, 2], [3, 4], [5, 6], [7, 8]]
    y = [0, 0, 1, 1]
    rf = RandomForestClassifier(n_estimators=5, random_state=42).fit(X, y)
    fi = FeatureImportanceAnalyzer.extract_importance(rf, ["feature_a", "feature_b"])
    assert len(fi) == 2
    assert "importance" in fi[0]
    assert "relative_importance_pct" in fi[0]
