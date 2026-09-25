from __future__ import annotations

import pickle
from pathlib import Path
from typing import Any
import pandas as pd

from .cleaning import DataCleaner
from .missing_values import MissingValueHandler
from .outliers import OutlierDetector
from .encoding import CategoricalEncoder
from .normalization import FeatureNormalizer
from .validation import DataValidator, ValidationReport


class PreprocessingPipeline:
    """End-to-end preprocessing pipeline combining cleaning, imputation, outlier handling, encoding, and scaling."""

    def __init__(
        self,
        cleaner: DataCleaner | None = None,
        imputer: MissingValueHandler | None = None,
        outlier_detector: OutlierDetector | None = None,
        encoder: CategoricalEncoder | None = None,
        normalizer: FeatureNormalizer | None = None,
        validator: DataValidator | None = None,
    ) -> None:
        self.cleaner = cleaner or DataCleaner()
        self.imputer = imputer or MissingValueHandler()
        self.outlier_detector = outlier_detector or OutlierDetector()
        self.encoder = encoder or CategoricalEncoder()
        self.normalizer = normalizer or FeatureNormalizer()
        self.validator = validator or DataValidator()
        self.is_fitted = False

    def validate(self, df: pd.DataFrame) -> ValidationReport:
        """Run validation rules on raw data."""
        return self.validator.validate(df)

    def fit(self, df: pd.DataFrame) -> PreprocessingPipeline:
        """Fit all stateful transformers sequentially."""
        df_clean = self.cleaner.clean(df)
        self.imputer.fit(df_clean)
        df_imputed = self.imputer.transform(df_clean)

        self.outlier_detector.fit(df_imputed)
        df_clipped = self.outlier_detector.transform(df_imputed)

        self.encoder.fit(df_clipped)
        df_encoded = self.encoder.transform(df_clipped)

        self.normalizer.fit(df_encoded)
        self.is_fitted = True
        return self

    def transform(self, df: pd.DataFrame) -> pd.DataFrame:
        """Transform new data through the fitted pipeline."""
        if not self.is_fitted:
            raise RuntimeError("Pipeline must be fitted before calling transform.")

        df_clean = self.cleaner.clean(df)
        df_imputed = self.imputer.transform(df_clean)
        df_clipped = self.outlier_detector.transform(df_imputed)
        df_encoded = self.encoder.transform(df_clipped)
        df_scaled = self.normalizer.transform(df_encoded)
        return df_scaled

    def fit_transform(self, df: pd.DataFrame) -> pd.DataFrame:
        """Fit pipeline and return transformed data."""
        return self.fit(df).transform(df)

    def save(self, filepath: str | Path) -> None:
        """Persist fitted pipeline to disk."""
        filepath = Path(filepath)
        filepath.parent.mkdir(parents=True, exist_ok=True)
        with open(filepath, "wb") as f:
            pickle.dump(self, f)

    @classmethod
    def load(cls, filepath: str | Path) -> PreprocessingPipeline:
        """Load fitted pipeline from disk."""
        with open(filepath, "rb") as f:
            return pickle.load(f)
