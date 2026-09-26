from __future__ import annotations
import numpy as np

class UncertaintyPropagator:
    def monte_carlo_propagate(self, base_inputs: np.ndarray, noise_std: float = 0.05, n_samples: int = 100) -> dict:
        samples = [base_inputs + np.random.normal(0, noise_std, base_inputs.shape) for _ in range(n_samples)]
        return {"mean": float(np.mean(samples)), "std": float(np.std(samples))}
