const request = require("supertest");
const app = require("../app");

describe("SOS API", () => {
  test("POST /api/sos with empty payload returns 400 (DB connected) or 503 (DB unavailable)", async () => {
    const response = await request(app).post("/api/sos").send({});

    // When the test suite runs without a live MongoDB connection the DB-guard
    // fires first and returns 503. When a DB is available, validation runs and
    // returns 400.  Either way, success must be false.
    expect([400, 503]).toContain(response.statusCode);
    expect(response.body.success).toBe(false);
  });

  test("GET /api/sos/:id with an invalid path segment returns 404", async () => {
    const response = await request(app).get("/api/sos/unmatched/path");

    expect(response.statusCode).toBe(404);
    expect(response.body.success).toBe(false);
  });
});