const request = require("supertest");
const app = require("../app");
const mongoose = require("mongoose");
const SyncOperation = require("../models/SyncOperation");
const Incident = require("../models/Incident");
const User = require("../models/User");
const { syncValidator } = require("../validators/syncValidator");

// Mock mongoose save/create so tests run without live Mongo instance
jest.mock("../models/Incident", () => {
  const actual = jest.requireActual("../models/Incident");
  actual.create = jest.fn().mockImplementation((doc) =>
    Promise.resolve({
      _id: new (require("mongoose").Types.ObjectId)(),
      ...doc,
    })
  );
  actual.findOne = jest.fn().mockResolvedValue(null);
  return actual;
});

jest.mock("../models/User", () => {
  const actual = jest.requireActual("../models/User");
  actual.findOne = jest.fn().mockResolvedValue({
    _id: new (require("mongoose").Types.ObjectId)(),
    name: "Emergency Operator",
    role: "admin",
  });
  return actual;
});

jest.mock("../services/smsService", () => {
  const actual = jest.requireActual("../services/smsService");
  return {
    ...actual,
    handleConsentChange: jest.fn().mockResolvedValue({ success: true }),
  };
});

describe("Offline Sync & Inbound SMS Fallback API", () => {
  describe("Sync Validator", () => {
    test("syncValidator exports express-validator middleware array", () => {
      expect(Array.isArray(syncValidator)).toBe(true);
      expect(syncValidator.length).toBeGreaterThan(0);
    });

    test("POST /api/sync/batch without auth returns 401 Unauthorized", async () => {
      const res = await request(app)
        .post("/api/sync/batch")
        .send({
          deviceId: "dev-test-123",
          operations: [
            {
              operationId: "op-test-1",
              resource: "incident",
              action: "create",
              payload: { description: "Road blocked" },
            },
          ],
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    test("GET /api/sync/changes without auth returns 401 Unauthorized", async () => {
      const res = await request(app).get("/api/sync/changes");
      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe("Inbound SMS Disaster Fallback Webhook", () => {
    test("POST /api/sms/inbound handles STOP opt-out", async () => {
      const res = await request(app)
        .post("/api/sms/inbound")
        .send({
          From: "+919876543210",
          Body: "STOP",
        });

      expect(res.statusCode).toBe(200);
      expect(res.text).toContain("<Response>");
      expect(res.text).toContain("opted out");
    });

    test("POST /api/sms/inbound handles START opt-in", async () => {
      const res = await request(app)
        .post("/api/sms/inbound")
        .send({
          From: "+919876543210",
          Body: "START",
        });

      expect(res.statusCode).toBe(200);
      expect(res.text).toContain("<Response>");
      expect(res.text).toContain("subscribed");
    });

    test("POST /api/sms/inbound accepts and parses emergency REPORT SMS fallback", async () => {
      const res = await request(app)
        .post("/api/sms/inbound")
        .send({
          From: "+919876543210",
          Body: "REPORT LANDSLIDE CRITICAL 26.1445,91.7362 Massive debris blocking NH-27 near Guwahati Affected: 30",
        });

      expect(res.statusCode).toBe(200);
      expect(res.text).toContain("<Response>");
      expect(res.text).toContain("DMP Alert: Report received");
      expect(Incident.create).toHaveBeenCalled();
    });

    test("POST /api/sms/inbound handles FLOOD disaster report keyword", async () => {
      const res = await request(app)
        .post("/api/sms/inbound")
        .send({
          From: "+919123456780",
          Body: "FLOOD HIGH 26.20,92.93 Inundation near river embankment",
        });

      expect(res.statusCode).toBe(200);
      expect(res.text).toContain("<Response>");
      expect(res.text).toContain("DMP Alert: Report received");
    });
  });

  describe("SyncOperation Model Schema", () => {
    test("SyncOperation accepts incident resource and conflict fields", () => {
      const op = new SyncOperation({
        user: new mongoose.Types.ObjectId(),
        deviceId: "dev-mobile-pwa",
        operationId: "op-inc-12345",
        resource: "incident",
        action: "create",
        payload: {
          incidentType: "slope_movement",
          severity: "high",
          description: "Crack on slope",
        },
        status: "applied",
        conflictResolution: "client_wins",
      });

      const err = op.validateSync();
      expect(err).toBeUndefined();
      expect(op.resource).toBe("incident");
      expect(op.conflictResolution).toBe("client_wins");
    });
  });
});
