const request = require("supertest");
const app = require("../app");

describe("Alert API", () => {
  test("invalid alert payload returns validation errors", async () => {
    const response = await request(app).post("/api/alerts").send({});

    expect(response.statusCode).toBe(400);
    expect(response.body.success).toBe(false);
  });

  test("GET /api/alerts/:id should return a response", async () => {
    const response = await request(app).get("/api/alerts/unmatched/path");

    expect(response.statusCode).toBe(404);
    expect(response.body.success).toBe(false);
  });
});