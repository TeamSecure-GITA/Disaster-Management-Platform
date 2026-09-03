const axios = require("axios");
const Alert = require("../models/Alert");
const Notification = require("../models/Notification");
const { getIO } = require("../sockets/socket");

// Cache for recent external IDs to prevent redundant DB calls
const processedAlertIds = new Set();

// Official Government Disaster & Weather Portals
const OFFICIAL_GOVT_PORTALS = [
  {
    id: "ndma-sachet",
    name: "NDMA SACHET - National Disaster Alert Portal",
    agency: "National Disaster Management Authority (NDMA), Govt of India",
    url: "https://sachet.ndma.gov.in/",
    type: "All Disasters",
    description: "Official CAP-compliant disaster warning & alert portal of Govt of India covering all states.",
    badge: "Official Govt Portal",
  },
  {
    id: "imd-mausam",
    name: "IMD Mausam - Weather Warning Bulletin",
    agency: "India Meteorological Department (IMD), Govt of India",
    url: "https://mausam.imd.gov.in/",
    type: "Severe Weather & Cyclones",
    description: "National weather warnings, cyclone bulletins, intense rainfall, and thunderstorm advisories.",
    badge: "Official Weather Bureau",
  },
  {
    id: "cwc-flood",
    name: "Central Water Commission Flood Forecast",
    agency: "Ministry of Jal Shakti, Govt of India",
    url: "https://ffs.india-water.gov.in/",
    type: "River Basin & Inundation Alerts",
    description: "Live flood monitoring, dam outflow advisories, and hydrological forecasting across India.",
    badge: "Govt Flood Warning",
  },
  {
    id: "gdacs-global",
    name: "GDACS - Global Disaster Alert & Coordination System",
    agency: "United Nations (OCHA) & European Commission",
    url: "https://www.gdacs.org/",
    type: "Multi-Hazard Global Monitoring",
    description: "Worldwide real-time alerts for cyclones, tsunamis, floods, earthquakes, and volcanic events.",
    badge: "UN / International",
  },
  {
    id: "usgs-earthquakes",
    name: "USGS Earthquake Hazards Program",
    agency: "U.S. Geological Survey",
    url: "https://earthquake.usgs.gov/earthquakes/map/",
    type: "Global Seismic Activity",
    description: "Real-time global earthquake monitoring and epicenter coordinates.",
    badge: "Official Seismic Service",
  },
];

// Helper to map GDACS event types to system types
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
    case "VO":
    default:
      return "storm";
  }
};

// Helper to map GDACS alert levels to system severity
const mapGdacsAlertLevel = (level) => {
  const lvl = (level || "").toLowerCase();
  if (lvl.includes("red")) return "critical";
  if (lvl.includes("orange")) return "high";
  return "medium";
};

// Helper to parse GDACS RSS feed XML with regex (fast, zero dependencies)
const parseGdacsRss = (xmlText) => {
  const alerts = [];
  const itemMatches = xmlText.match(/<item[\s\S]*?<\/item>/gi) || [];

  for (const itemXml of itemMatches.slice(0, 15)) {
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

      if (!title || !link) continue;

      const coordinates = !isNaN(lon) && !isNaN(lat) ? [lon, lat] : [85.8245, 20.2961];
      const severity = mapGdacsAlertLevel(alertLevel);
      const disasterType = mapGdacsEventType(eventType);
      const externalId = `gdacs_${eventType}_${eventId || Buffer.from(title).toString("base64").slice(0, 16)}`;

      alerts.push({
        title: `[GDACS/UN] ${title}`,
        message: description || `Live alert issued by GDACS for ${country}. Level: ${alertLevel || "Active"}.`,
        type: disasterType,
        severity,
        location: {
          type: "Point",
          coordinates,
        },
        radiusKm: severity === "critical" ? 50 : 25,
        isGovtOfficial: true,
        sourceAgency: "GDACS (UN OCHA / European Commission)",
        sourceUrl: link.startsWith("http") ? link : "https://www.gdacs.org/",
        externalId,
        country,
        affectedAreas: [country],
        instructions: [
          "Follow directives from local emergency response authorities.",
          "Check official GDACS & local meteorological bulletins for updates.",
          "Prepare emergency supplies and keep communication lines open.",
        ],
        createdAt: pubDate ? new Date(pubDate) : new Date(),
      });
    } catch (e) {
      // Ignore individual parse error
    }
  }

  return alerts;
};

/**
 * 1. Fetch GDACS 24h RSS Feed (Fast, ~50KB)
 */
