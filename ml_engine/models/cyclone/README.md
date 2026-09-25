# Tropical Cyclone Intensity & Storm Surge Model

## Overview
Estimates tropical cyclone intensity categories (Saffir-Simpson / IMD equivalent) and coastal storm surge risks from central pressure, wind velocity, and radial geometry.

## Features
- `wind_speed`: Maximum sustained surface wind speed (km/h).
- `central_pressure`: Central barometric pressure (hPa).
- `storm_surge`: Coastal surge amplitude (m).
- `radius_max_wind`: Radius of maximum winds (km).
- `movement_speed`: Forward propagation velocity (km/h).
- `cyclone_power_dissipation_index`: Kinetic power metric ($v^3$).

## Target
- `cyclone_category`: Integer category from 1 to 5.
