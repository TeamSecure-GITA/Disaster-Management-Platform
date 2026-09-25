# Disaster Management Platform — ML Engine

A high-reliability Machine Learning and Statistical Modeling subsystem for multi-hazard disaster early warning, susceptibility mapping, and predictive emergency intelligence.

---

## Architecture Overview

The `ml-engine` provides a complete end-to-end operational lifecycle:
1. **Ingestion (`src/ingestion/`)**: Multi-modal sensor and external API ingestion adapters (weather, rainfall, river stage, soil moisture, geotechnical telemetry, seismic acceleration, Earth observation satellites, drone surveys, wildfire FRP, cyclone dynamics, and verified citizen reports).
2. **Preprocessing (`src/preprocessing/`)**: Robust data cleaning, missing value imputation, physical outlier boundary clipping, categorical encoding, and domain validation.
3. **Feature Engineering (`src/feature_engineering/`)**: Geospatial 3D projections, cyclical temporal features, Antecedent Precipitation Index (API), Topographic Wetness Index (TWI), Gutenberg-Richter energy release, and compounding hazard indices.
4. **Training (`src/training/`)**: Domain trainers for Landslides, Riverine Floods, Tropical Cyclones, Sensor Anomalies, Environmental Time-Series Forecasting, and Cascading Multi-Hazards.
5. **Evaluation (`src/evaluation/`)**: Meteorological early warning verification metrics (Threat Score/CSI, Probability of Detection, False Alarm Ratio, Equitable Threat Score, and Brier Score).
6. **Calibration (`src/calibration/`)**: Post-processing calibration (Temperature Scaling, Platt Scaling, Isotonic Regression) and Expected Calibration Error (ECE) reliability diagnostics.
7. **Explainability (`src/explainability/`)**: Global feature importance, SHAP attributions, permutation importance, and plain-English narrative decision factor explanations.
8. **Pipelines (`pipelines/`)**: Modular workflows for training, dataset validation, model evaluation, packaging, and stage promotion.

---

## Directory Layout

```text
ml-engine/
├── configs/          # Unified YAML configs (datasets, features, models, training, etc.)
├── datasets/         # Raw telemetry streams, validation schemas, and test benchmarks
├── experiments/      # Experiment tracking logs, metrics reports, and model comparisons
├── model_registry/   # Multi-stage lifecycle registry (development, staging, production)
├── models/           # Domain model checkpoints, artifacts, and architecture configs
├── notebooks/        # Exploratory data analysis and model prototyping notebooks
├── pipelines/        # Production automation pipelines (training, validation, deployment)
├── scripts/          # Operational CLI utilities
├── src/              # Core reusable ML framework
└── tests/            # Test suite (unit, integration, and property tests)
```

---

## Quickstart

### Installation
```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
pip install -r requirements-dev.txt
```

### Running Tests
```bash
pytest tests/ -v
```

### Training Hazard Models
```bash
python scripts/train.py --hazard landslide
python scripts/train.py --all
```

### Model Evaluation & Calibration Audit
```bash
python scripts/evaluate.py --hazard landslide
python scripts/calibrate.py --hazard landslide
```
