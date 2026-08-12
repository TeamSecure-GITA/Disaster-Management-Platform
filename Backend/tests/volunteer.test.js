const request = require("supertest");
const app = require("../server");

describe("Volunteer API", () => {
  test("GET /api/volunteers should return a response", async () => {
    const response = await request(app).get(
      "/api/volunteers"
    );

    expect(response.statusCode).toBeGreaterThanOrEqual(200);
    expect(response.statusCode).toBeLessThan(500);
  });

  test("GET /api/volunteers/:id should return a response", async () => {
    const response = await request(app).get(
      "/api/volunteers/000000000000000000000000"
    );

    expect(response.statusCode).toBeGreaterThanOrEqual(200);
    expect(response.statusCode).toBeLessThan(500);
  });
});