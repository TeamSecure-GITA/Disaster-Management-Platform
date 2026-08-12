const request = require("supertest");
const app = require("../server");

describe("Shelter API", () => {
  test("GET /api/shelters should return a response", async () => {
    const response = await request(app).get("/api/shelters");

    expect(response.statusCode).toBeGreaterThanOrEqual(200);
    expect(response.statusCode).toBeLessThan(500);
  });

  test("GET /api/shelters/:id should return a response", async () => {
    const response = await request(app).get(
      "/api/shelters/000000000000000000000000"
    );

    expect(response.statusCode).toBeGreaterThanOrEqual(200);
    expect(response.statusCode).toBeLessThan(500);
  });
});