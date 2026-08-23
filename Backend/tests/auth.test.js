const request = require("supertest");
const app = require("../app");
const User = require("../models/User");
const { protect } = require("../middleware/authMiddleware");
const { generateToken } = require("../utils/generateToken");

describe("Authentication API", () => {
  test("GET / should return API running message", async () => {
    const response = await request(app).get("/");

    expect(response.statusCode).toBe(200);

    expect(response.body).toEqual({
      message: "Disaster Management API is running",
    });
  });

  test("GET /api/health returns a health contract and security headers", async () => {
    const response = await request(app).get("/api/health");

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.headers["x-request-id"]).toBeTruthy();
    expect(response.headers["x-content-type-options"]).toBe("nosniff");
  });

  test("CORS never uses wildcard origin with credentials", async () => {
    const response = await request(app)
      .get("/api/health")
      .set("Origin", "http://localhost:3000");

    expect(response.headers["access-control-allow-origin"]).toBe(
      "http://localhost:3000"
    );
    expect(response.headers["access-control-allow-credentials"]).toBe("true");
    expect(response.headers["access-control-allow-origin"]).not.toBe("*");
  });

  test("invalid registration payload returns validation errors", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send({
        name: "A",
        email: "invalid-email",
        password: "short",
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.errors.length).toBeGreaterThan(0);
  });

  test("JWT helper signs a valid token and middleware accepts it", async () => {
    const mockUser = {
      _id: "64f000000000000000000001",
      role: "user",
      isActive: true,
      status: "active",
    };

    jest.spyOn(User, "findById").mockReturnValue({
      select: jest.fn().mockResolvedValue(mockUser),
    });

    const token = generateToken({
      _id: mockUser._id,
      role: mockUser.role,
    });

    const req = {
      headers: {
        authorization: `Bearer ${token}`,
      },
      method: "GET",
      originalUrl: "/api/auth/me",
      ip: "127.0.0.1",
      connection: { remoteAddress: "127.0.0.1" },
      requestId: "jwt-test-request",
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();

    await protect(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(req.user._id.toString()).toBe(mockUser._id);
    expect(req.user.role).toBe("user");
  });

  test("login returns both access and refresh tokens", async () => {
    const user = {
      _id: "64f000000000000000000002",
      name: "Alice",
      email: "alice@example.com",
      password: "$2a$10$abcdefghijklmnopqrstuv",
      role: "user",
      isActive: true,
      status: "active",
      save: jest.fn().mockResolvedValue(true),
    };

    jest.spyOn(User, "findOne").mockReturnValue({
      select: jest.fn().mockResolvedValue(user),
    });
    jest.spyOn(require("bcryptjs"), "compare").mockResolvedValue(true);

    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: "alice@example.com",
        password: "Password123",
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.token).toBeTruthy();
    expect(response.body.data.refreshToken).toBeTruthy();
    expect(user.save).toHaveBeenCalled();
  });

  test("protected endpoints reject missing credentials", async () => {
    const response = await request(app).get("/api/auth/me");

    expect(response.statusCode).toBe(401);
    expect(response.body).toMatchObject({
      success: false,
      message: expect.stringContaining("Authentication required"),
    });
  });
});