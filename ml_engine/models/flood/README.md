# Flood Hazard & Riverine Inundation Model

## Overview
Predicts riverine flood stages and inundation emergency alert levels based on river gauge telemetry and catchment rainfall accumulation.

## Features
- `water_level`: River stage height (meters).
- `flow_rate`: Velocity (m/s).
- `discharge`: Discharge ($m^3/s$).
- `rainfall_mm`: Immediate rainfall.
- `rain_rolling_6h`: 6-hour rolling accumulation.
- `rain_rolling_24h`: 24-hour rolling accumulation.
- `flood_potential_index`: Riverine stage vs rainfall compound index.
- `topographic_wetness_index`: Catchment saturation index.

## Target
- `flood_alert_level`: Multi-class alert tier (`0` = Normal, `1` = Advisory, `2` = Warning, `3` = Evacuation).
