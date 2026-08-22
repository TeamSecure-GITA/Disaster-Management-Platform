const request = require("supertest");
const app = require("../app");

describe("SOS API", () => {
  test("invalid SOS payload returns validation errors", async () => {
    const response = await request(app).post("/api/sos").send({});

    expect(response.statusCode).toBe(400);
    expect(response.body.success).toBe(false);
  });

  test("GET /api/sos/:id should return a response", async () => {
    const response = await request(app).get("/api/sos/unmatched/path");

    expect(response.statusCode).toBe(404);
    expect(response.body.success).toBe(false);
  });
});