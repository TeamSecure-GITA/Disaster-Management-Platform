const axios = require("axios");
const CrowdSignal = require("../models/CrowdSignal");
const { getIO } = require("../sockets/socket");

// Rolling history for volume anomaly calculations: keyword -> array of counts
const mentionHistory = new Map();

// Supported keyword topics and disaster types
const MONITORED_TOPICS = [
  { keyword: "earthquake", disasterType: "earthquake", baseline: 2.0 },
  { keyword: "flood", disasterType: "flood", baseline: 1.5 },
  { keyword: "cyclone", disasterType: "cyclone", baseline: 1.0 },
  { keyword: "landslide", disasterType: "landslide", baseline: 0.8 },
  { keyword: "building collapse", disasterType: "other", baseline: 0.5 },
  { keyword: "power outage", disasterType: "other", baseline: 1.2 },
  { keyword: "dam breach", disasterType: "flood", baseline: 0.3 },
];

// Common geographic locations for fast entity recognition in text
const KNOWN_GEO_ENTITIES = [
  "Delhi", "NCR", "Mumbai", "Kolkata", "Chennai", "Bengaluru", "Hyderabad",
  "Bhubaneswar", "Cuttack", "Puri", "Guwahati", "Assam", "Sikkim", "Uttarakhand",
  "Shimla", "Manali", "Kerala", "Wayanad", "California", "Tokyo", "Taiwan", "Indonesia"
];

// Extract location mentions from post text
const extractLocations = (text) => {
  const detected = [];
  const lower = (text || "").toLowerCase();
  for (const loc of KNOWN_GEO_ENTITIES) {
    if (lower.includes(loc.toLowerCase())) {
      detected.push(loc);
    }
  }
  return [...new Set(detected)];
};

/**
 * Fetch live situational posts from decentralized social stream (Mastodon & open ATProto endpoints)
 */
const fetchSocialStreamPosts = async (keyword) => {
  const posts = [];

  // 1. Query open decentralized social stream (Mastodon global federated timeline tag)
  try {
    const res = await axios.get(
      `https://mastodon.social/api/v1/timelines/tag/${encodeURIComponent(keyword)}?limit=15`,
      {
        headers: { "User-Agent": "DisasterEarlyWarningRadar/2.0" },
        timeout: 4500,
      }
    );

    if (Array.isArray(res.data)) {
      for (const item of res.data) {
        const cleanText = (item.content || "").replace(/<[^>]+>/g, "").trim();
        if (cleanText) {
          posts.push({
            text: cleanText,
            author: item.account?.username || "social_user",
            createdAt: item.created_at ? new Date(item.created_at) : new Date(),
            uri: item.url || "",
          });
        }
      }
    }
  } catch (err) {
    // Non-fatal, stream fallback
  }

  // 2. Try Bluesky open ATProto search endpoint
  if (posts.length < 5) {
    try {
      const bskyRes = await axios.get(
        `https://public.api.bsky.app/xrpc/app.bsky.feed.searchPosts?q=${encodeURIComponent(keyword)}&limit=10`,
        {
          headers: { "User-Agent": "DisasterManagementPlatform/2.0" },
          timeout: 4000,
        }
      );
      const bskyPosts = bskyRes.data?.posts || [];
      for (const p of bskyPosts) {
        if (p.record?.text) {
          posts.push({
            text: p.record.text,
            author: p.author?.handle || "bsky_user",
            createdAt: p.record.createdAt ? new Date(p.record.createdAt) : new Date(),
            uri: `https://bsky.app/profile/${p.author?.did}/post/${p.uri?.split("/").pop()}`,
          });
        }
      }
    } catch (e) {
      // Bluesky endpoint fallback
    }
  }

  return posts;
};

/**
 * Mathematical Volume Anomaly Calculation
 * Detects whether keyword frequency exceeds baseline standard deviations (Z-Score > 2.0 or Surge Ratio > 2.0x)
 */
