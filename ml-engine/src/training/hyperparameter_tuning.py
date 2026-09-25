from __future__ import annotations

from typing import Any, Literal
import pandas as pd
from sklearn.model_selection import GridSearchCV, RandomizedSearchCV
from .base_trainer import BaseTrainer


class HyperparameterTuner:
    """Automates grid and randomized cross-validated hyperparameter optimization."""

    def __init__(
        self,
        trainer: BaseTrainer,
        param_grid: dict[str, list[Any]],
        search_type: Literal["grid", "random"] = "grid",
        n_iter: int = 20,
        cv: int = 5,
        scoring: str = "f1_weighted",
        n_jobs: int = -1,
    ) -> None:
        self.trainer = trainer
        self.param_grid = param_grid
        self.search_type = search_type
        self.n_iter = n_iter
        self.cv = cv
        self.scoring = scoring
        self.n_jobs = n_jobs
        self.best_params_: dict[str, Any] = {}
        self.best_score_: float = 0.0

    def tune(self, df: pd.DataFrame) -> dict[str, Any]:
        """Execute hyperparameter search and update trainer model."""
        X_train, X_test, y_train, y_test = self.trainer.prepare_data(df)
        base_estimator = self.trainer.build_model()

        if self.search_type == "random":
            search = RandomizedSearchCV(
                estimator=base_estimator,
                param_distributions=self.param_grid,
                n_iter=self.n_iter,
                cv=self.cv,
                scoring=self.scoring,
                n_jobs=self.n_jobs,
                random_state=self.trainer.config.random_state,
            )
        else:
            search = GridSearchCV(
                estimator=base_estimator,
                param_grid=self.param_grid,
                cv=self.cv,
                scoring=self.scoring,
                n_jobs=self.n_jobs,
            )

        search.fit(X_train, y_train)

        self.best_params_ = search.best_params_
        self.best_score_ = float(search.best_score_)
        self.trainer.model = search.best_estimator_
        self.trainer.config.hyperparameters.update(self.best_params_)
        self.trainer.is_trained = True

        eval_metrics = self.trainer.evaluate(X_test, y_test)
        return {
            "best_params": self.best_params_,
            "best_cv_score": self.best_score_,
            "test_metrics": eval_metrics,
        }
