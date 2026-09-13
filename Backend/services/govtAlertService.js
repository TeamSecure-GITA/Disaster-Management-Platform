const axios = require("axios");
const Alert = require("../models/Alert");
const Notification = require("../models/Notification");
const { getIO } = require("../sockets/socket");

// Cache for recent external IDs to prevent redundant DB calls
const processedAlertIds = new Set();

// Real-time tracking of programmatic feeds health & latency
const feedHealth = {
  ndma_sachet: {
    name: "India National CAP Feed (NDMA SACHET)",
    agency: "National Disaster Management Authority (NDMA) / IMD / CWC / INCOIS",
    status: "healthy",
    lastSync: null,
    totalIngested: 0,
    latencyMs: 0,
    error: null,
  },
  gdacs: {
    name: "GDACS RSS & Automated Alerts",
    agency: "United Nations (UN OCHA) & European Commission",
    status: "healthy",
    lastSync: null,
    totalIngested: 0,
    latencyMs: 0,
    error: null,
  },
  usgs: {
    name: "USGS Real-time 60s Seismic Feed",
    agency: "U.S. Geological Survey Earthquake Hazards Program",
    status: "healthy",
    lastSync: null,
    totalIngested: 0,
    latencyMs: 0,
    error: null,
  },
};

// Official Government Disaster Portals Metadata
const OFFICIAL_GOVT_PORTALS = [
  {
    id: "ndma-sachet",
    name: "NDMA SACHET - National Disaster Alert Portal",
    agency: "National Disaster Management Authority (NDMA), Govt of India",
    nodalAgencies: ["IMD", "CWC", "INCOIS"],
    url: "https://sachet.ndma.gov.in/",
    type: "Common Alerting Protocol (CAP-CP)",
    description: "Instant geo-targeted CAP alerts from India Meteorological Department (IMD), Central Water Commission (CWC), and INCOIS.",
    badge: "India National CAP Feed",
    feedSource: "NDMA_SACHET_CAP",
  },
  {
    id: "gdacs-global",
    name: "GDACS - Global Disaster Alert & Coordination System",
    agency: "United Nations (OCHA) & European Commission",
    nodalAgencies: ["UN OCHA", "European Commission JRC"],
    url: "https://www.gdacs.org/",
    type: "Automated Multi-Hazard Alerts",
    description: "Automated, human-intervention-free impact calculations for earthquakes, tsunamis, floods, and cyclones within minutes of detection.",
    badge: "UN / EC Automated Feed",
    feedSource: "GDACS_RSS",
  },
  {
    id: "usgs-earthquakes",
    name: "USGS Earthquake Hazards Real-time Feed",
    agency: "U.S. Geological Survey",
    nodalAgencies: ["USGS", "ANSS"],
    url: "https://earthquake.usgs.gov/earthquakes/feed/",
    type: "Global 60-Second Real-Time Seismic GeoJSON",
    description: "Minute-by-minute automated seismic detection stream providing the fastest pre-shock and aftershock early warnings.",
    badge: "USGS 60s Gold Standard",
    feedSource: "USGS_GEOJSON",
  },
];

// Helper: Map GDACS event codes to system disaster types
const mapGdacsEventType = (eventType) => {
  const code = (eventType || "").toUpperCase();
  switch (code) {
    case "TC":
      return "cyclone";
    case "FL":
      return "flood";
    case "EQ":
      return "earthquake";
    case "TS":
      return "tsunami";
    case "WF":
      return "fire";
    case "DR":
      return "storm";
    case "VO":
      return "other";
    default:
      return "storm";
  }
};

// Helper: Map GDACS alert levels
const mapGdacsAlertLevel = (level) => {
  const lvl = (level || "").toLowerCase();
  if (lvl.includes("red")) return "critical";
  if (lvl.includes("orange")) return "high";
  if (lvl.includes("green")) return "medium";
  return "low";
};

