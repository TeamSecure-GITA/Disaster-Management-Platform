const request = require("supertest");
const app = require("../app");
const terrainService = require("../services/terrainService");

describe("Terrain & Slope DEM Derivations (Copernicus GLO-30 / CartoDEM)", () => {
  describe("Horn's Finite-Difference Topographic Kernel", () => {
    test("accurately calculates 0° slope and FLAT aspect on horizontal surface", () => {
      const flatZ = {
        nw: 500, n: 500, ne: 500,
        w:  500, c: 500, e:  500,
        sw: 500, s: 500, se: 500,
      };

      const result = terrainService.deriveTopographicIndices(flatZ, 30);
      expect(result.slopeDeg).toBe(0);
      expect(result.aspectDirection).toBe("FLAT");
      expect(result.elevationMeters).toBe(500);
      expect(result.curvature.generalCurvature).toBe(0);
    });

    test("accurately calculates slope and aspect on an inclined plane", () => {
      // 30m cell spacing, rising to the North (z_n > z_c > z_s)
      // dz/dy = 30m rise over 30m distance -> slope ~ 45 degrees, facing South
      const inclinedZ = {
        nw: 530, n: 530, ne: 530,
        w:  500, c: 500, e:  500,
        sw: 470, s: 470, se: 470,
      };

      const result = terrainService.deriveTopographicIndices(inclinedZ, 30);
      expect(result.slopeDeg).toBeGreaterThan(40);
      expect(result.slopeDeg).toBeLessThan(50);
      expect(["S", "SW", "SE"]).toContain(result.aspectDirection);
    });

    test("computes negative profile curvature for concave slope hollows", () => {
      // Hollow / chute where slope decelerates (center is lower than surrounding average)
      const concaveZ = {
        nw: 520, n: 525, ne: 520,
        w:  510, c: 495, e:  510,
        sw: 480, s: 485, se: 480,
      };

      const result = terrainService.deriveTopographicIndices(concaveZ, 30);
      expect(result.curvature).toBeDefined();
      expect(typeof result.curvature.profileCurvature).toBe("number");
      expect(typeof result.curvature.planformCurvature).toBe("number");
    });
  });

  describe("Geographic Point DEM Topography Derivation", () => {
    test("derives elevation, slope, aspect, road & stream proximity for Sikkim Teesta Corridor", async () => {
      const lat = 27.33; // Gangtok / Teesta valley
      const lng = 88.61;

      const terrain = await terrainService.getTerrainAtCoordinates(lat, lng);

      expect(terrain).toBeDefined();
      expect(terrain.gridId).toContain("GRID");
      expect(terrain.elevationMeters).toBeGreaterThan(500);
      expect(terrain.slopeDeg).toBeGreaterThan(20); // steep mountain slope
      expect(terrain.aspectDirection).toBeDefined();
      expect(terrain.distanceToRoadsMeters).toBeLessThan(1000); // near NH-10
      expect(terrain.nearestRoadName).toContain("NH-10");
      expect(terrain.distanceToStreamsMeters).toBeLessThan(2000); // near Teesta river
      expect(terrain.nearestStreamName).toContain("Teesta");
      expect(terrain.lithology.formation).toContain("Daling");
      expect(terrain.lithology.strengthClass).toBe("LOW");
      expect(terrain.landCover.classification).toBeDefined();
      expect(terrain.terrainRiskMultiplier).toBeGreaterThan(0.5);
    });

    test("derives Disang shale lithology and high road proximity for Nagaland Dzüdza Gorge", async () => {
      const lat = 25.70;
      const lng = 94.02;

      const terrain = await terrainService.getTerrainAtCoordinates(lat, lng);

      expect(terrain.lithology.formation).toContain("Disang Group");
      expect(terrain.lithology.strengthClass).toBe("VERY_LOW");
      expect(terrain.nearestRoadName).toContain("NH-29");
      expect(terrain.nearestStreamName).toContain("Dzüdza");
      expect(terrain.slopeDeg).toBeGreaterThan(20);
    });

    test("derives Meghalaya karst limestone and high elevation for Shillong Plateau", async () => {
      const lat = 25.25;
      const lng = 92.35;

      const terrain = await terrainService.getTerrainAtCoordinates(lat, lng);

      expect(terrain.nearestRoadName).toContain("NH-6");
      expect(terrain.nearestStreamName).toContain("Lubha");
      expect(terrain.elevationMeters).toBeGreaterThan(100);
    });
  });

  describe("DEM Grid & Highway Corridor Profiling", () => {
    test("generates GeoJSON grid FeatureCollection over bounding box", async () => {
      const grid = await terrainService.getGridTerrain({
        minLng: 88.48,
        minLat: 27.20,
        maxLng: 88.58,
        maxLat: 27.30,
        resolutionMeters: 500,
      });

      expect(grid.type).toBe("FeatureCollection");
      expect(grid.features.length).toBeGreaterThan(0);
      const firstFeature = grid.features[0];
      expect(firstFeature.geometry.type).toBe("Polygon");
      expect(firstFeature.properties.slopeDeg).toBeDefined();
      expect(firstFeature.properties.curvature).toBeDefined();
      expect(firstFeature.properties.distanceToRoadsMeters).toBeDefined();
      expect(firstFeature.properties.distanceToStreamsMeters).toBeDefined();
      expect(firstFeature.properties.lithology).toBeDefined();
    });

    test("generates longitudinal highway corridor profile for NH-10", async () => {
      const profile = await terrainService.getCorridorTerrainProfile("NH-10");

      expect(profile.corridorId).toBe("NH-10");
      expect(profile.profile.length).toBeGreaterThan(3);
      expect(profile.totalLengthKm).toBeGreaterThan(10);
      expect(profile.maxSlopeDeg).toBeGreaterThan(25);
      expect(profile.profile[0].elevationMeters).toBeDefined();
      expect(profile.profile[0].slopeDeg).toBeDefined();
      expect(profile.profile[0].distanceToStreamsMeters).toBeDefined();
    });
  });

  describe("Multi-Factor Geotechnical LSI Calculation", () => {
    test("calculates enhanced LSI incorporating DEM slope, road proximity, and lithology", async () => {
      const result = await terrainService.calculateEnhancedLSI({
        rainfall24h: 180,
        threshold: 120,
        soilSaturation: 92,
        lat: 27.33,
        lng: 88.61, // Sikkim Teesta Valley
      });

      expect(result.lsiScore).toBeGreaterThanOrEqual(0.70);
      expect(["High", "Critical"]).toContain(result.riskLevel);
      expect(result.derivedTerrain).toBeDefined();
      expect(result.derivedTerrain.slopeDeg).toBeGreaterThan(20);
      expect(result.derivedTerrain.distanceToRoadsMeters).toBeDefined();
      expect(result.derivedTerrain.lithology).toBeDefined();
    });
  });

  describe("API Endpoints Integration", () => {
    test("GET /api/terrain/point returns derived DEM metrics", async () => {
      const res = await request(app)
        .get("/api/terrain/point?lat=27.33&lng=88.61")
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.topography.slopeDeg).toBeDefined();
      expect(res.body.topography.elevationMeters).toBeDefined();
      expect(res.body.topography.aspectDirection).toBeDefined();
      expect(res.body.topography.curvature).toBeDefined();
      expect(res.body.proximity.distanceToRoadsMeters).toBeDefined();
      expect(res.body.proximity.distanceToStreamsMeters).toBeDefined();
      expect(res.body.geology).toBeDefined();
      expect(res.body.ecology).toBeDefined();
    });

    test("GET /api/terrain/grid returns GeoJSON grid", async () => {
      const res = await request(app)
        .get("/api/terrain/grid?bbox=88.48,27.20,88.58,27.30&resolution=500")
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.type).toBe("FeatureCollection");
      expect(res.body.features.length).toBeGreaterThan(0);
    });

    test("GET /api/terrain/corridor/NH-10 returns elevation and slope chainage", async () => {
      const res = await request(app)
        .get("/api/terrain/corridor/NH-10")
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.corridorId).toBe("NH-10");
      expect(res.body.profile.length).toBeGreaterThan(0);
    });

    test("GET /api/terrain/sources returns metadata on Copernicus and CartoDEM", async () => {
      const res = await request(app)
        .get("/api/terrain/sources")
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.sources.some((s) => s.id.includes("Copernicus"))).toBe(true);
      expect(res.body.sources.some((s) => s.id.includes("CartoDEM"))).toBe(true);
      expect(res.body.thematicLayers.length).toBeGreaterThan(2);
    });

    test("POST /api/terrain/calculate-lsi calculates multi-factor index with lat/lng", async () => {
      const res = await request(app)
        .post("/api/terrain/calculate-lsi")
        .send({
          rainfall24h: 150,
          threshold: 100,
          soilSaturation: 90,
          lat: 25.67,
          lng: 94.11, // Kohima
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.result.lsiScore).toBeDefined();
      expect(res.body.result.derivedTerrain.slopeDeg).toBeDefined();
    });

    test("POST /api/ner/calculate-lsi auto-derives slope from DEM if lat/lng are provided", async () => {
      const res = await request(app)
        .post("/api/ner/calculate-lsi")
        .send({
          rainfall24h: 130,
          threshold: 100,
          soilSaturation: 85,
          lat: 27.33,
          lng: 88.61,
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.result.demDerived).toBe(true);
      expect(res.body.result.derivedTerrain.slopeDeg).toBeDefined();
      expect(res.body.result.derivedTerrain.elevationMeters).toBeDefined();
    });

    test("POST /api/ner/report-crack auto-derives slope angle from DEM coordinates", async () => {
      const res = await request(app)
        .post("/api/ner/report-crack")
        .send({
          locationName: "Teesta Bazaar NH-10 Cut",
          coordinates: [88.45, 26.90],
          state: "Sikkim",
          crackLengthMeters: 4.5,
          crackWidthCm: 8.0,
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.observation.demDerived).toBe(true);
      expect(res.body.observation.slopeAngleDeg).toBeGreaterThan(0);
      expect(res.body.observation.nearestRoadName).toBeDefined();
      expect(res.body.observation.nearestStreamName).toBeDefined();
      expect(res.body.observation.lithology).toBeDefined();
    });
  });
});
