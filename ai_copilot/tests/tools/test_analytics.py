from tools.analytics import DashboardTool, TrendsTool, StatisticsTool, KPITool

def test_analytics_tools():
    assert DashboardTool().execute().success is True
    assert TrendsTool().execute().success is True
    assert StatisticsTool().execute().success is True
    assert KPITool().execute().success is True