// Parse GDACS XML items safely
const parseGdacsRss = (xmlText) => {
  const alerts = [];
  const itemMatches = xmlText.match(/<item[\s\S]*?<\/item>/gi) || [];

  for (const itemXml of itemMatches.slice(0, 30)) {
    try {
      const getTag = (tag) => {
        const match = itemXml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
        return match ? match[1].trim().replace(/<!\[CDATA\[([\s\S]*?)\]\]>/gi, "$1").trim() : "";
      };

      const title = getTag("title");
      const link = getTag("link");
      const description = getTag("description");
      const pubDate = getTag("pubDate");
      const lat = parseFloat(getTag("geo:lat"));
      const lon = parseFloat(getTag("geo:long"));
      const eventType = getTag("gdacs:eventtype");
      const alertLevel = getTag("gdacs:alertlevel");
      const country = getTag("gdacs:country") || "International";
      const eventId = getTag("gdacs:eventid") || "";
      const capUrl = getTag("gdacs:cap") || "";
      const severityDesc = getTag("gdacs:severity") || "";
      const population = getTag("gdacs:population") || "";
      const alertScore = getTag("gdacs:alertscore") || "";

      if (!title || !link) continue;

      const coordinates = !isNaN(lon) && !isNaN(lat) ? [lon, lat] : [85.8245, 20.2961];
      const severity = mapGdacsAlertLevel(alertLevel);
      const disasterType = mapGdacsEventType(eventType);
      const externalId = `gdacs_${eventType}_${eventId || Buffer.from(title).toString("base64").slice(0, 16)}`;

      // Calculate minutes elapsed since pubDate for latency metric
      const eventTime = pubDate ? new Date(pubDate).getTime() : Date.now();
      const elapsedMins = Math.max(0, Math.round((Date.now() - eventTime) / 60000));

      const instructions = [
        "Follow directives from local emergency response authorities immediately.",
        "Check official GDACS and local meteorological agency bulletins for trajectory updates.",
        "Prepare emergency grab-and-go kit (water, battery radio, medical kit, documents).",
      ];
      if (disasterType === "cyclone" || disasterType === "tsunami") {
        instructions.push("Stay clear of coastline, beaches, estuaries, and low-lying coastal paths.");
      }

      alerts.push({
        title: `[GDACS/UN] ${title}`,
        message: description || `Automated GDACS alert issued for ${country}. Level: ${alertLevel}. ${severityDesc}`,
        type: disasterType,
        severity,
        location: {
          type: "Point",
          coordinates,
        },
        radiusKm: severity === "critical" ? 60 : severity === "high" ? 35 : 20,
        isGovtOfficial: true,
        sourceAgency: "GDACS (UN OCHA / European Commission)",
        sourceNodalAgency: "UN OCHA / EC JRC",
        feedSource: "GDACS_RSS",
        sourceUrl: link.startsWith("http") ? link : "https://www.gdacs.org/",
        externalId,
        country,
        affectedAreas: [country],
        earlyWarningLeadTimeMinutes: elapsedMins,
        urgency: severity === "critical" ? "Immediate" : "Expected",
        certainty: "Observed",
        metadata: {
          feedType: "GDACS_RSS",
          alertLevel,
          alertScore,
          capUrl,
          severityDesc,
          population,
          automatedCalculation: true,
        },
        instructions,
        createdAt: pubDate ? new Date(pubDate) : new Date(),
      });
    } catch (e) {
      // Skip malformed item
    }
  }

  return alerts;
};

/**
 * 1. Programmatic Feed: GDACS RSS & Automated Impact Feeds
 * Ingests automated calculations directly from GDACS / UN OCHA
 */
