const request = require("supertest");
const app = require("../app");
const { alertQueue, AlertQueueJob } = require("../services/alertQueue");

describe("Cloud Architecture & Monitoring Tests", () => {
  describe("1. Security Headers & Middleware", () => {
    it("should set Helmet security headers on responses", async () => {
      const res = await request(app).get("/api/health");
      expect(res.headers["x-content-type-options"]).toBe("nosniff");
      expect(res.headers["x-frame-options"] || res.headers["content-security-policy"]).toBeDefined();
    });
  });

  describe("2. Monitoring & Metrics Endpoints", () => {
    it("should serve Prometheus exposition metrics at /metrics", async () => {
      const res = await request(app).get("/metrics");
      expect(res.statusCode).toBe(200);
      expect(res.headers["content-type"]).toContain("text/plain");
      expect(res.text).toContain("process_cpu_seconds_total");
      expect(res.text).toContain("nodejs_heap_size_used_bytes");
      expect(res.text).toContain("alert_queue_pending_jobs");
    });

    it("should serve structured JSON telemetry at /api/monitoring/metrics", async () => {
      const res = await request(app).get("/api/monitoring/metrics");
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty("system");
      expect(res.body.data).toHaveProperty("process");
      expect(res.body.data).toHaveProperty("alertQueue");
      expect(res.body.data.alertQueue).toHaveProperty("queueDepth");
    });

    it("should serve deep healthcheck at /api/monitoring/health", async () => {
      const res = await request(app).get("/api/monitoring/health");
      expect([200, 503]).toContain(res.statusCode);
      expect(res.body).toHaveProperty("status");
      expect(res.body).toHaveProperty("database");
      expect(res.body).toHaveProperty("checks");
    });
  });

  describe("3. Alert Fan-Out Queue Service", () => {
    beforeEach(() => {
      jest.restoreAllMocks();
    });

    it("should split large recipient lists into batches and report stats", async () => {
      const mockRecipients = Array.from({ length: 55 }, (_, i) => ({
        _id: `user-${i}`,
        preferredLanguage: i % 2 === 0 ? "hi" : "en",
      }));

      const mockCreatedJob = {
        _id: "mock-job-id-123",
        alertId: "test-alert-001",
        recipients: mockRecipients.map((u) => ({ userId: u._id, language: u.preferredLanguage, status: "pending" })),
        status: "queued",
        save: jest.fn().mockResolvedValue(true),
      };

      jest.spyOn(AlertQueueJob, "create").mockResolvedValue(mockCreatedJob);

      const job = await alertQueue.enqueueFanout({
        alertId: "test-alert-001",
        alertType: "LANDSLIDE",
        severity: "critical",
        users: mockRecipients,
        localizedContent: [
          { lang: "en", title: "Evacuation Warning", message: "Move to higher ground" },
          { lang: "hi", title: "निकासी चेतावनी", message: "ऊंचे स्थान पर जाएं" },
        ],
      });

      expect(job).toBeDefined();
      expect(job._id).toBe("mock-job-id-123");
      expect(AlertQueueJob.create).toHaveBeenCalled();

      const metrics = await alertQueue.getMetrics();
      expect(metrics).toHaveProperty("queueDepth");
      expect(metrics).toHaveProperty("totalQueued");
      expect(metrics).toHaveProperty("totalDispatched");
      expect(metrics).toHaveProperty("totalFailed");
      expect(metrics.totalQueued).toBeGreaterThanOrEqual(55);
    });
  });
});

