const cron = require("node-cron");
const { fetchAndStoreAll } = require("../services/newsService");

let isRunning = false;

/**
 * Start the news fetcher cron job.
 * Runs every 6 hours: at 00:00, 06:00, 12:00, 18:00.
 * Also runs once immediately on server startup.
 */
function startNewsFetcherJob() {
  // Immediate first fetch (30s delay so DB has time to connect)
  setTimeout(async () => {
    if (isRunning) return;
    isRunning = true;
    console.log("[NewsFetcher] 🚀 Running initial news fetch on startup...");
    try {
      await fetchAndStoreAll();
    } catch (err) {
      console.error("[NewsFetcher] Startup fetch error:", err.message);
    } finally {
      isRunning = false;
    }
  }, 30_000);

  // Scheduled fetch every 6 hours
  cron.schedule("0 */6 * * *", async () => {
    if (isRunning) {
      console.log("[NewsFetcher] Skipping scheduled run — previous fetch still in progress");
      return;
    }
    isRunning = true;
    console.log("[NewsFetcher] ⏰ Scheduled news fetch starting...");
    try {
      await fetchAndStoreAll();
    } catch (err) {
      console.error("[NewsFetcher] Scheduled fetch error:", err.message);
    } finally {
      isRunning = false;
    }
  });

  console.log("[NewsFetcher] ✅ Cron job registered — runs every 6 hours");
}

module.exports = { startNewsFetcherJob };
