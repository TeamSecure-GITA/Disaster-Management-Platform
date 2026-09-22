import pytest
from app.analytics.geospatial.distance import haversine_distance, bounding_box, find_nearest_entities
from app.analytics.geospatial.zones import create_circular_zone
from app.analytics.geospatial.spatial_analysis import calculate_spatial_density_grid, calculate_morans_i

def test_haversine_distance():
    d = haversine_distance(19.0760, 72.8777, 19.1200, 72.9100)
    assert 5.0 < d < 10.0

def test_hazard_zones():
    z = create_circular_zone('z1', 'Epicenter Zone', 'flood', 'high', 19.076, 72.877, radius_km=5.0)
    assert z.contains_point(19.076, 72.877)
    assert not z.contains_point(20.0, 75.0)

def test_spatial_analysis():
    pts = [(19.0, 72.0), (19.1, 72.1), (19.2, 72.2), (19.3, 72.3)]
    grid = calculate_spatial_density_grid(pts, grid_size=4)
    assert grid['total_points'] == 4
    moran = calculate_morans_i(pts, [1.0, 2.0, 3.0, 4.0])
    assert 'morans_i' in moran
