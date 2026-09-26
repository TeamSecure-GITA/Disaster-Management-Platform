from __future__ import annotations
import numpy as np

class VotingEnsemble:
    def __init__(self, voting: str = "soft") -> None:
        self.voting = voting

    def combine_predictions(self, model_probs: list[np.ndarray]) -> np.ndarray:
        return np.mean(model_probs, axis=0)
