const cron = require("node-cron");
const LoRaBeacon = require("../models/LoRaBeacon");
const { emitBeaconStatus, emitMeshHeartbeat } = require("../sockets/meshSocket");

let meshHealthTask = null;

/**
 * Start the mesh health monitoring cron job.
 * Runs every 5 minutes to:
 *  1. Mark beacons as "offline" if no heartbeat in 15 minutes
 *  2. Emit low-battery warnings for beacons with batteryLevel < 20%
 *  3. Broadcast a network health summary via socket
 */
const startMeshHealthJob = () => {
  if (meshHealthTask) {
    console.log("[MeshHealth] Cron job already running, skipping duplicate start");
    return;
  }

  meshHealthTask = cron.schedule("*/5 * * * *", async () => {
    try {
      const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);

      // ── Mark stale beacons as offline ────────────────────────────────────
      const staleBeacons = await LoRaBeacon.find({
        status: { $in: ["online", "low_battery"] },
        lastHeartbeat: { $lt: fifteenMinutesAgo },
      });

      for (const beacon of staleBeacons) {
        await LoRaBeacon.findByIdAndUpdate(beacon._id, { status: "offline" });

        emitBeaconStatus({
          beaconId: beacon._id,
          deviceEui: beacon.deviceEui,
          name: beacon.name,
          villageName: beacon.villageName,
          status: "offline",
          previousStatus: beacon.status,
        });
      }

      if (staleBeacons.length > 0) {
        console.log(
          `[MeshHealth] Marked ${staleBeacons.length} beacon(s) as offline (no heartbeat > 15m)`
        );
      }

      // ── Emit network health summary ──────────────────────────────────────
      const allBeacons = await LoRaBeacon.find();
      const total = allBeacons.length;

      if (total > 0) {
        const online = allBeacons.filter((b) => b.status === "online").length;
        const lowBattery = allBeacons.filter(
          (b) => b.status === "low_battery"
        ).length;
        const offline = allBeacons.filter((b) => b.status === "offline").length;

        const batteried = allBeacons.filter((b) => b.batteryLevel !== null);
        const avgBattery =
          batteried.length > 0
            ? Math.round(
                batteried.reduce((sum, b) => sum + b.batteryLevel, 0) /
                  batteried.length
              )
            : 0;

        emitMeshHeartbeat({
          totalBeacons: total,
          online,
          offline,
          lowBattery,
          onlinePercent: Math.round((online / total) * 100),
          avgBattery,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error("[MeshHealth] Cron job error:", error.message);
    }
  });

  console.log("[MeshHealth] ✅ Beacon health monitoring started (every 5 minutes)");
};

const stopMeshHealthJob = () => {
  if (meshHealthTask) {
    meshHealthTask.stop();
    meshHealthTask = null;
    console.log("[MeshHealth] Cron job stopped");
  }
};

module.exports = {
  startMeshHealthJob,
  stopMeshHealthJob,
};
