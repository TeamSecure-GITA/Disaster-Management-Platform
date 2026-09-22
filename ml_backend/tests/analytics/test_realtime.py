import pytest
from app.analytics.realtime.aggregation import aggregate_realtime_metrics
from app.analytics.realtime.streams import stream_buffer

def test_realtime_aggregations():
    res = aggregate_realtime_metrics([10.0, 20.0, 30.0], window_seconds=60)
    assert res is not None
    assert 'count' in res or 'mean' in res or isinstance(res, dict)

def test_stream_buffer():
    pt = stream_buffer.push('sensor_test', 'rainfall', 15.2)
    assert pt.value == 15.2
    latest = stream_buffer.get_latest('sensor_test', count=5)
    assert len(latest) >= 1
