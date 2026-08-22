const request = require("supertest");
const app = require("../app");

describe("Shelter API", () => {
  test("invalid shelter payload returns validation errors", async () => {
    const response = await request(app).post("/api/shelters").send({});

    expect(response.statusCode).toBe(400);
    expect(response.body.success).toBe(false);
  });

  test("GET /api/shelters/:id should return a response", async () => {
    const response = await request(app).get("/api/shelters/unmatched/path");

    expect(response.statusCode).toBe(404);
    expect(response.body.success).toBe(false);
  });
});