import pytest
from app.ml.explainability.feature_importance import FeatureImportanceAnalyzer

def test_feature_importance_analyzer():
    analyzer = FeatureImportanceAnalyzer(
        feature_names=['rainfall', 'slope'],
        importances=[0.6, 0.4]
    )
    res = analyzer.analyze()
    assert res is not None
    assert len(res.ranked_features) == 2