const fetchGdacsAlerts = async () => {
  const startTime = Date.now();
  try {
    const urls = [
      "https://www.gdacs.org/xml/rss.xml",
      "https://www.gdacs.org/xml/rss_24h.xml",
    ];

    for (const url of urls) {
      try {
        const response = await axios.get(url, {
          headers: { "User-Agent": "DisasterManagementPlatform/2.0 (GDACS-Monitor)" },
          timeout: 7000,
        });
        if (response.data && response.data.includes("<rss")) {
          const parsed = parseGdacsRss(response.data);
          feedHealth.gdacs.status = "healthy";
          feedHealth.gdacs.lastSync = new Date();
          feedHealth.gdacs.latencyMs = Date.now() - startTime;
          feedHealth.gdacs.totalIngested += parsed.length;
          feedHealth.gdacs.error = null;
          return parsed;
        }
      } catch (innerErr) {
        // Try fallback url
      }
    }
    throw new Error("All GDACS endpoints unreachable");
  } catch (error) {
    feedHealth.gdacs.status = "degraded";
    feedHealth.gdacs.error = error.message;
    console.warn("[GovtAlertService] GDACS feed warning:", error.message);
    return [];
  }
};

/**
 * 2. Programmatic Feed: USGS Real-time GeoJSON Feeds
 * Ingests earthquakes updating every minute (all_hour.geojson & all_day.geojson)
 * Gold standard for seismic early warning detection.
 */
const fetchUsgsAlerts = async () => {
  const startTime = Date.now();
  try {
    // Prefer all_hour.geojson (fastest, minute-by-minute updates)
    let features = [];
    let usedEndpoint = "all_hour";

    try {
      const response = await axios.get(
        "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson",
        {
          headers: { "User-Agent": "DisasterManagementPlatform/2.0 (USGS-Seismic-Ingest)" },
          timeout: 6000,
        }
      );
      features = response.data?.features || [];
    } catch (e) {
      // Fallback to all_day.geojson if hour had network glitch
      usedEndpoint = "all_day";
      const fallbackRes = await axios.get(
        "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson",
        {
          headers: { "User-Agent": "DisasterManagementPlatform/2.0 (USGS-Seismic-Ingest)" },
          timeout: 8000,
        }
      );
      features = fallbackRes.data?.features || [];
    }

    // If all_hour had very few events, supplement with recent high-magnitude events from all_day
    if (features.length < 5 && usedEndpoint === "all_hour") {
      try {
        const dayRes = await axios.get(
          "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson",
          {
            headers: { "User-Agent": "DisasterManagementPlatform/2.0" },
            timeout: 5000,
          }
        );
        const dayFeatures = dayRes.data?.features || [];
        const seen = new Set(features.map((f) => f.id));
        for (const df of dayFeatures) {
          if (!seen.has(df.id)) {
            features.push(df);
            seen.add(df.id);
          }
        }
      } catch (ignore) {}
    }

    const alerts = features.slice(0, 20).map((feature) => {
      const { mag, place, time, url, title, tsunami, sig, felt } = feature.properties;
      const [lon, lat, depth] = feature.geometry?.coordinates || [0, 0, 0];

      // Determine severity based on Richter magnitude
      const severity =
        mag >= 6.5
          ? "critical"
          : mag >= 5.0 || tsunami === 1
          ? "high"
          : mag >= 3.5
          ? "medium"
          : "low";

      // Calculate time latency since detection in seconds
      const detectionLatencySec = Math.max(0, Math.round((Date.now() - (time || Date.now())) / 1000));
      const countryOrState = place ? place.split(",").pop()?.trim() || "Seismic Zone" : "Global";

      const instructions = [
        "DROP, COVER, and HOLD ON immediately under sturdy furniture.",
        "Stay indoors until shaking stops; avoid windows, exterior walls, and falling objects.",
        "After shaking, check for gas leaks, electrical faults, and structural cracks before moving.",
      ];
      if (tsunami === 1) {
        instructions.unshift("TSUNAMI ADVISORY: Evacuate coastal lowlands and move to high ground immediately!");
      }

      return {
        title: `[USGS Real-time Seismic] ${title || `M ${mag} Earthquake - ${place}`}`,
        message: `A magnitude ${mag} earthquake occurred at ${place} (Depth: ${depth} km). Captured by USGS real-time monitoring within ${detectionLatencySec}s of detection.${tsunami === 1 ? " Tsunami warning flag ACTIVE." : ""}`,
        type: tsunami === 1 ? "tsunami" : "earthquake",
        severity,
        location: {
          type: "Point",
          coordinates: [lon, lat],
        },
        radiusKm: mag >= 6.0 ? 70 : mag >= 4.5 ? 40 : 20,
        isGovtOfficial: true,
        sourceAgency: "USGS Earthquake Hazards Program",
        sourceNodalAgency: "USGS / ANSS",
        feedSource: "USGS_GEOJSON",
        sourceUrl: url || "https://earthquake.usgs.gov/earthquakes/map/",
        externalId: `usgs_${feature.id}`,
        country: countryOrState,
        affectedAreas: [place || "Seismic Zone"],
        earlyWarningLeadTimeMinutes: Math.round(detectionLatencySec / 60),
        urgency: "Immediate",
        certainty: "Observed",
        metadata: {
          feedType: "USGS_GEOJSON",
          magnitude: mag,
          depthKm: depth,
          tsunamiFlag: tsunami === 1,
          significanceScore: sig,
          feltReports: felt || 0,
          detectionLatencySeconds: detectionLatencySec,
        },
        instructions,
        createdAt: time ? new Date(time) : new Date(),
      };
    });

    feedHealth.usgs.status = "healthy";
    feedHealth.usgs.lastSync = new Date();
    feedHealth.usgs.latencyMs = Date.now() - startTime;
    feedHealth.usgs.totalIngested += alerts.length;
    feedHealth.usgs.error = null;

    return alerts;
  } catch (error) {
    feedHealth.usgs.status = "degraded";
    feedHealth.usgs.error = error.message;
    console.warn("[GovtAlertService] USGS feed warning:", error.message);
    return [];
  }
};

