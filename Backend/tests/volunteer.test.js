const request = require("supertest");
const app = require("../app");

describe("Volunteer API", () => {
  test("invalid volunteer payload returns validation errors", async () => {
    const response = await request(app).post("/api/volunteers").send({});

    expect(response.statusCode).toBe(400);
    expect(response.body.success).toBe(false);
  });

  test("GET /api/volunteers/:id should return a response", async () => {
    const response = await request(app).get("/api/volunteers/unmatched/path");

    expect(response.statusCode).toBe(404);
    expect(response.body.success).toBe(false);
  });
});