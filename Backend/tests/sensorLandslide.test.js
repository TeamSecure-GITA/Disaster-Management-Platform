const request = require("supertest");
const app = require("../app");
const sensorService = require("../services/sensorService");
const riskEngineService = require("../services/riskEngineService");
const nerLandslideService = require("../services/nerLandslideService");

describe("⛰️ Landslide In-Situ Sensors & Gateway Ingest Protocol", () => {
  describe("1. Landslide-Specific Sensor Types & Default Seed Profile", () => {
    it("should list in-situ sensors spanning tiltmeters, piezometers, extensometers, and soil moisture", async () => {
      const sensors = await sensorService.getAllSensors();
      expect(sensors.length).toBeGreaterThanOrEqual(10);

      const types = sensors.map((s) => s.type);
      expect(types).toContain("tilt");
      expect(types).toContain("piezometer");
      expect(types).toContain("extensometer");
      expect(types).toContain("soil_moisture");
      expect(types).toContain("rain_gauge");
      expect(types).toContain("geophone");
    });

    it("should include critical mountain transit corridors (NH-10, NH-6, NH-29, NH-13, NH-54)", async () => {
      const sensors = await sensorService.getAllSensors();
      const corridors = sensors
        .map((s) => s.geotechProfile?.corridor)
        .filter(Boolean);

      expect(corridors).toContain("NH-10");
      expect(corridors).toContain("NH-6");
      expect(corridors).toContain("NH-29");
      expect(corridors).toContain("NH-13");
      expect(corridors).toContain("NH-54");
    });

    it("should provide a comprehensive sensor network summary", async () => {
      const summary = await sensorService.getSensorSummary();
      expect(summary).toBeDefined();
      expect(summary.totalSensors).toBeGreaterThanOrEqual(10);
      expect(summary.activeSensors).toBeGreaterThan(0);
      expect(summary.byType.tilt).toBeGreaterThanOrEqual(1);
      expect(summary.byType.piezometer).toBeGreaterThanOrEqual(1);
      expect(summary.byType.extensometer).toBeGreaterThanOrEqual(1);
      expect(typeof summary.meshHealthPct).toBe("number");
    });
  });

  describe("2. Device Gateway Ingest Protocols (GSM & LoRaWAN)", () => {
    it("should ingest multi-channel LoRa slope node packets via /api/sensors/gateway/ingest", async () => {
      const payload = {
        gatewayId: "GW-NER-SIKKIM-01",
        protocol: "lorawan",
        deviceId: "SENS-SK-TILT-01",
        tilt: 3.2,
        porePressure: 48.0,
        soilMoisture: 84.0,
        batteryPct: 88,
        rssi: -74,
      };

      const res = await request(app)
        .post("/api/sensors/gateway/ingest")
        .send(payload);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.processedCount).toBeGreaterThanOrEqual(1);
    });

    it("should ingest compact GSM/GPRS string payloads via /api/sensors/gateway/gsm", async () => {
      const rawGsm = "dev=SENS-SK-TILT-01&val=4.85&tilt=4.85&bat=84";

      const res = await request(app)
        .post("/api/sensors/gateway/gsm")
        .set("Content-Type", "text/plain")
        .send(rawGsm);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.protocol).toBe("gsm_gprs");
      expect(res.body.processedCount).toBeGreaterThan(0);
    });
  });

  describe("3. Turning Readings into Geotechnical Risk & Automated Alerts", () => {
    it("should detect critical threshold breach and flag alert in reading", async () => {
      // Breaching critical threshold of 4.0 degrees for tilt
      const reading = await sensorService.addSensorReading({
        deviceId: "SENS-SK-TILT-01",
        value: 5.2,
        unit: "degrees",
        protocol: "lora",
        gatewayId: "GW-NER-SIKKIM-01",
      });

      expect(reading.isThresholdExceeded).toBe(true);
      expect(reading.alertTriggered).toBe(true);
      expect(reading.alertSeverity).toBe("critical");
      expect(reading.quality).toBe("critical");
      expect(reading.geotechMetrics.estimatedFoS).toBeDefined();
    });

    it("should expose sensor anomalies in /api/sensors/anomalies", async () => {
      const res = await request(app).get("/api/sensors/anomalies");
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);

      const criticalAnom = res.body.data.find((a) => a.severity === "critical");
      expect(criticalAnom).toBeDefined();
      expect(criticalAnom.potentialCause).toBeDefined();
    });

    it("should dynamically feed sensor anomalies into RiskEngineService", async () => {
      // Risk assessment near Teesta Gorge where tiltmeter is in alert
      const assessment = await riskEngineService.assessRisk({
        latitude: 27.0654,
        longitude: 88.4612,
        hazardType: "landslide",
      });

      expect(assessment.overallRiskScore).toBeGreaterThanOrEqual(40);
      expect(assessment.components.anomalyFactor).toBeGreaterThan(1.0);
    });

    it("should reflect dynamic sensor counts in nerLandslideService.getOverview()", async () => {
      const overview = await nerLandslideService.getOverview();
      expect(overview.metrics.totalActiveSensors).toBeGreaterThan(0);

      const sikkim = overview.states.find((s) => s.state === "Sikkim");
      expect(sikkim).toBeDefined();
      expect(typeof sikkim.activeSensors).toBe("number");
      expect(sikkim.activeSensors).toBeGreaterThan(0);
    });
  });

  describe("4. Sensor REST API Endpoints", () => {
    it("GET /api/sensors returns all sensors", async () => {
      const res = await request(app).get("/api/sensors");
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it("GET /api/sensors?type=piezometer filters by type", async () => {
      const res = await request(app).get("/api/sensors?type=piezometer");
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.every((s) => s.type === "piezometer")).toBe(true);
    });

    it("GET /api/sensors/summary returns summary counts", async () => {
      const res = await request(app).get("/api/sensors/summary");
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.activeSensors).toBeDefined();
    });

    it("GET /api/sensors/:id returns specific sensor", async () => {
      const res = await request(app).get("/api/sensors/SENS-SK-TILT-01");
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.deviceId).toBe("SENS-SK-TILT-01");
    });
  });
});