/**
 * 3. Programmatic Feed: India National CAP Feed via NDMA SACHET
 * Aggregates instant, geo-targeted emergency warnings directly from:
 * - India Meteorological Department (IMD) (Nowcast alerts, severe weather, cyclones)
 * - Central Water Commission (CWC) (Flood warnings)
 * - INCOIS (Ocean / Tsunami alerts)
 */
const fetchSachetCapAlerts = async () => {
  const startTime = Date.now();
  const alerts = [];

  try {
    // A. Fetch IMD Nowcast & Severe Weather CAP Alerts from SACHET
    try {
      const nowcastRes = await axios.get(
        "https://sachet.ndma.gov.in/cap_public_website/FetchIMDNowcastAlerts",
        {
          headers: {
            "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/119.0",
            Referer: "https://sachet.ndma.gov.in/",
            Accept: "application/json, text/plain, */*",
          },
          timeout: 12000,
        }
      );

      const nowcastList = nowcastRes.data?.nowcastDetails || [];
      for (const item of nowcastList.slice(0, 30)) {
        try {
          const {
            identifier,
            severity,
            severity_color,
            effective_start_time,
            effective_end_time,
            area_description,
            source,
            event_category,
            events,
            location,
          } = item;

          if (!identifier || !area_description) continue;

          // Map severity color: Red -> critical, Orange -> high, Yellow -> medium
          const color = (severity_color || "").toLowerCase();
          const mappedSeverity =
            color.includes("red")
              ? "critical"
              : color.includes("orange")
              ? "high"
              : "medium";

          // Disaster type mapping
          const cat = (event_category || "").toLowerCase();
          let disasterType = "storm";
          if (cat.includes("flood") || (events || "").toLowerCase().includes("inundation")) {
            disasterType = "flood";
          } else if (cat.includes("cyclone") || (events || "").toLowerCase().includes("cyclonic")) {
            disasterType = "cyclone";
          } else if (cat.includes("heat") || (events || "").toLowerCase().includes("heat")) {
            disasterType = "heatwave";
          }

          // Coordinates
          let coords = [85.8245, 20.2961];
          if (location && Array.isArray(location.coordinates) && location.coordinates.length >= 2) {
            coords = location.coordinates;
          }

          // Calculate early warning lead time (time remaining until warning expires)
          let leadTimeMins = 120;
          if (effective_end_time) {
            const end = new Date(effective_end_time).getTime();
            if (!isNaN(end)) {
              leadTimeMins = Math.max(0, Math.round((end - Date.now()) / 60000));
            }
          }

          const nodalAgency = (source || "IMD").toUpperCase();

          const instructions = [
            `Active Nowcast from ${nodalAgency}: Take immediate precaution in ${area_description}.`,
            "Stay away from open fields, electrical conductors, tin roofs, and tall trees.",
            "Unplug electrical equipment and seek shelter inside permanent pucca buildings.",
          ];
          if (events && events.toLowerCase().includes("lightning")) {
            instructions.unshift("⚡ LIGHTNING DANGER: Seek enclosed indoor shelter immediately. Avoid water bodies.");
          }

          alerts.push({
            title: `[NDMA SACHET / ${nodalAgency}] ${event_category || "Severe Weather"}: ${area_description}`,
            message: `Instant CAP Nowcast issued by ${nodalAgency} for ${area_description}. Conditions: ${events || "Severe weather activity detected"}. Valid from ${effective_start_time || "Now"} until ${effective_end_time || "Advisory close"}.`,
            type: disasterType,
            severity: mappedSeverity,
            location: {
              type: "Point",
              coordinates: coords,
            },
            radiusKm: mappedSeverity === "critical" ? 45 : 30,
            isGovtOfficial: true,
            sourceAgency: `NDMA SACHET (${nodalAgency})`,
            sourceNodalAgency: nodalAgency,
            feedSource: "NDMA_SACHET_CAP",
            sourceUrl: "https://sachet.ndma.gov.in/",
            externalId: `sachet_cap_${identifier}`,
            country: "India",
            affectedAreas: [area_description],
            earlyWarningLeadTimeMinutes: leadTimeMins,
            urgency: "Immediate",
            certainty: "Observed",
            metadata: {
              feedType: "NDMA_SACHET_CAP",
              nodalAgency,
              effectiveStartTime: effective_start_time,
              effectiveEndTime: effective_end_time,
              severityColor: severity_color,
              eventsDetail: events,
              rawIdentifier: identifier,
            },
            instructions,
            createdAt: effective_start_time ? new Date(effective_start_time) : new Date(),
          });
        } catch (itemErr) {
          // Skip malformed item
        }
      }
    } catch (nowcastErr) {
      console.warn("[GovtAlertService] SACHET Nowcast fetch note:", nowcastErr.message);
    }

    // B. Check Cyclone CAP endpoint from SACHET
    try {
      const cycloneRes = await axios.get(
        "https://sachet.ndma.gov.in/cap_public_website/FetchCycloneDetails",
        {
          headers: {
            "User-Agent": "Mozilla/5.0",
            Referer: "https://sachet.ndma.gov.in/",
          },
          timeout: 8000,
        }
      );

      const cyclones = Array.isArray(cycloneRes.data) ? cycloneRes.data : [];
      for (const cyc of cyclones) {
        if (cyc.name || cyc.title) {
          alerts.push({
            title: `[NDMA SACHET / IMD] Cyclone Bulletin: ${cyc.name || cyc.title}`,
            message: cyc.description || `Active cyclone system monitored by IMD Cyclone Warning Centre.`,
            type: "cyclone",
            severity: "critical",
            location: {
              type: "Point",
              coordinates: cyc.coordinates || [86.8315, 19.8135],
            },
            radiusKm: 75,
            isGovtOfficial: true,
            sourceAgency: "NDMA SACHET (IMD Cyclone Division)",
            sourceNodalAgency: "IMD",
            feedSource: "NDMA_SACHET_CAP",
            sourceUrl: "https://sachet.ndma.gov.in/",
            externalId: `sachet_cyclone_${cyc.id || cyc.name}`,
            country: "India",
            affectedAreas: cyc.affectedAreas || ["Coastal Belt"],
            earlyWarningLeadTimeMinutes: 240,
            urgency: "Immediate",
            certainty: "Observed",
            metadata: {
              feedType: "NDMA_SACHET_CAP",
              nodalAgency: "IMD",
              cycloneName: cyc.name,
            },
            instructions: [
              "Evacuate vulnerable kutcha houses to designated cyclone shelters.",
              "Fishermen must suspend all deep sea and coastal operations.",
              "Store emergency food, drinking water, flashlights, and power banks.",
            ],
            createdAt: new Date(),
          });
        }
      }
    } catch (cycErr) {
      // Cyclone endpoint may be empty when no cyclone is active
    }

    if (alerts.length > 0) {
      feedHealth.ndma_sachet.status = "healthy";
      feedHealth.ndma_sachet.lastSync = new Date();
      feedHealth.ndma_sachet.latencyMs = Date.now() - startTime;
      feedHealth.ndma_sachet.totalIngested += alerts.length;
      feedHealth.ndma_sachet.error = null;
    } else {
      feedHealth.ndma_sachet.status = "healthy";
      feedHealth.ndma_sachet.lastSync = new Date();
      feedHealth.ndma_sachet.latencyMs = Date.now() - startTime;
    }

    return alerts;
  } catch (error) {
    feedHealth.ndma_sachet.status = "degraded";
    feedHealth.ndma_sachet.error = error.message;
    console.warn("[GovtAlertService] SACHET CAP feed error:", error.message);
    return [];
  }
};

