from __future__ import annotations

from abc import ABC, abstractmethod
from pathlib import Path
from typing import Any
import joblib
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, f1_score, precision_score, recall_score, roc_auc_score

from .training_config import TrainingConfig


class BaseTrainer(ABC):
    """Abstract base class for all hazard and anomaly model trainers."""

    def __init__(self, config: TrainingConfig | None = None) -> None:
        self.config = config or TrainingConfig()
        self.model: Any = None
        self.feature_names_: list[str] = []
        self.is_trained: bool = False

    def prepare_data(
        self, df: pd.DataFrame
    ) -> tuple[pd.DataFrame, pd.DataFrame, pd.Series, pd.Series]:
        """Split dataframe into train and test sets."""
        target_col = self.config.target_column
        if target_col not in df.columns:
            raise ValueError(f"Target column '{target_col}' not found in DataFrame.")

        features = self.config.feature_columns
        if not features:
            features = [c for c in df.select_dtypes(include=["number"]).columns if c != target_col]

        self.feature_names_ = features
        X = df[features].fillna(0.0)
        y = df[target_col]

        stratify = (
            y
            if (self.config.stratify and len(y.unique()) > 1 and y.value_counts().min() >= 2)
            else None
        )

        X_train, X_test, y_train, y_test = train_test_split(
            X,
            y,
            test_size=self.config.test_size,
            random_state=self.config.random_state,
            stratify=stratify,
        )
        return X_train, X_test, y_train, y_test

    @abstractmethod
    def build_model(self) -> Any:
        """Instantiate and return the machine learning estimator."""

    def train(self, df: pd.DataFrame) -> dict[str, Any]:
        """Train the model and return validation metrics."""
        X_train, X_test, y_train, y_test = self.prepare_data(df)
        self.model = self.build_model()
        self.model.fit(X_train, y_train)
        self.is_trained = True

        return self.evaluate(X_test, y_test)

    def evaluate(self, X_test: pd.DataFrame, y_test: pd.Series) -> dict[str, float]:
        """Evaluate trained model on test data."""
        if not self.is_trained or self.model is None:
            raise RuntimeError("Model is not trained yet.")

        y_pred = self.model.predict(X_test)
        metrics = {
            "accuracy": float(accuracy_score(y_test, y_pred)),
            "precision": float(precision_score(y_test, y_pred, zero_division=0, average="weighted")),
            "recall": float(recall_score(y_test, y_pred, zero_division=0, average="weighted")),
            "f1": float(f1_score(y_test, y_pred, zero_division=0, average="weighted")),
        }

        if hasattr(self.model, "predict_proba") and len(pd.Series(y_test).unique()) == 2:
            try:
                y_prob = self.model.predict_proba(X_test)[:, 1]
                metrics["roc_auc"] = float(roc_auc_score(y_test, y_prob))
            except Exception:
                pass

        return metrics

    def save(self, filepath: str | Path) -> None:
        """Save model and feature metadata."""
        p = Path(filepath)
        p.parent.mkdir(parents=True, exist_ok=True)
        payload = {
            "model": self.model,
            "feature_names": self.feature_names_,
            "config": self.config.to_dict(),
        }
        joblib.dump(payload, p)

    def load(self, filepath: str | Path) -> BaseTrainer:
        """Load saved model and restore state."""
        payload = joblib.load(filepath)
        self.model = payload["model"]
        self.feature_names_ = payload["feature_names"]
        self.config = TrainingConfig.from_dict(payload.get("config", {}))
        self.is_trained = True
        return self
