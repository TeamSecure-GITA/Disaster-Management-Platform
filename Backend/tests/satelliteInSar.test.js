const request = require("supertest");
const app = require("../app");
const satelliteService = require("../services/satelliteService");
const SatelliteData = require("../models/SatelliteData");
const User = require("../models/User");
const { generateToken } = require("../utils/generateToken");

describe("🛰️ Satellite Remote Sensing, InSAR Displacement & Map Layer Pipeline", () => {
  let adminToken;
  const mockAdmin = {
    _id: "507f1f77bcf86cd799439011",
    role: "admin",
    isActive: true,
    status: "active",
    tokenVersion: 0,
  };

  beforeAll(async () => {
    jest.spyOn(User, "findById").mockReturnValue({
      select: jest.fn().mockResolvedValue(mockAdmin),
    });

    adminToken = generateToken({
      _id: mockAdmin._id,
      role: "admin",
      tokenVersion: 0,
    });
  });

  describe("1. Remote Sensing Processing Engine & Physical Models", () => {
    it("should process InSAR phase shifts into millimeter LOS displacement and deformation velocity", () => {
      const site = satelliteService.MONITORED_SITES[0]; // NH-10 Teesta Valley
      const processed = satelliteService.processSatellitePass(site, { phaseShiftRad: -2.85 });

      expect(processed).toBeDefined();
      expect(processed.dataType).toBe("insar_displacement");
      expect(processed.mission).toBe("SENTINEL_1_SAR");

      // Verify InSAR displacement calculations
      const insar = processed.insarMetrics;
      expect(typeof insar.losDisplacementMm).toBe("number");
      expect(typeof insar.velocityMmYear).toBe("number");
      expect(["critical_shear", "accelerating_creep", "slow_creep", "stable"]).toContain(
        insar.deformationStatus
      );

      // Verify GeoJSON feature synthesis
      const geoJson = processed.geoJsonFeature;
      expect(geoJson.type).toBe("Feature");
      expect(geoJson.geometry.type).toBe("Point");
      expect(geoJson.geometry.coordinates).toEqual(site.coordinates);
      expect(geoJson.properties.corridor).toBe(site.corridor);
      expect(geoJson.properties.insar.displacementMm).toBe(insar.losDisplacementMm);
      expect(geoJson.properties.colorCode).toMatch(/^#[0-9a-f]{6}$/i);
    });

    it("should detect SAR flood inundation specular backscatter drops", () => {
      const floodSite = satelliteService.MONITORED_SITES.find((s) => s.floodProne);
      expect(floodSite).toBeDefined();

      const processed = satelliteService.processSatellitePass(floodSite);
      expect(processed.sarMetrics).toBeDefined();
      expect(typeof processed.sarMetrics.backscatterVvDb).toBe("number");
      expect(typeof processed.sarMetrics.floodWaterMaskAreaSqKm).toBe("number");
      expect(processed.sarMetrics.floodWaterMaskAreaSqKm).toBeGreaterThan(0);
    });

    it("should compute soil moisture saturation and liquefaction risk threshold", () => {
      const site = satelliteService.MONITORED_SITES[0];
      const processed = satelliteService.processSatellitePass(site, { soilMoistureM3M3: 0.44 });

      expect(processed.soilMoistureMetrics).toBeDefined();
      expect(processed.soilMoistureMetrics.saturationPercentage).toBeGreaterThanOrEqual(0);
      expect(processed.soilMoistureMetrics.saturationPercentage).toBeLessThanOrEqual(100);
      expect(["low", "moderate", "high", "critical"]).toContain(
        processed.soilMoistureMetrics.liquefactionRisk
      );
    });
  });

  describe("2. Batch 6-Hourly Update Job & Multi-Corridor Processing", () => {
    it("should execute updateSatelliteData across all monitored NER transit corridors", async () => {
      const result = await satelliteService.updateSatelliteData();

      expect(result).toBeDefined();
      expect(result.status).toBe("updated");
      expect(result.updated).toBeGreaterThanOrEqual(satelliteService.MONITORED_SITES.length);

      // Check records
      const count = require("mongoose").connection.readyState === 1
        ? await SatelliteData.countDocuments()
        : result.updated;
      expect(count).toBeGreaterThanOrEqual(satelliteService.MONITORED_SITES.length);
    });

    it("should retrieve high-level satellite summary metrics", async () => {
      const summary = await satelliteService.getSatelliteSummary();

      expect(summary).toBeDefined();
      expect(Array.isArray(summary.activeSatellites)).toBe(true);
      expect(summary.activeSatellites.length).toBeGreaterThanOrEqual(3);
      expect(summary.monitoredCorridors).toBeGreaterThanOrEqual(5);
      expect(typeof summary.floodInundationAreaSqKm).toBe("number");
      expect(summary.operationalStatus).toContain("NOMINAL");
    });
  });

  describe("3. GIS Map Layer Publication (GeoJSON)", () => {
    it("should publish satellite outputs as standard GeoJSON FeatureCollection", async () => {
      const geoJson = await satelliteService.getSatelliteMapLayers("all");

      expect(geoJson).toBeDefined();
      expect(geoJson.type).toBe("FeatureCollection");
      expect(Array.isArray(geoJson.features)).toBe(true);
      expect(geoJson.features.length).toBeGreaterThan(0);

      // Verify layer categories
      expect(geoJson.layers).toBeDefined();
      expect(Array.isArray(geoJson.layers.insarDisplacement)).toBe(true);
      expect(Array.isArray(geoJson.layers.sarFloodInundation)).toBe(true);
      expect(Array.isArray(geoJson.layers.soilMoistureGrid)).toBe(true);
    });

    it("should filter InSAR displacement data with velocity metrics", async () => {
      const insarData = await satelliteService.getInsarDisplacementData();

      expect(insarData).toBeDefined();
      expect(insarData.totalMonitoredSites).toBeGreaterThan(0);
      expect(Array.isArray(insarData.sites)).toBe(true);

      const first = insarData.sites[0];
      expect(first.corridor).toBeDefined();
      expect(typeof first.losDisplacementMm).toBe("number");
      expect(typeof first.velocityMmYear).toBe("number");
      expect(first.deformationStatus).toBeDefined();
    });
  });

  describe("4. REST Endpoints & Route Security", () => {
    it("GET /api/satellite/layers should return public GeoJSON without auth", async () => {
      const res = await request(app)
        .get("/api/satellite/layers")
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.type).toBe("FeatureCollection");
      expect(res.body.data.features.length).toBeGreaterThan(0);
    });

    it("GET /api/satellite/insar-displacement should return InSAR points", async () => {
      const res = await request(app)
        .get("/api/satellite/insar-displacement")
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.sites.length).toBeGreaterThan(0);
    });

    it("GET /api/satellite/summary should return satellite fleet status", async () => {
      const res = await request(app)
        .get("/api/satellite/summary")
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.monitoredCorridors).toBeGreaterThanOrEqual(5);
    });

    it("GET /api/satellite/sources should return catalog of real satellite sources and missions", async () => {
      const res = await request(app)
        .get("/api/satellite/sources")
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.dataSources)).toBe(true);
      const s1 = res.body.data.dataSources.find(s => s.mission === "SENTINEL_1_SAR");
      expect(s1).toBeDefined();
      expect(s1.sensor).toContain("Synthetic Aperture Radar");
    });

    it("GET /api/satellite/layers/raster-overlay/:siteId should return raster overlay and georeferenced bounding box", async () => {
      const res = await request(app)
        .get("/api/satellite/layers/raster-overlay/SAT-S1-SK-01")
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.siteId).toBe("SAT-S1-SK-01");
      expect(res.body.data.bounds).toBeDefined();
      expect(res.body.data.rasterOverlayUrl).toBeDefined();
    });

    it("GET /api/satellite/layers should include vegetationScars optical layer and soilMoistureGrid", async () => {
      const res = await request(app)
        .get("/api/satellite/layers")
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.layers.vegetationScars).toBeDefined();
      expect(res.body.data.layers.soilMoistureGrid).toBeDefined();
      expect(res.body.data.layers.sarFloodInundation).toBeDefined();
      expect(res.body.data.layers.insarDisplacement).toBeDefined();
    });

    it("POST /api/satellite/sync-now should reject unauthenticated requests", async () => {
      await request(app)
        .post("/api/satellite/sync-now")
        .expect(401);
    });

    it("POST /api/satellite/sync-now should allow authorized admin to trigger processing", async () => {
      const res = await request(app)
        .post("/api/satellite/sync-now")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe("updated");
    });
  });
});
