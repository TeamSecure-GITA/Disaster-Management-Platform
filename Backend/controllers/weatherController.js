const weatherService = require("../services/weatherService");

/**
 * Controller for Weather & Rainfall Time-Series Endpoints
 */
class WeatherController {
  /**
   * GET /api/weather/current
   * Query current weather conditions for coordinates (lat, lon)
   */
  async getCurrentWeather(req, res, next) {
    try {
      const { lat, lon, latitude, longitude } = req.query;
      const targetLat = lat || latitude || 26.1445;
      const targetLon = lon || longitude || 91.7362;

      const data = await weatherService.getWeather(targetLat, targetLon);
      res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/weather/ner-rainfall
   * Live rolling rainfall totals (1h, 3h, 24h, 72h) & forecasts across the 8 NER states
   */
  async getNerRainfall(req, res, next) {
    try {
      const summary = weatherService.getNerRainfallSummary();
      res.status(200).json({
        success: true,
        ...summary,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/weather/rainfall-series
   * Query time series records for charting (by stationId, state, hours)
   */
  async getRainfallTimeSeries(req, res, next) {
    try {
      const { stationId, state, hours = 72, limit = 100 } = req.query;
      const series = await weatherService.getRainfallTimeSeries({
        stationId,
        state,
        hours: Number(hours),
        limit: Number(limit),
      });

      res.status(200).json({
        success: true,
        count: series.length,
        series,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/weather/sync-now
   * Trigger immediate real-time ingestion of NER gridded rainfall
   */
  async syncWeatherData(req, res, next) {
    try {
      const result = await weatherService.updateWeatherData();
      res.status(200).json({
        success: true,
        message: "NER rainfall time-series ingestion completed",
        result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/weather/imd-terms
   * Official IMD data-access terms, NDSAP policy & gap-filling strategy
   */
  async getImdTerms(req, res, next) {
    try {
      const terms = weatherService.getImdDataTerms();
      res.status(200).json({
        success: true,
        data: terms,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new WeatherController();
