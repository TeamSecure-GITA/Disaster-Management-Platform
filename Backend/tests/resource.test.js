const request = require("supertest");
const app = require("../app");

describe("Resource API", () => {
  test("invalid resource payload returns validation errors", async () => {
    const response = await request(app).post("/api/resources").send({});

    expect(response.statusCode).toBe(400);
    expect(response.body.success).toBe(false);
  });

  test("GET /api/resources/:id should return a response", async () => {
    const response = await request(app).get("/api/resources/unmatched/path");

    expect(response.statusCode).toBe(404);
    expect(response.body.success).toBe(false);
  });
});