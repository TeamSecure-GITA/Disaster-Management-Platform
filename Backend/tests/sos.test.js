const request = require("supertest");
const app = require("../server");

describe("SOS API", () => {
  test("GET /api/sos should return a response", async () => {
    const response = await request(app).get("/api/sos");

    expect(response.statusCode).toBeGreaterThanOrEqual(200);
    expect(response.statusCode).toBeLessThan(500);
  });

  test("GET /api/sos/:id should return a response", async () => {
    const response = await request(app).get(
      "/api/sos/000000000000000000000000"
    );

    expect(response.statusCode).toBeGreaterThanOrEqual(200);
    expect(response.statusCode).toBeLessThan(500);
  });
});