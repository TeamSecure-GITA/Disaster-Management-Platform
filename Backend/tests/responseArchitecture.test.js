const request = require("supertest");
const app = require("../app");
const { generateToken } = require("../utils/generateToken");

describe("Working Tree Architecture Integration Tests", () => {
  describe("1. Client Tier & API Routing", () => {
    it("should respond to health and system status check", async () => {
      const res = await request(app).get("/api/health");
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it("should report overall response system status across all subsystems", async () => {
      const res = await request(app).get("/api/response/status");
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.architecture).toBe("DISASTER_MANAGEMENT_RESPONSE_SYSTEM");
      expect(res.body.data.subsystems.riskEngine.status).toBe("ACTIVE");
      expect(res.body.data.subsystems.decisionEngines.evacuationEngine).toBe("ONLINE");
      expect(res.body.data.subsystems.decisionEngines.resourceEngine).toBe("ONLINE");
      expect(res.body.data.subsystems.responseSystem.shelterSystem).toBe("SYNCHRONIZED");
      expect(res.body.data.subsystems.responseSystem.responderSystem).toBe("CONNECTED");
      expect(res.body.data.subsystems.responseSystem.alertSystem).toBe("LIVE");
    });
  });

  describe("2. Risk Engine (Hazard + Forecast + Anomaly)", () => {
    it("should return regional risk zones for Web and Mobile maps", async () => {
      const res = await request(app).get("/api/risk/zones");
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[0]).toHaveProperty("overallRiskScore");
      expect(res.body.data[0]).toHaveProperty("level");
      expect(res.body.data[0]).toHaveProperty("primaryHazard");
    });

    it("should compute compound risk assessment at target coordinates", async () => {
      const res = await request(app)
        .post("/api/risk/assess")
        .send({
          latitude: 25.57,
          longitude: 91.88,
          hazardType: "landslide",
        });
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty("overallRiskScore");
      expect(res.body.data).toHaveProperty("components");
      expect(res.body.data.components).toHaveProperty("hazardScore");
      expect(res.body.data.components).toHaveProperty("exposureScore");
      expect(res.body.data.components).toHaveProperty("vulnerabilityScore");
    });

    it("should return risk summary statistics", async () => {
      const res = await request(app).get("/api/risk/summary");
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty("totalZonesMonitored");
    });
  });

  describe("3. Response System Orchestration (Database + Risk + Evacuation + Resource -> Shelter + Responder + Alert)", () => {
    it("should orchestrate full disaster response workflow", async () => {
      const payload = {
        latitude: 25.57,
        longitude: 91.88,
        hazardType: "flood",
        affectedPopulation: 1200,
        incidentId: "inc-meghalaya-401",
      };

      const res = await request(app)
        .post("/api/response/orchestrate")
        .send(payload);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.status).toBe("COORDINATED_RESPONSE_ACTIVE");

      // Verify Risk Engine output
      expect(res.body.riskAssessment).toBeDefined();
      expect(res.body.riskAssessment.overallRiskScore).toBeGreaterThanOrEqual(0);

      // Verify Decision Engines (Evacuation & Resource)
      expect(res.body.decisionEngines.evacuationEngine).toBeDefined();
      expect(res.body.decisionEngines.evacuationEngine.safeRoutes.length).toBeGreaterThan(0);
      expect(res.body.decisionEngines.resourceEngine).toBeDefined();
      expect(res.body.decisionEngines.resourceEngine.waterRationsAllocated).toBe(3600);

      // Verify Operational Subsystems (Shelter, Responder, Alert)
      expect(res.body.operationalSubsystems.shelterSystem).toBeDefined();
      expect(res.body.operationalSubsystems.shelterSystem.availableBeds).toBeGreaterThan(0);
      expect(res.body.operationalSubsystems.responderSystem).toBeDefined();
      expect(res.body.operationalSubsystems.responderSystem.assignedTeams.length).toBeGreaterThan(0);
      expect(res.body.operationalSubsystems.alertSystem).toBeDefined();
      expect(res.body.operationalSubsystems.alertSystem.broadcastChannels).toContain("IN_APP_PUSH");

      // Verify Directives for Web / Mobile Users
      expect(res.body.userActionDirectives.length).toBeGreaterThan(0);
    });
  });

  describe("4. AI Request / Copilot Integration", () => {
    it("should handle emergency queries and return structured guidance", async () => {
      const token = generateToken({ _id: "test-user-001", role: "citizen", tokenVersion: 0 });
      const res = await request(app)
        .post("/api/chat")
        .set("Authorization", `Bearer ${token}`)
        .send({ message: "Heavy flash flood warning, what should I do?" });
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
    });
  });
});
