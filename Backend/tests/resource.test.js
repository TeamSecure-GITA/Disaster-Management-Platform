const request = require("supertest");
const app = require("../server");

describe("Resource API", () => {
  test("GET /api/resources should return a response", async () => {
    const response = await request(app).get(
      "/api/resources"
    );

    expect(response.statusCode).toBeGreaterThanOrEqual(200);
    expect(response.statusCode).toBeLessThan(500);
  });

  test("GET /api/resources/:id should return a response", async () => {
    const response = await request(app).get(
      "/api/resources/000000000000000000000000"
    );

    expect(response.statusCode).toBeGreaterThanOrEqual(200);
    expect(response.statusCode).toBeLessThan(500);
  });
});