/**
 * Synchronize all 3 official programmatic feeds:
 * 1. GDACS RSS & Automated Feeds (UN OCHA / EC)
 * 2. India National CAP Feed via NDMA SACHET (IMD / CWC / INCOIS)
 * 3. USGS 60-Second Real-time Seismic GeoJSON
 *
 * Saves new events and broadcasts immediately to connected citizens via Socket.IO
 */
const fetchAndSyncGovtAlerts = async () => {
  try {
    console.log("[GovtAlertService] Polling programmatic feeds (GDACS, NDMA SACHET, USGS)...");

    // Fetch all 3 direct feeds in parallel
    const [gdacsAlerts, usgsAlerts, sachetAlerts] = await Promise.all([
      fetchGdacsAlerts(),
      fetchUsgsAlerts(),
      fetchSachetCapAlerts(),
    ]);

    const combinedAlerts = [...sachetAlerts, ...gdacsAlerts, ...usgsAlerts];
    const newlyCreatedAlerts = [];

    for (const alertData of combinedAlerts) {
      if (!alertData.externalId) continue;

      // Fast in-memory deduplication check
      if (processedAlertIds.has(alertData.externalId)) continue;

      // Database deduplication check
      const existingAlert = await Alert.findOne({ externalId: alertData.externalId });
      if (existingAlert) {
        processedAlertIds.add(alertData.externalId);
        continue;
      }

      // Create new Alert in database
      const newAlert = await Alert.create({
        ...alertData,
        status: "active",
      });

      processedAlertIds.add(alertData.externalId);
      newlyCreatedAlerts.push(newAlert);

      // Create broadcast Notification
      const newNotification = await Notification.create({
        title: newAlert.title,
        message: newAlert.message,
        type: newAlert.type === "flood" || newAlert.type === "cyclone" ? "alert" : "weather",
        priority: newAlert.severity === "critical" ? "critical" : "high",
        isBroadcast: true,
        sourceUrl: newAlert.sourceUrl,
        sourceAgency: newAlert.sourceAgency,
        externalId: newAlert.externalId,
        channels: ["in-app", "push"],
        metadata: {
          alertId: newAlert._id,
          sourceAgency: newAlert.sourceAgency,
          sourceNodalAgency: newAlert.sourceNodalAgency,
          feedSource: newAlert.feedSource,
          earlyWarningLeadTimeMinutes: newAlert.earlyWarningLeadTimeMinutes,
          sourceUrl: newAlert.sourceUrl,
          severity: newAlert.severity,
          location: newAlert.affectedAreas?.[0] || "Regional",
        },
      });

      // Immediate real-time broadcast to citizens via Socket.IO
      try {
        const io = getIO();
        io.to("alerts").emit("newAlert", newAlert);
        io.emit("govtDisasterAlert", {
          alert: newAlert,
          notification: newNotification,
        });

        // Dedicated early warning channel for immediate pre-impact alarms
        if (newAlert.severity === "critical" || newAlert.severity === "high") {
          io.emit("earlyWarningAlert", {
            alert: newAlert,
            notification: newNotification,
            leadTimeMinutes: newAlert.earlyWarningLeadTimeMinutes,
            feedSource: newAlert.feedSource,
            nodalAgency: newAlert.sourceNodalAgency,
            timestamp: new Date(),
          });
        }

        console.log(`[GovtAlertService] 🚨 Broadcasted Early Warning [${newAlert.feedSource}]: ${newAlert.title}`);
      } catch (socketError) {
        // Socket may not be initialized in headless test runs
      }
    }

    console.log(
      `[GovtAlertService] Sync completed. Feeds checked: ${combinedAlerts.length} items (SACHET: ${sachetAlerts.length}, GDACS: ${gdacsAlerts.length}, USGS: ${usgsAlerts.length}), New alerts created & broadcast: ${newlyCreatedAlerts.length}`
    );

    return {
      success: true,
      syncedCount: combinedAlerts.length,
      newAlertsCount: newlyCreatedAlerts.length,
      newAlerts: newlyCreatedAlerts,
      breakdown: {
        sachetCount: sachetAlerts.length,
        gdacsCount: gdacsAlerts.length,
        usgsCount: usgsAlerts.length,
      },
    };
  } catch (error) {
    console.error("[GovtAlertService] Sync error:", error.message);
    return {
      success: false,
      error: error.message,
      syncedCount: 0,
      newAlertsCount: 0,
      newAlerts: [],
    };
  }
};

