const request = require("supertest");
const app = require("../app");
const weatherService = require("../services/weatherService");
const riskEngineService = require("../services/riskEngineService");
const nerLandslideService = require("../services/nerLandslideService");

describe("🌧️ Weather & Rainfall Time-Series Ingestion Architecture", () => {
  beforeAll(async () => {
    // Populate rainfall data for testing
    await weatherService.updateWeatherData();
  });

  describe("1. IMD Classification & Rainfall Categorization", () => {
    it("should correctly classify rainfall amounts according to IMD standards", () => {
      expect(weatherService.classifyImdRainfall(0)).toBe("No Rain");
      expect(weatherService.classifyImdRainfall(1.5)).toBe("Very Light Rain");
      expect(weatherService.classifyImdRainfall(12.0)).toBe("Light Rain");
      expect(weatherService.classifyImdRainfall(45.0)).toBe("Moderate Rain");
      expect(weatherService.classifyImdRainfall(85.0)).toBe("Heavy Rain");
      expect(weatherService.classifyImdRainfall(150.0)).toBe("Very Heavy Rain");
      expect(weatherService.classifyImdRainfall(220.0)).toBe("Extremely Heavy Rain");
    });

    it("should expose official IMD data-access terms and gap-filling strategy", () => {
      const terms = weatherService.getImdDataTerms();
      expect(terms).toBeDefined();
      expect(terms.compliancePolicy).toContain("NDSAP");
      expect(terms.termsSummary.stationData.status).toContain("Restricted");
      expect(terms.gapFillingStrategy.primaryProvider).toContain("Open-Meteo");
      expect(terms.gapFillingStrategy.timeSeriesMetrics).toEqual(
        expect.arrayContaining([
          "1h rolling total",
          "3h rolling total",
          "24h rolling total",
          "72h antecedent saturation",
        ])
      );
    });
  });

  describe("2. Time-Series Ingestion & NER Stations", () => {
    it("should have monitored stations spanning the 8 NER states and key corridors", () => {
      const stations = weatherService.NER_STATIONS;
      expect(stations.length).toBeGreaterThanOrEqual(8);

      const states = stations.map((s) => s.state);
      expect(states).toContain("Sikkim");
      expect(states).toContain("Meghalaya");
      expect(states).toContain("Assam");
      expect(states).toContain("Nagaland");
      expect(states).toContain("Arunachal Pradesh");

      const corridors = stations.map((s) => s.corridor).filter(Boolean);
      expect(corridors).toContain("NH-10");
      expect(corridors).toContain("NH-6");
      expect(corridors).toContain("NH-29");
    });

    it("should ingest rainfall data and compute rolling 1h, 3h, 24h, 72h totals", async () => {
      const summary = weatherService.getNerRainfallSummary();
      expect(summary).toBeDefined();
      expect(summary.stations.length).toBeGreaterThan(0);

      const firstStation = summary.stations[0];
      expect(firstStation.rolling).toBeDefined();
      expect(typeof firstStation.rolling.rain1h).toBe("number");
      expect(typeof firstStation.rolling.rain3h).toBe("number");
      expect(typeof firstStation.rolling.rain24h).toBe("number");
      expect(typeof firstStation.rolling.rain72h).toBe("number");

      expect(firstStation.forecast).toBeDefined();
      expect(typeof firstStation.forecast.rainNext24h).toBe("number");
      expect(Array.isArray(firstStation.forecast.hourlyForecast)).toBe(true);
      expect(Array.isArray(firstStation.hourlyHistory)).toBe(true);
      expect(firstStation.riskIndicators).toBeDefined();
    });

    it("should retrieve historical time-series for a specific station", async () => {
      const records = await weatherService.getRainfallTimeSeries({
        stationId: "NER-SK-01",
        hours: 72,
      });
      expect(Array.isArray(records)).toBe(true);
      expect(records.length).toBeGreaterThan(0);
      expect(records[0].stationId).toBe("NER-SK-01");
    });

    it("should gracefully return current weather without throwing even if WEATHER_API_KEY is not set", async () => {
      delete process.env.WEATHER_API_KEY;
      const weather = await weatherService.getWeather(25.5788, 91.8933);
      expect(weather).toBeDefined();
      expect(weather.main).toBeDefined();
      expect(typeof weather.main.temp).toBe("number");
      expect(typeof weather.main.humidity).toBe("number");
      expect(weather.weather).toBeDefined();
    });
  });

  describe("3. Risk Engine Integration with Rainfall Telemetry", () => {
    it("should feed rainfall telemetry into RiskEngineService", async () => {
      const summary = weatherService.getNerRainfallSummary();
      riskEngineService.feedRainfallTelemetry(summary.stations);

      const riskSummary = await riskEngineService.getSummary();
      expect(riskSummary.rainfallTelemetryLinked).toBe(true);
      expect(riskSummary.cachedStationsCount).toBeGreaterThan(0);
    });

    it("should dynamically elevate risk factors and include rainfallMetrics in assessRisk", async () => {
      // Assess risk for Cherrapunji/East Khasi Hills (high precipitation hotspot)
      const assessment = await riskEngineService.assessRisk({
        latitude: 25.2702,
        longitude: 91.7323,
        hazardType: "landslide",
      });

      expect(assessment).toBeDefined();
      expect(assessment.overallRiskScore).toBeGreaterThanOrEqual(5);
      expect(assessment.rainfallMetrics).toBeDefined();
      expect(assessment.rainfallMetrics.stationId).toBe("NER-ML-01");
      expect(typeof assessment.rainfallMetrics.rain24h).toBe("number");
      expect(typeof assessment.rainfallMetrics.rain72h).toBe("number");
      expect(assessment.rainfallMetrics.imdIntensityCategory).toBeDefined();
    });

    it("should update nerLandslideService state overview from rainfall time-series", () => {
      nerLandslideService.updateStateRainfallFromTimeseries({
        state: "Sikkim",
        rain24h: 175.5,
        rain72h: 320.0,
        rain1h: 22.0,
        imdBand: "Very Heavy Rain",
      });

      const overview = nerLandslideService.getOverview();
      return overview.then((data) => {
        const sikkim = data.states.find((s) => s.state === "Sikkim");
        expect(sikkim).toBeDefined();
        expect(sikkim.currentRainfall24hMm).toBe(175.5);
        expect(sikkim.currentRainfall72hMm).toBe(320.0);
        expect(sikkim.imdBand).toContain("Very Heavy Rain");
      });
    });
  });

  describe("4. API Endpoints for Rainfall Time-Series & Weather", () => {
    it("GET /api/weather/ner-rainfall returns live 8-state rainfall overview", async () => {
      const res = await request(app).get("/api/weather/ner-rainfall");
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.monitoredStationsCount).toBeGreaterThanOrEqual(8);
      expect(Array.isArray(res.body.stations)).toBe(true);
      expect(Array.isArray(res.body.states)).toBe(true);
    });

    it("GET /api/weather/current returns current conditions for coordinate", async () => {
      const res = await request(app)
        .get("/api/weather/current")
        .query({ lat: 26.1445, lon: 91.7362 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.coord).toBeDefined();
      expect(res.body.data.main.temp).toBeDefined();
    });

    it("GET /api/weather/rainfall-series returns time-series points", async () => {
      const res = await request(app)
        .get("/api/weather/rainfall-series")
        .query({ stationId: "NER-SK-01", hours: 48 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.series)).toBe(true);
    });

    it("GET /api/weather/imd-terms returns IMD data policy & gap filling architecture", async () => {
      const res = await request(app).get("/api/weather/imd-terms");
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.agency).toContain("India Meteorological Department");
      expect(res.body.data.gapFillingStrategy.primaryProvider).toContain("Open-Meteo");
    });

    it("POST /api/weather/sync-now triggers on-demand rainfall ingestion", async () => {
      const res = await request(app).post("/api/weather/sync-now");
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.result.updatedCount).toBeGreaterThan(0);
    });
  });
});
