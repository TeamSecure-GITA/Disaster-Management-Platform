from tools.weather import CurrentWeatherTool, WeatherForecastTool, SevereWeatherTool

def test_weather_tools():
    assert CurrentWeatherTool().execute().success is True
    assert WeatherForecastTool().execute().success is True
    assert SevereWeatherTool().execute().success is True
