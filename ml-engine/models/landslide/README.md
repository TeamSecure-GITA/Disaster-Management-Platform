# Landslide Susceptibility & Risk Model

## Overview
This model assesses slope failure and landslide susceptibility based on hydrological, geotechnical, and topographic telemetry.

## Features
- `slope_angle`: Slope inclination in degrees.
- `rainfall_mm`: Recent precipitation depth (mm).
- `soil_moisture`: Soil water volume (%).
- `pore_pressure`: Pore water pressure (kPa).
- `elevation`: Altitude in meters.
- `displacement`: Surface displacement (mm).
- `antecedent_precipitation_index`: Accumulated decaying rainfall index.
- `gravitational_shear_index`: $\sin(\text{slope})$.
- `landslide_susceptibility_index`: Compound hydrological-geotechnical hazard index.

## Target
- `landslide_occurred`: Binary classification (`0` = Stable, `1` = Landslide hazard).

## Artifacts
- `checkpoints/model.joblib`: Trained estimator and feature list.
- `configs/model.yaml`: Architecture and hyperparameter specification.
