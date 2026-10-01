/**
 * distributedLock.js
 *
 * Provides a lightweight MongoDB-backed distributed lease/lock for scheduled
 * jobs. When multiple backend API instances run concurrently in a scaled-out
 * cloud environment, this ensures only one instance acquires the lock to execute
 * the cron job, preventing duplicated alert fan-outs and database writes.
 */

"use strict";

const mongoose = require("mongoose");

const lockSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true }, // Job identifier
    lockedBy: { type: String, required: true }, // Instance hostname / PID
    expiresAt: { type: Date, required: true, index: { expires: 0 } }, // TTL automatic expiry
    acquiredAt: { type: Date, default: Date.now },
  },
  { collection: "cron_locks", versionKey: false }
);

const CronLock = mongoose.models.CronLock || mongoose.model("CronLock", lockSchema);

/**
 * Execute an async job wrapped with a distributed lock.
 *
 * @param {string} jobName - Unique name for the job (e.g. 'landslide-alert-job')
 * @param {number} lockDurationSeconds - How long the lock is held (e.g. 120s)
 * @param {Function} taskFn - The async function to execute if lock acquired
 * @returns {Promise<boolean>} True if task executed, false if another instance holds the lock
 */
async function withDistributedLock(jobName, lockDurationSeconds, taskFn) {
  // If database is not connected, skip locking and attempt local run
  if (mongoose.connection.readyState !== 1) {
    console.warn(`[DistributedLock] DB not connected; executing ${jobName} without lock`);
    await taskFn();
    return true;
  }

  const now = new Date();
  const expiresAt = new Date(now.getTime() + lockDurationSeconds * 1000);
  const instanceId = `${process.env.HOSTNAME || "instance"}-${process.pid}-${Math.random().toString(36).slice(2, 7)}`;

  try {
    // Atomic upsert: Acquire lock if non-existent OR expired
    const acquired = await CronLock.findOneAndUpdate(
      {
        _id: jobName,
        $or: [
          { expiresAt: { $lt: now } },
          { lockedBy: instanceId },
        ],
      },
      {
        $set: {
          lockedBy: instanceId,
          expiresAt,
          acquiredAt: now,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    if (!acquired || acquired.lockedBy !== instanceId) {
      return false; // Another instance is holding the active lock
    }

    try {
      await taskFn();
    } finally {
      // Release lock on completion so next run is clean
      await CronLock.deleteOne({ _id: jobName, lockedBy: instanceId }).catch(() => {});
    }

    return true;
  } catch (err) {
    if (err.code === 11000) {
      // E11000 duplicate key - another replica holds the active lock
      return false;
    }
    console.warn(`[DistributedLock] Error acquiring lock for ${jobName}:`, err.message);
    return false;
  }
}

module.exports = { withDistributedLock, CronLock };
