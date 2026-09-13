const request = require("supertest");
const app = require("../app");
const { computeVolumeAnomaly, extractLocations } = require("../services/crowdSignalService");

describe("Crowd Signal & Volume Anomaly Engine", () => {
  test("computeVolumeAnomaly correctly calculates surge ratio and z-score", () => {
    // With baseline 2.0 and currentCount 10
    const anomaly = computeVolumeAnomaly("earthquake", 10, 2.0);

    expect(anomaly.currentVelocityPerMin).toBe(10);
    expect(anomaly.surgeRatio).toBeGreaterThanOrEqual(3.0);
    expect(anomaly.isSurge).toBe(true);
    expect(anomaly.confidenceScore).toBeGreaterThan(60);
  });

  test("computeVolumeAnomaly returns non-surge for baseline counts", () => {
    const anomaly = computeVolumeAnomaly("flood", 1, 2.0);

    expect(anomaly.isSurge).toBe(false);
    expect(anomaly.surgeRatio).toBeLessThan(1.5);
  });

  test("extractLocations accurately identifies Indian and international disaster regions", () => {
    const sampleText = "Severe waterlogging reported near Bhubaneswar and Cuttack after continuous downpours";
    const locations = extractLocations(sampleText);

    expect(locations).toContain("Bhubaneswar");
    expect(locations).toContain("Cuttack");
  });

  test("GET /api/alerts/crowd-signals returns active crowd signals array", async () => {
    const response = await request(app).get("/api/alerts/crowd-signals?limit=5");

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
  });
});
