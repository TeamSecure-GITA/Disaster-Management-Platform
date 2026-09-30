const request = require("supertest");
const express = require("express");
const inventoryService = require("../services/landslideInventoryService");
const nerService = require("../services/nerLandslideService");
const nerRoutes = require("../routes/nerLandslideRoutes");

const app = express();
app.use(express.json());
app.use("/api/ner", nerRoutes);

describe("Geocoded Historical Landslide Inventory Service & Endpoints", () => {
  describe("landslideInventoryService core logic", () => {
    test("loads complete inventory across 8 NER states from authoritative sources", () => {
      const records = inventoryService.getInventory().events;
      expect(records.length).toBeGreaterThanOrEqual(15);

      const states = new Set(records.map(r => r.state));
      expect(states.has("Sikkim")).toBe(true);
      expect(states.has("Nagaland")).toBe(true);
      expect(states.has("Arunachal Pradesh")).toBe(true);
      expect(states.has("Assam")).toBe(true);
      expect(states.has("Meghalaya")).toBe(true);
      expect(states.has("Manipur")).toBe(true);
      expect(states.has("Mizoram")).toBe(true);
      expect(states.has("Tripura")).toBe(true);

      const sources = new Set(records.map(r => r.source));
      expect(sources.has("NASA Global Landslide Catalog")).toBe(true);
      expect(sources.has("Geological Survey of India (GSI Bhukosh)")).toBe(true);
      expect(sources.has("Border Roads Organisation (BRO)")).toBe(true);
    });

    test("filters inventory by state and source correctly", () => {
      const sikkimEvents = inventoryService.getInventory({ state: "Sikkim" }).events;
      expect(sikkimEvents.length).toBeGreaterThanOrEqual(2);
      sikkimEvents.forEach(e => expect(e.state).toBe("Sikkim"));

      const gsiEvents = inventoryService.getInventory({ source: "GSI" }).events;
      expect(gsiEvents.length).toBeGreaterThan(0);
      gsiEvents.forEach(e => expect(e.source).toContain("GSI"));

      const fatalEvents = inventoryService.getInventory({ fatalOnly: true }).events;
      expect(fatalEvents.length).toBeGreaterThan(0);
      fatalEvents.forEach(e => expect(e.fatalities).toBeGreaterThan(0));
    });

    test("aggregates historical inventory statistics", () => {
      const stats = inventoryService.getInventoryStats();
      expect(stats.totalEvents).toBeGreaterThanOrEqual(15);
      expect(stats.totalFatalities).toBeGreaterThan(0);
      expect(stats.byState["Sikkim"]).toBeGreaterThanOrEqual(2);
      expect(stats.bySource["NASA Global Landslide Catalog"]).toBeGreaterThanOrEqual(2);
      expect(stats.dateRange.earliest).toBeDefined();
      expect(stats.dateRange.latest).toBeDefined();
    });

    test("queries landslides near specific geocoded coordinates", () => {
      // Near Gangtok / Teesta Basin (27.33, 88.61)
      const nearby = inventoryService.queryHistoricalLandslidesNear(27.33, 88.61, 40);
      expect(nearby.length).toBeGreaterThan(0);
      expect(nearby[0].distanceKm).toBeLessThanOrEqual(40);
      expect(nearby[0].state).toBe("Sikkim");

      // Remote location in South India should yield 0 nearby events
      const farAway = inventoryService.queryHistoricalLandslidesNear(12.97, 77.59, 20);
      expect(farAway.length).toBe(0);
    });

    test("calculates historical landslide density and risk factors", () => {
      // DZÜDZA / Kohima hotspot
      const hotspotDensity = inventoryService.calculateHistoricalLandslideDensity(25.67, 94.10, 50);
      expect(hotspotDensity.historicalEventsCount).toBeGreaterThanOrEqual(1);
      expect(hotspotDensity.historicalRiskFactor).toBeGreaterThan(0);
      expect(hotspotDensity.densityLevel).toMatch(/High|Moderate|Critical/);
      expect(hotspotDensity.nearestEvent).not.toBeNull();

      // Low hazard area with no recorded landslides
      const flatDensity = inventoryService.calculateHistoricalLandslideDensity(26.15, 91.75, 5);
      expect(flatDensity.historicalEventsCount).toBe(0);
      expect(flatDensity.densityCategory).toContain("Low");
    });

    test("provides expanded realistic field crack observations across NER", () => {
      const obs = inventoryService.getFieldObservations();
      expect(obs.length).toBeGreaterThanOrEqual(10);
      
      const statesInObs = new Set(obs.map(o => o.state));
      expect(statesInObs.size).toBeGreaterThanOrEqual(5);

      const dimaHasaoObs = inventoryService.getFieldObservations("Assam");
      expect(dimaHasaoObs.length).toBeGreaterThan(0);
      expect(dimaHasaoObs[0].state).toBe("Assam");
    });
  });

  describe("Integration with nerLandslideService.calculateLSI", () => {
    test("auto-derives historical events and historical risk factor using lat/lng", () => {
      // Dzüdza Landslide Sector on NH-29, Nagaland (25.68, 94.06)
      const resultHotspot = nerService.calculateLSI({
        rainfall24h: 110,
        threshold: 100,
        soilSaturation: 85,
        lat: 25.68,
        lng: 94.06,
      });

      expect(resultHotspot.historicalEventsCount).toBeGreaterThan(0);
      expect(resultHotspot.historicalAnalysis).not.toBeNull();
      expect(resultHotspot.historicalAnalysis.nearestEvent.state).toBe("Nagaland");
      expect(resultHotspot.historicalAnalysis.nearestEvent.location).toMatch(/Dzüdza|Zubza/i);
      expect(resultHotspot.lsiScore).toBeGreaterThanOrEqual(0.65);
    });
  });

  describe("API Endpoints", () => {
    test("GET /api/ner/inventory returns inventory records with counts", async () => {
      const res = await request(app).get("/api/ner/inventory");
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBeGreaterThanOrEqual(15);
      expect(Array.isArray(res.body.inventory)).toBe(true);
    });

    test("GET /api/ner/inventory with filter queries returns matching items", async () => {
      const res = await request(app).get("/api/ner/inventory?state=Nagaland");
      expect(res.status).toBe(200);
      expect(res.body.count).toBeGreaterThan(0);
      res.body.inventory.forEach(item => expect(item.state).toBe("Nagaland"));
    });

    test("GET /api/ner/inventory/stats returns summarized metrics", async () => {
      const res = await request(app).get("/api/ner/inventory/stats");
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.stats.totalEvents).toBeGreaterThanOrEqual(15);
      expect(res.body.stats.byState).toBeDefined();
    });

    test("GET /api/ner/field-observations returns verified observations", async () => {
      const res = await request(app).get("/api/ner/field-observations");
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBeGreaterThanOrEqual(10);
    });

    test("POST /api/ner/calculate-lsi fuses DEM and historical density automatically", async () => {
      const res = await request(app)
        .post("/api/ner/calculate-lsi")
        .send({
          rainfall24h: 120,
          threshold: 100,
          soilSaturation: 80,
          lat: 27.33,
          lng: 88.61, // Gangtok / Teesta Basin
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.result.lsiScore).toBeGreaterThan(0);
      expect(res.body.result.historicalEventsCount).toBeGreaterThan(0);
      expect(res.body.result.historicalAnalysis).toBeDefined();
      expect(res.body.result.demDerived).toBe(true);
    });

    test("GET /api/ner/overview returns computed weather forecast, trends, and district drill-down", async () => {
      const res = await request(app).get("/api/ner/overview");
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.states).toBeDefined();
      expect(res.body.states.length).toBe(8);

      const sikkim = res.body.states.find(s => s.state === "Sikkim");
      expect(sikkim).toBeDefined();
      expect(sikkim.forecast).toBeDefined();
      expect(typeof sikkim.forecast.rain24hForecastMm).toBe("number");
      expect(sikkim.forecast.leadTimeFormatted).toBeDefined();
      expect(sikkim.trends).toBeDefined();
      expect(Array.isArray(sikkim.trends.dates)).toBe(true);
      expect(Array.isArray(sikkim.trends.rainfallHistory)).toBe(true);
      expect(sikkim.districts).toBeDefined();
      expect(sikkim.districts.length).toBeGreaterThanOrEqual(4);

      // Verify corridors are populated and synced
      expect(res.body.corridors).toBeDefined();
      expect(res.body.corridors.length).toBeGreaterThanOrEqual(6);
    });

    test("GET /api/ner/districts returns full monitored hill districts and filters by state", async () => {
      // 1. All districts
      const resAll = await request(app).get("/api/ner/districts");
      expect(resAll.status).toBe(200);
      expect(resAll.body.success).toBe(true);
      expect(resAll.body.count).toBeGreaterThanOrEqual(40);
      expect(Array.isArray(resAll.body.districts)).toBe(true);

      const sample = resAll.body.districts[0];
      expect(sample.district).toBeDefined();
      expect(sample.state).toBeDefined();
      expect(typeof sample.currentRainfall24hMm).toBe("number");
      expect(typeof sample.thresholdMm).toBe("number");
      expect(typeof sample.soilSaturationPercent).toBe("number");
      expect(typeof sample.landslideSusceptibilityIndex).toBe("number");
      expect(sample.riskLevel).toBeDefined();
      expect(sample.tacticalAdvisory).toBeDefined();

      // 2. Filter by Sikkim
      const resSK = await request(app).get("/api/ner/districts?state=Sikkim");
      expect(resSK.status).toBe(200);
      expect(resSK.body.count).toBe(6);
      resSK.body.districts.forEach(d => expect(d.state).toBe("Sikkim"));

      // 3. Filter by Meghalaya
      const resML = await request(app).get("/api/ner/districts?state=Meghalaya");
      expect(resML.status).toBe(200);
      expect(resML.body.count).toBe(7);
      resML.body.districts.forEach(d => expect(d.state).toBe("Meghalaya"));
    });
  });
});
