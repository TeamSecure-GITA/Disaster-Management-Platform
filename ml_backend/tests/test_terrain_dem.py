"""
Unit and integration tests for DEM Topographic & Geotechnical Derivations.
Tests Horn's finite-difference kernel, curvature solvers, road/stream proximity,
lithology, LULC, grid cell generation, corridor profiles, and API endpoints.
"""

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.geospatial.terrain_dem import (
    derive_topographic_indices,
    get_terrain_at_coordinates,
    get_grid_terrain,
    get_corridor_terrain_profile,
    calculate_enhanced_lsi,
)
from app.api.v1.terrain import router as terrain_router
from app.api.v1.prediction.landslide import router as landslide_router

app = FastAPI()
app.include_router(terrain_router)
app.include_router(landslide_router)
client = TestClient(app)


def test_horn_kernel_flat_surface():
    flat_z = {
        "nw": 500.0, "n": 500.0, "ne": 500.0,
        "w":  500.0, "c": 500.0, "e":  500.0,
        "sw": 500.0, "s": 500.0, "se": 500.0,
    }
    result = derive_topographic_indices(flat_z, spacing_meters=30.0)
    assert result["slope_deg"] == 0.0
    assert result["aspect_direction"] == "FLAT"
    assert result["elevation_meters"] == 500
    assert result["curvature"]["general_curvature"] == 0.0


def test_horn_kernel_inclined_slope():
    # 30m spacing with 30m rise to the North -> ~45 degree slope facing South
    inclined_z = {
        "nw": 530.0, "n": 530.0, "ne": 530.0,
        "w":  500.0, "c": 500.0, "e":  500.0,
        "sw": 470.0, "s": 470.0, "se": 470.0,
    }
    result = derive_topographic_indices(inclined_z, spacing_meters=30.0)
    assert 40.0 < result["slope_deg"] < 50.0
    assert result["aspect_direction"] in ("S", "SW", "SE")


def test_curvature_derivation():
    concave_z = {
        "nw": 520.0, "n": 525.0, "ne": 520.0,
        "w":  510.0, "c": 495.0, "e":  510.0,
        "sw": 480.0, "s": 485.0, "se": 480.0,
    }
    result = derive_topographic_indices(concave_z, spacing_meters=30.0)
    assert "profile_curvature" in result["curvature"]
    assert "planform_curvature" in result["curvature"]
    assert isinstance(result["curvature"]["profile_curvature"], float)


def test_point_terrain_sikkim_teesta():
    lat = 27.33
    lng = 88.61
    terrain = get_terrain_at_coordinates(lat, lng)

    assert "GRID" in terrain["grid_id"]
    assert terrain["elevation_meters"] > 400
    assert terrain["slope_deg"] > 15.0
    assert terrain["distance_to_roads_meters"] < 2000
    assert "NH-10" in terrain["nearest_road_name"]
    assert "Teesta" in terrain["nearest_stream_name"]
    assert "Daling" in terrain["lithology"]["formation"]
    assert terrain["lithology"]["strength_class"] == "LOW"
    assert "classification" in terrain["land_cover"]


def test_point_terrain_nagaland_dzudza():
    lat = 25.70
    lng = 94.02
    terrain = get_terrain_at_coordinates(lat, lng)

    assert "Disang" in terrain["lithology"]["formation"]
    assert terrain["lithology"]["strength_class"] == "VERY_LOW"
    assert "NH-29" in terrain["nearest_road_name"]
    assert "Dzüdza" in terrain["nearest_stream_name"]


def test_grid_terrain_cells_generation():
    grid = get_grid_terrain(
        min_lng=88.48, min_lat=27.20,
        max_lng=88.58, max_lat=27.30,
        resolution_meters=500.0,
    )
    assert grid["type"] == "FeatureCollection"
    assert grid["total_cells"] > 0
    first = grid["features"][0]
    assert first["geometry"]["type"] == "Polygon"
    assert "slope_deg" in first["properties"]
    assert "curvature" in first["properties"]
    assert "distance_to_roads_meters" in first["properties"]
    assert "distance_to_streams_meters" in first["properties"]
    assert "lithology" in first["properties"]
    assert "land_cover" in first["properties"]


def test_corridor_terrain_profile_nh10():
    profile = get_corridor_terrain_profile("NH-10")
    assert profile["corridor_id"] == "NH-10"
    assert len(profile["profile"]) > 3
    assert profile["total_length_km"] > 10.0
    assert profile["max_slope_deg"] > 20.0
    assert "elevation_meters" in profile["profile"][0]
    assert "slope_deg" in profile["profile"][0]


def test_calculate_enhanced_lsi():
    result = calculate_enhanced_lsi(
        rainfall_24h=180.0,
        threshold=120.0,
        soil_saturation=92.0,
        lat=27.33,
        lng=88.61,
    )
    assert result["lsi_score"] >= 0.65
    assert result["risk_level"] in ("High", "Critical")
    assert result["dem_derived"] is True
    assert result["derived_terrain"]["slope_deg"] > 15.0


def test_api_terrain_point():
    resp = client.get("/terrain/point?lat=27.33&lng=88.61")
    assert resp.status_code == 200
    data = resp.json()
    assert data["success"] is True
    assert "topography" in data
    assert "slope_deg" in data["topography"]
    assert "aspect_direction" in data["topography"]
    assert "curvature" in data["topography"]
    assert "proximity" in data
    assert "geology" in data
    assert "ecology" in data


def test_api_terrain_grid():
    resp = client.get("/terrain/grid?bbox=88.48,27.20,88.58,27.30&resolution=500")
    assert resp.status_code == 200
    data = resp.json()
    assert data["success"] is True
    assert data["type"] == "FeatureCollection"
    assert len(data["features"]) > 0


def test_api_terrain_sources():
    resp = client.get("/terrain/sources")
    assert resp.status_code == 200
    data = resp.json()
    assert data["success"] is True
    source_ids = [s["id"] for s in data["sources"]]
    assert "Copernicus GLO-30" in source_ids
    assert "CartoDEM 30m" in source_ids


def test_api_landslide_predict_auto_derives_slope_from_dem():
    # Do not pass slope_angle_deg or elevation_m; pass coordinates
    resp = client.post(
        "/landslide/predict",
        json={
            "rainfall_24h_mm": 150.0,
            "soil_moisture_pct": 88.0,
            "latitude": 27.33,
            "longitude": 88.61,
        },
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["success"] is True
    assert data["dem_derived"] is True
    assert data["derived_terrain"] is not None
    assert data["derived_terrain"]["slope_deg"] > 0
