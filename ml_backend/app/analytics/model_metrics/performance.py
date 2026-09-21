"""
ML model performance evaluation for hazard prediction and disaster response models.

Calculates classification metrics (accuracy, F1, precision, recall, confusion matrix),
regression metrics (MAE, RMSE, R²), and spatial intersection-over-union (IoU) scores.
"""

from __future__ import annotations

import math
import statistics
from collections import defaultdict
from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Sequence, Tuple


@dataclass
class ClassificationReport:
    """Standard classification performance report."""

    accuracy: float
    balanced_accuracy: float
    macro_precision: float
    macro_recall: float
    macro_f1: float
    weighted_f1: float
    confusion_matrix: Dict[str, Dict[str, int]]
    per_class_metrics: Dict[str, Dict[str, float]]

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class RegressionReport:
    """Standard regression performance report for continuous hazard indicators."""

    mae: float
    mse: float
    rmse: float
    mape: float
    r_squared: float
    max_error: float
    mean_bias: float

    def to_dict(self) -> Dict[str, Any]:
        return {
            "mae": round(self.mae, 4),
            "mse": round(self.mse, 4),
            "rmse": round(self.rmse, 4),
            "mape": round(self.mape, 2),
            "r_squared": round(self.r_squared, 4),
            "max_error": round(self.max_error, 4),
            "mean_bias": round(self.mean_bias, 4),
        }


@dataclass
class SpatialOverlapMetrics:
    """Intersection-over-Union (IoU) and Dice coefficient for flood or fire perimeter masks."""

    iou: float
    dice_coefficient: float
    true_positive_pixels: int
    false_positive_pixels: int
    false_negative_pixels: int

    def to_dict(self) -> Dict[str, Any]:
        return {
            "iou": round(self.iou, 4),
            "dice_coefficient": round(self.dice_coefficient, 4),
            "true_positive_pixels": self.true_positive_pixels,
            "false_positive_pixels": self.false_positive_pixels,
            "false_negative_pixels": self.false_negative_pixels,
        }


class ModelPerformanceEvaluator:
    """
    Evaluates ML model inference accuracy across disaster categorization and continuous regression.
    """

    @staticmethod
    def evaluate_classification(
        y_true: Sequence[Any],
        y_pred: Sequence[Any],
    ) -> ClassificationReport:
        """
        Compute multiclass confusion matrix, precision, recall, and F1 scores.
        """
        if len(y_true) != len(y_pred):
            raise ValueError("y_true and y_pred must have equal length")

        n = len(y_true)
        if n == 0:
            return ClassificationReport(
                accuracy=0.0,
                balanced_accuracy=0.0,
                macro_precision=0.0,
                macro_recall=0.0,
                macro_f1=0.0,
                weighted_f1=0.0,
                confusion_matrix={},
                per_class_metrics={},
            )

        labels = sorted(list(set(str(yt) for yt in y_true) | set(str(yp) for yp in y_pred)))
        cm: Dict[str, Dict[str, int]] = {l1: {l2: 0 for l2 in labels} for l1 in labels}

        correct = 0
        for yt, yp in zip(y_true, y_pred):
            s_true, s_pred = str(yt), str(yp)
            cm[s_true][s_pred] += 1
            if s_true == s_pred:
                correct += 1

        accuracy = correct / n

        per_class: Dict[str, Dict[str, float]] = {}
        precisions = []
        recalls = []
        f1s = []
        supports = []

        for label in labels:
            tp = cm[label][label]
            fp = sum(cm[other][label] for other in labels if other != label)
            fn = sum(cm[label][other] for other in labels if other != label)
            support = sum(cm[label][other] for other in labels)

            prec = tp / (tp + fp) if (tp + fp) > 0 else 0.0
            rec = tp / (tp + fn) if (tp + fn) > 0 else 0.0
            f1 = (2 * prec * rec) / (prec + rec) if (prec + rec) > 0 else 0.0

            precisions.append(prec)
            recalls.append(rec)
            f1s.append(f1)
            supports.append(support)

            per_class[label] = {
                "precision": round(prec, 4),
                "recall": round(rec, 4),
                "f1": round(f1, 4),
                "support": support,
            }

        macro_p = statistics.mean(precisions) if precisions else 0.0
        macro_r = statistics.mean(recalls) if recalls else 0.0
        macro_f = statistics.mean(f1s) if f1s else 0.0
        weighted_f = (
            sum(f * s for f, s in zip(f1s, supports)) / sum(supports)
            if sum(supports) > 0
            else 0.0
        )

        return ClassificationReport(
            accuracy=round(accuracy, 4),
            balanced_accuracy=round(macro_r, 4),
            macro_precision=round(macro_p, 4),
            macro_recall=round(macro_r, 4),
            macro_f1=round(macro_f, 4),
            weighted_f1=round(weighted_f, 4),
            confusion_matrix=cm,
            per_class_metrics=per_class,
        )

    @staticmethod
    def evaluate_regression(
        y_true: Sequence[float],
        y_pred: Sequence[float],
    ) -> RegressionReport:
        """
        Compute standard regression error metrics (MAE, RMSE, MAPE, R²).
        """
        if len(y_true) != len(y_pred):
            raise ValueError("y_true and y_pred must have equal length")

        n = len(y_true)
        if n == 0:
            return RegressionReport(0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0)

        errors = [yp - yt for yt, yp in zip(y_true, y_pred)]
        abs_errors = [abs(e) for e in errors]
        sq_errors = [e * e for e in errors]

        mae = sum(abs_errors) / n
        mse = sum(sq_errors) / n
        rmse = math.sqrt(mse)
        mean_bias = sum(errors) / n
        max_err = max(abs_errors)

        # MAPE
        valid_mape = [abs((yt - yp) / yt) for yt, yp in zip(y_true, y_pred) if abs(yt) > 1e-6]
        mape = (sum(valid_mape) / len(valid_mape) * 100.0) if valid_mape else 0.0

        # R-squared
        mean_true = statistics.mean(y_true)
        ss_tot = sum((yt - mean_true) ** 2 for yt in y_true)
        ss_res = sum(sq_errors)
        r2 = 1.0 - (ss_res / ss_tot) if ss_tot > 0 else 1.0
        r2 = max(-1.0, min(1.0, r2))

        return RegressionReport(
            mae=mae,
            mse=mse,
            rmse=rmse,
            mape=mape,
            r_squared=r2,
            max_error=max_err,
            mean_bias=mean_bias,
        )

    @staticmethod
    def evaluate_spatial_overlap(
        mask_true: Sequence[int],
        mask_pred: Sequence[int],
    ) -> SpatialOverlapMetrics:
        """
        Compute IoU (Jaccard Index) and Dice Coefficient for binary hazard footprint grids.
        """
        tp = sum(1 for yt, yp in zip(mask_true, mask_pred) if yt == 1 and yp == 1)
        fp = sum(1 for yt, yp in zip(mask_true, mask_pred) if yt == 0 and yp == 1)
        fn = sum(1 for yt, yp in zip(mask_true, mask_pred) if yt == 1 and yp == 0)

        denom_iou = tp + fp + fn
        iou = tp / denom_iou if denom_iou > 0 else 1.0

        denom_dice = (2 * tp) + fp + fn
        dice = (2 * tp) / denom_dice if denom_dice > 0 else 1.0

        return SpatialOverlapMetrics(
            iou=iou,
            dice_coefficient=dice,
            true_positive_pixels=tp,
            false_positive_pixels=fp,
            false_negative_pixels=fn,
        )