const computeVolumeAnomaly = (keyword, currentCount, defaultBaseline = 1.0) => {
  if (!mentionHistory.has(keyword)) {
    mentionHistory.set(keyword, [defaultBaseline, defaultBaseline, defaultBaseline]);
  }

  const history = mentionHistory.get(keyword);
  const n = history.length;
  const mean = history.reduce((acc, val) => acc + val, 0) / n;
  const variance = history.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / n;
  const stdDev = Math.sqrt(variance) || 0.5;

  const currentVelocityPerMin = currentCount;
  const baselineAvgPerMin = Math.max(0.5, parseFloat(mean.toFixed(2)));
  const surgeRatio = parseFloat((currentVelocityPerMin / baselineAvgPerMin).toFixed(2));
  const zScore = parseFloat(((currentVelocityPerMin - baselineAvgPerMin) / stdDev).toFixed(2));

  // Update rolling history (keep last 12 observation windows)
  history.push(currentCount);
  if (history.length > 12) {
    history.shift();
  }

  // Confidence calculation: higher surge ratio and Z-score yield higher early warning confidence
  const isSurge = surgeRatio >= 1.8 || zScore >= 2.0;
  const confidenceScore = Math.min(
    95,
    Math.max(25, Math.round(40 + (zScore > 0 ? zScore * 12 : 0) + (surgeRatio > 1 ? (surgeRatio - 1) * 15 : 0)))
  );

  return {
    isSurge,
    currentVelocityPerMin,
    baselineAvgPerMin,
    surgeRatio,
    zScore,
    confidenceScore,
  };
};

/**
 * Scan all monitored disaster topics and capture crowd signals
 */
const scanCrowdSignalsAndAnomalies = async () => {
  const detectedSignals = [];

  for (const topic of MONITORED_TOPICS) {
    try {
      const posts = await fetchSocialStreamPosts(topic.keyword);
      const postCount = posts.length;

      // Extract all locations across retrieved posts
      const allText = posts.map((p) => p.text).join(" ");
      const detectedLocations = extractLocations(allText);

      const anomaly = computeVolumeAnomaly(topic.keyword, postCount, topic.baseline);

      // If volume anomaly is identified, or recent posts exist, record crowd signal
      if (postCount > 0 || anomaly.isSurge) {
        const signalData = {
          keyword: topic.keyword,
          disasterType: topic.disasterType,
          currentVelocityPerMin: anomaly.currentVelocityPerMin,
          baselineAvgPerMin: anomaly.baselineAvgPerMin,
          surgeRatio: anomaly.surgeRatio,
          zScore: anomaly.zScore,
          confidenceScore: anomaly.confidenceScore,
          samplePosts: posts.slice(0, 5),
          detectedLocations,
          source: "BLUESKY_STREAM",
          status: "unverified_signal",
        };

        // Persist anomaly in DB if a surge is detected
        if (anomaly.isSurge || postCount >= 3) {
          const savedSignal = await CrowdSignal.create(signalData);
          detectedSignals.push(savedSignal);

          // Real-time broadcast to connected clients via Socket.IO
          try {
            const io = getIO();
            io.emit("crowdSignalSpike", {
              signal: savedSignal,
              timestamp: new Date(),
            });
            console.log(
              `[CrowdSignalService] 🔥 Social Media Volume Spike Detected: "${topic.keyword}" (Surge: ${anomaly.surgeRatio}x, Z: ${anomaly.zScore})`
            );
          } catch (socketErr) {}
        }
      }
    } catch (topicErr) {
      console.warn(`[CrowdSignalService] Error evaluating "${topic.keyword}":`, topicErr.message);
    }
  }

  return detectedSignals;
};

const mongoose = require("mongoose");

/**
 * Get active crowd signals for dashboard display
 */
const getActiveCrowdSignals = async (limit = 20) => {
  if (mongoose.connection.readyState !== 1) {
    // Return empty array gracefully when DB is not connected
    return [];
  }

  let signals = await CrowdSignal.find({ status: "unverified_signal" })
    .sort({ createdAt: -1 })
    .limit(limit);

  // If DB is empty, run an immediate live scan
  if (signals.length === 0) {
    await scanCrowdSignalsAndAnomalies();
    signals = await CrowdSignal.find({ status: "unverified_signal" })
      .sort({ createdAt: -1 })
      .limit(limit);
  }

  return signals;
};

/**
 * Verify or escalate a crowd signal into a formal incident
 */
const verifyCrowdSignal = async (signalId, userId, action = "escalate", notes = "") => {
  const signal = await CrowdSignal.findById(signalId);
  if (!signal) throw new Error("Crowd signal not found");

  signal.status = action === "escalate" ? "escalated_to_incident" : "dismissed";
  signal.verifiedBy = userId;
  signal.verifiedAt = new Date();
  signal.notes = notes;
  await signal.save();

  return signal;
};

module.exports = {
  scanCrowdSignalsAndAnomalies,
  getActiveCrowdSignals,
  verifyCrowdSignal,
  computeVolumeAnomaly,
  extractLocations,
  MONITORED_TOPICS,
};
