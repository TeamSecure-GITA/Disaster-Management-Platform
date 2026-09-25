# Sensor Anomaly & Failure Detector

## Overview
Unsupervised anomaly detection model trained on multi-sensor telemetry streams to isolate sensor glitches, hardware failures, tampering, or abrupt physical anomalies prior to hazard estimation.

## Architecture
- Isolation Forest with adaptive contamination thresholding.
- Fallback to Local Outlier Factor (LOF).

## Inputs
- Standardized multi-sensor numerical telemetry vectors.

## Outputs
- `is_anomaly`: Boolean (`True` for anomaly).
- `anomaly_score`: Continuous anomaly severity score.
