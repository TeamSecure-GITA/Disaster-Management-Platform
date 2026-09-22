import pytest
from app.analytics.kpi.evacuation import calculate_evacuation_kpis
from app.analytics.kpi.response import ResponseKPICalculator

def test_evacuation_kpi():
    kpi = calculate_evacuation_kpis(target_population=1000, evacuated_count=650, transit_times=[35.0, 45.0], corridor_utilizations=[0.75, 0.90])
    assert kpi.clearance_percentage == 65.0
    assert kpi.bottleneck_severity_index > 0

def test_response_kpi():
    calc = ResponseKPICalculator()
    rep = calc.calculate_from_records([])
    assert rep is not None