const fetchGdacsAlerts = async () => {
  try {
    const response = await axios.get("https://www.gdacs.org/xml/rss_24h.xml", {
      headers: { "User-Agent": "DisasterManagementPlatform/1.0" },
      timeout: 6000,
    });
    if (response.data) {
      return parseGdacsRss(response.data);
    }
  } catch (error) {
    console.warn("[GovtAlertService] GDACS feed warning:", error.message);
  }
  return [];
};

/**
 * 2. Fetch USGS Real-Time Earthquakes (M 4.5+ or Significant)
 */
const fetchUsgsAlerts = async () => {
  try {
    const response = await axios.get(
      "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_day.geojson",
      {
        headers: { "User-Agent": "DisasterManagementPlatform/1.0" },
        timeout: 10000,
      }
    );

    const features = response.data?.features || [];
    return features.slice(0, 10).map((feature) => {
      const { mag, place, time, url, title } = feature.properties;
      const [lon, lat] = feature.geometry?.coordinates || [0, 0];
      const severity = mag >= 6.5 ? "critical" : mag >= 5.2 ? "high" : "medium";

      return {
        title: `[USGS Seismic] ${title || `M ${mag} Earthquake - ${place}`}`,
        message: `A magnitude ${mag} earthquake occurred at ${place}. Monitored by USGS Earthquake Hazards Program.`,
        type: "earthquake",
        severity,
        location: {
          type: "Point",
          coordinates: [lon, lat],
        },
        radiusKm: mag >= 6 ? 60 : 30,
        isGovtOfficial: true,
        sourceAgency: "USGS Earthquake Hazards Program",
        sourceUrl: url || "https://earthquake.usgs.gov/earthquakes/map/",
        externalId: `usgs_${feature.id}`,
        country: place.split(",").pop()?.trim() || "Global",
        affectedAreas: [place],
        instructions: [
          "Drop, Cover, and Hold On during aftershocks.",
          "Check for gas leaks and structural damage before re-entering buildings.",
          "Monitor official seismic bulletins and local emergency advisories.",
        ],
        createdAt: time ? new Date(time) : new Date(),
      };
    });
  } catch (error) {
    console.warn("[GovtAlertService] USGS feed warning:", error.message);
    return [];
  }
};

/**
 * 3. Fetch Severe Weather Alerts via Open-Meteo for Monitored Regions (mapped to IMD / NDMA guidelines)
 */
const MONITORED_REGIONS = [
  { name: "Odisha Coastal Belt", lat: 20.2961, lon: 85.8245, state: "Odisha" },
  { name: "Bay of Bengal Marine Zone", lat: 19.8135, lon: 86.8315, state: "East Coast" },
  { name: "West Bengal / Sundarbans", lat: 22.5726, lon: 88.3639, state: "West Bengal" },
  { name: "Western Coast / Mumbai", lat: 18.9220, lon: 72.8347, state: "Maharashtra" },
  { name: "Northern Plains / Delhi NCR", lat: 28.6139, lon: 77.2090, state: "Delhi" },
];

const fetchSevereWeatherAlerts = async () => {
  const weatherAlerts = [];
  const todayHour = new Date().toISOString().slice(0, 13); // e.g. "2026-09-03T11"

  const regionPromises = MONITORED_REGIONS.map(async (region) => {
    try {
      const res = await axios.get("https://api.open-meteo.com/v1/forecast", {
        params: {
          latitude: region.lat,
          longitude: region.lon,
          current: "temperature_2m,precipitation,rain,weather_code,wind_speed_10m,wind_gusts_10m",
          timezone: "auto",
        },
        timeout: 3500,
      });

      const current = res.data?.current;
      if (!current) return null;

      const { temperature_2m, precipitation, wind_gusts_10m, weather_code } = current;

      let severity = null;
      let disasterType = "storm";
      let summary = "";
      const instructions = [];

      // Heavy rainfall / flood risk
      if (precipitation >= 30) {
        severity = precipitation >= 60 ? "critical" : "high";
        disasterType = "flood";
        summary = `Extremely heavy rainfall (${precipitation} mm/h) detected in ${region.name}. High flash flood risk.`;
        instructions.push("Move to elevated ground and avoid waterlogged roads or bridges.");
        instructions.push("Check IMD & NDMA SACHET flood warning alerts.");
      }
      // High wind / cyclonic squalls
      else if (wind_gusts_10m >= 55) {
        severity = wind_gusts_10m >= 80 ? "critical" : "high";
        disasterType = "cyclone";
        summary = `High wind gusts (${wind_gusts_10m} km/h) recorded in ${region.name}. Cyclone / squall advisory active.`;
        instructions.push("Secure loose outdoor objects and stay clear of power lines and trees.");
        instructions.push("Consult IMD Cyclone Warning Centre updates.");
      }
      // Severe heatwave
      else if (temperature_2m >= 42) {
        severity = temperature_2m >= 45 ? "critical" : "high";
        disasterType = "heatwave";
        summary = `Severe heatwave warning: temperature reached ${temperature_2m}°C in ${region.name}.`;
        instructions.push("Avoid direct sun exposure between 11 AM - 4 PM and stay hydrated.");
      }
      // Severe thunderstorm codes (95, 96, 99)
      else if ([95, 96, 99].includes(weather_code)) {
        severity = "high";
        disasterType = "storm";
        summary = `Severe thunderstorm with lightning & hail detected in ${region.name}.`;
        instructions.push("Seek immediate shelter indoors; avoid open fields and water bodies.");
      }

      if (severity) {
        const externalId = `imd_meteo_${region.state.toLowerCase()}_${todayHour}`;
        return {
          title: `[IMD / NDMA SACHET] ${summary.split(".")[0]}`,
          message: `${summary} Follow safety advisories issued by India Meteorological Department (IMD) & NDMA SACHET portal.`,
          type: disasterType,
          severity,
          location: {
            type: "Point",
            coordinates: [region.lon, region.lat],
          },
          radiusKm: 35,
          isGovtOfficial: true,
          sourceAgency: "IMD Govt of India / NDMA SACHET",
          sourceUrl: "https://sachet.ndma.gov.in/",
          externalId,
          country: "India",
          affectedAreas: [region.name, region.state],
          instructions: instructions.length
            ? instructions
            : ["Follow official instructions from local emergency administration."],
          createdAt: new Date(),
        };
      }
    } catch (e) {
      // Ignore region timeout
    }
    return null;
  });

  const results = await Promise.allSettled(regionPromises);
  for (const r of results) {
    if (r.status === "fulfilled" && r.value) {
      weatherAlerts.push(r.value);
    }
  }

  return weatherAlerts;
};