/**
 * Retrieve active official alerts with optional feed filter
 */
const getLiveGovtAlerts = async (filterSource = "all") => {
  const query = { isGovtOfficial: true, status: "active" };

  if (filterSource && filterSource !== "all") {
    if (filterSource === "ndma" || filterSource === "sachet") {
      query.feedSource = "NDMA_SACHET_CAP";
    } else if (filterSource === "gdacs") {
      query.feedSource = "GDACS_RSS";
    } else if (filterSource === "usgs") {
      query.feedSource = "USGS_GEOJSON";
    }
  }

  let alerts = await Alert.find(query)
    .sort({ createdAt: -1 })
    .limit(50);

  // If DB has fewer than 2 alerts, perform an immediate on-demand sync
  if (alerts.length < 2) {
    await fetchAndSyncGovtAlerts();
    alerts = await Alert.find(query)
      .sort({ createdAt: -1 })
      .limit(50);
  }

  return alerts;
};

/**
 * Return live programmatic feed health statistics
 */
const getFeedHealthStatus = () => {
  return {
    timestamp: new Date(),
    feeds: feedHealth,
    portals: OFFICIAL_GOVT_PORTALS,
  };
};

module.exports = {
  fetchAndSyncGovtAlerts,
  getLiveGovtAlerts,
  getFeedHealthStatus,
  getOfficialGovtPortals: () => OFFICIAL_GOVT_PORTALS,
  OFFICIAL_GOVT_PORTALS,
  // Export individual fetchers for automated testing
  fetchGdacsAlerts,
  fetchUsgsAlerts,
  fetchSachetCapAlerts,
  parseGdacsRss,
};
