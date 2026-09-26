from output.chart import ChartOutputBuilder

def test_chart_builder():
    builder = ChartOutputBuilder()
    chart = builder.build_water_level_chart(["10:00", "11:00"], [5.2, 5.8])
    assert chart.chart_type == "line"
