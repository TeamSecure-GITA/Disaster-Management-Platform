# Environmental Time-Series Forecasting Model

## Overview
Continuous regression forecaster modeling future environmental variables (such as 6-hour rainfall forecasts, river stages, and reservoir level trends) using autoregressive lags and cyclical temporal features.

## Architecture
- Gradient Boosting Regressor with Huber loss and recursive multi-step forecasting.

## Evaluation Metrics
- Mean Absolute Error (MAE)
- Root Mean Squared Error (RMSE)
- Mean Directional Accuracy (MDA)
- Symmetric Mean Absolute Percentage Error (sMAPE)
