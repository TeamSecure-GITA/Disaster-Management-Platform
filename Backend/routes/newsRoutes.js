const express = require("express");
const router = express.Router();
const NewsArticle = require("../models/NewsArticle");
const { fetchAndStoreAll } = require("../services/newsService");

/**
 * GET /api/news
 * Query params:
 *   - lang: "en" | "hi" | "or" (default: "en")
 *   - page: number (default: 1)
 *   - limit: number (default: 20, max: 50)
 */
router.get("/", async (req, res) => {
  try {
    const lang = ["en", "hi", "or"].includes(req.query.lang) ? req.query.lang : "en";
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const [articles, total] = await Promise.all([
      NewsArticle.find({ language: lang })
        .sort({ publishedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      NewsArticle.countDocuments({ language: lang }),
    ]);

    res.status(200).json({
      success: true,
      language: lang,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      data: articles,
    });
  } catch (err) {
    console.error("[NewsRoute] GET /api/news error:", err.message);
    res.status(500).json({ success: false, message: "Failed to fetch news articles" });
  }
});

/**
 * GET /api/news/stats
 * Returns article counts per language
 */
router.get("/stats", async (req, res) => {
  try {
    const counts = await NewsArticle.aggregate([
      { $group: { _id: "$language", count: { $sum: 1 }, latest: { $max: "$publishedAt" } } },
    ]);
    const result = {};
    for (const c of counts) {
      result[c._id] = { count: c.count, latest: c.latest };
    }
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: "Stats fetch failed" });
  }
});

/**
 * POST /api/news/refresh
 * Manually trigger a news fetch (no auth required for now — restrict later if needed)
 */
router.post("/refresh", async (req, res) => {
  try {
    // Fire-and-forget — respond immediately
    fetchAndStoreAll().catch((e) => console.error("[NewsRoute] Manual refresh error:", e.message));
    res.status(202).json({ success: true, message: "News refresh started in background" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to trigger refresh" });
  }
});

module.exports = router;
