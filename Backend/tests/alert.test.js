const request = require("supertest");
const app = require("../server");

describe("Alert API", () => {
  test("GET /api/alerts should return a response", async () => {
    const response = await request(app).get("/api/alerts");

    expect(response.statusCode).toBeGreaterThanOrEqual(200);
    expect(response.statusCode).toBeLessThan(500);
  });

  test("GET /api/alerts/:id should return a response", async () => {
    const response = await request(app).get(
      "/api/alerts/000000000000000000000000"
    );

    expect(response.statusCode).toBeGreaterThanOrEqual(200);
    expect(response.statusCode).toBeLessThan(500);
  });
});