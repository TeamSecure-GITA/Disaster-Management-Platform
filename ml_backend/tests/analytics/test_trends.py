import pytest
from app.analytics.trends.hazard_trends import analyze_hazard_trends
from app.analytics.trends.time_series import compute_moving_average, compute_exponential_smoothing, detect_trend_slope

def test_hazard_trends():
    events = [{'hazard_type': 'flood', 'severity_score': 0.7}, {'hazard_type': 'flood', 'severity_score': 0.85}]
    trends = analyze_hazard_trends(events)
    assert 'flood' in trends

def test_time_series_trends():
    series = [10.0, 12.0, 15.0, 18.0, 22.0]
    ma = compute_moving_average(series, window_size=3)
    assert len(ma) == len(series)
    slope_info = detect_trend_slope(series)
    assert slope_info['direction'] == 'increasing'
