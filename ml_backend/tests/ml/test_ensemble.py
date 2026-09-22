import pytest
from app.ml.ensemble.voting import VotingEnsemble, ModelVote

def test_ensemble_voting():
    ensemble = VotingEnsemble()
    votes = [
        ModelVote(model_name='m1', risk_score=0.8, confidence=0.85, risk_level='high'),
        ModelVote(model_name='m2', risk_score=0.75, confidence=0.80, risk_level='high'),
    ]
    pred = ensemble.combine(votes)
    assert pred is not None
    assert pred.risk_score > 0.7
