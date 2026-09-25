from __future__ import annotations

from typing import Any, Literal
import numpy as np
import pandas as pd
from sklearn.model_selection import KFold, StratifiedKFold, TimeSeriesSplit
from sklearn.metrics import accuracy_score, f1_score, precision_score, recall_score
from .base_trainer import BaseTrainer


class CrossValidator:
    """Performs rigorous cross-validation (K-Fold, Stratified, or Time-Series) for hazard models."""

    def __init__(
        self,
        trainer: BaseTrainer,
        n_splits: int = 5,
        strategy: Literal["stratified", "kfold", "time_series"] = "stratified",
        shuffle: bool = True,
    ) -> None:
        self.trainer = trainer
        self.n_splits = n_splits
        self.strategy = strategy
        self.shuffle = shuffle

    def evaluate(self, df: pd.DataFrame) -> dict[str, Any]:
        target_col = self.trainer.config.target_column
        features = self.trainer.config.feature_columns
        if not features:
            features = [c for c in df.select_dtypes(include=["number"]).columns if c != target_col]

        X = df[features].fillna(0.0).values
        y = df[target_col].values

        if self.strategy == "stratified":
            cv = StratifiedKFold(
                n_splits=self.n_splits, shuffle=self.shuffle, random_state=self.trainer.config.random_state
            )
            splits = cv.split(X, y)
        elif self.strategy == "time_series":
            cv = TimeSeriesSplit(n_splits=self.n_splits)
            splits = cv.split(X)
        else:
            cv = KFold(
                n_splits=self.n_splits, shuffle=self.shuffle, random_state=self.trainer.config.random_state
            )
            splits = cv.split(X)

        fold_metrics: list[dict[str, float]] = []

        for train_idx, val_idx in splits:
            X_tr, X_val = X[train_idx], X[val_idx]
            y_tr, y_val = y[train_idx], y[val_idx]

            model = self.trainer.build_model()
            model.fit(X_tr, y_tr)
            preds = model.predict(X_val)

            fold_metrics.append({
                "accuracy": float(accuracy_score(y_val, preds)),
                "precision": float(precision_score(y_val, preds, zero_division=0, average="weighted")),
                "recall": float(recall_score(y_val, preds, zero_division=0, average="weighted")),
                "f1": float(f1_score(y_val, preds, zero_division=0, average="weighted")),
            })

        # Calculate mean and standard deviation across all folds
        summary = {}
        for metric_name in ["accuracy", "precision", "recall", "f1"]:
            vals = [m[metric_name] for m in fold_metrics]
            summary[f"mean_{metric_name}"] = float(np.mean(vals))
            summary[f"std_{metric_name}"] = float(np.std(vals))

        return {
            "strategy": self.strategy,
            "n_splits": self.n_splits,
            "folds": fold_metrics,
            "summary": summary,
        }