/**
 * Fetch and synchronize live government disaster and weather alerts into the database
 * and broadcast them in real time to all website users!
 */
const fetchAndSyncGovtAlerts = async () => {
  try {
    console.log("[GovtAlertService] Polling official government disaster & weather feeds...");

    // Fetch in parallel
    const [gdacsAlerts, usgsAlerts, weatherAlerts] = await Promise.all([
      fetchGdacsAlerts(),
      fetchUsgsAlerts(),
      fetchSevereWeatherAlerts(),
    ]);

    const combinedAlerts = [...weatherAlerts, ...gdacsAlerts, ...usgsAlerts];
    const newlyCreatedAlerts = [];

    for (const alertData of combinedAlerts) {
      if (!alertData.externalId) continue;

      // In-memory check first
      if (processedAlertIds.has(alertData.externalId)) continue;

      // Database check
      const existingAlert = await Alert.findOne({ externalId: alertData.externalId });
      if (existingAlert) {
        processedAlertIds.add(alertData.externalId);
        continue;
      }

      // Create new Alert document
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
          sourceUrl: newAlert.sourceUrl,
          severity: newAlert.severity,
          location: newAlert.affectedAreas?.[0] || "Regional",
        },
      });

      // Directly notify all users of our website in real time via Socket.IO!
      try {
        const io = getIO();
        io.to("alerts").emit("newAlert", newAlert);
        io.emit("govtDisasterAlert", {
          alert: newAlert,
          notification: newNotification,
        });
        console.log(`[GovtAlertService] 🚨 Dispatched Live Govt Alert to all users: ${newAlert.title}`);
      } catch (socketError) {
        // Socket may not be initialized yet in test mode
      }
    }

    console.log(
      `[GovtAlertService] Sync completed. Total official alerts checked: ${combinedAlerts.length}, New alerts broadcast: ${newlyCreatedAlerts.length}`
    );

    return {
      success: true,
      syncedCount: combinedAlerts.length,
      newAlertsCount: newlyCreatedAlerts.length,
      newAlerts: newlyCreatedAlerts,
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
 * Get all active official government disaster alerts
 */
const getLiveGovtAlerts = async () => {
  // Query existing official alerts from DB
  let alerts = await Alert.find({ isGovtOfficial: true, status: "active" })
    .sort({ createdAt: -1 })
    .limit(30);

  // If DB has fewer than 2 official alerts, perform an on-demand sync
  if (alerts.length < 2) {
    await fetchAndSyncGovtAlerts();
    alerts = await Alert.find({ isGovtOfficial: true, status: "active" })
      .sort({ createdAt: -1 })
      .limit(30);
  }

  return alerts;
};

module.exports = {
  fetchAndSyncGovtAlerts,
  getLiveGovtAlerts,
  getOfficialGovtPortals: () => OFFICIAL_GOVT_PORTALS,
  OFFICIAL_GOVT_PORTALS,
};
