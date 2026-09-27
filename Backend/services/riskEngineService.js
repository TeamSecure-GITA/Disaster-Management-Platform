const Prediction = require("../models/Prediction");
const Sensor = require("../models/Sensor");
const SensorReading = require("../models/SensorReading");
const RainfallRecord = require("../models/RainfallRecord");

class RiskEngineService {
  constructor() {
    this.rainfallCache = new Map();
  }

  /**
   * Feed continuous rainfall time-series telemetry from weatherService
   * @param {Array<Object>} records - Ingested rainfall station telemetry
   */
  feedRainfallTelemetry(records = []) {
    if (!Array.isArray(records)) return;
    for (const record of records) {
      if (record && record.stationId) {
        this.rainfallCache.set(record.stationId, record);
      }
    }
  }

  /**
   * Find closest rainfall telemetry record to specific coordinates
   */
  async findClosestRainfallRecord(latitude, longitude) {
    const lat = Number(latitude);
    const lon = Number(longitude);

    // 1. Try geospatial query if DB is connected
    const mongoose = require("mongoose");
    if (mongoose.connection.readyState === 1) {
      try {
        const dbRecord = await RainfallRecord.findOne({
          location: {
            $near: {
              $geometry: { type: "Point", coordinates: [lon, lat] },
              $maxDistance: 150000, // 150 km max distance in mountainous NER
            },
          },
        })
          .sort({ timestamp: -1 })
          .lean();

        if (dbRecord) return dbRecord;
      } catch (err) {
        // Fallback to cache
      }
    }

    // 2. Query in-memory rainfall cache with Euclidean distance
    let closest = null;
    let minDistance = Infinity;

    for (const record of this.rainfallCache.values()) {
      const coords = record.location?.coordinates;
      if (coords && coords.length >= 2) {
        const dLon = coords[0] - lon;
        const dLat = coords[1] - lat;
        const dist = Math.sqrt(dLon * dLon + dLat * dLat);
        if (dist < minDistance) {
          minDistance = dist;
          closest = record;
        }
      }
    }

    return closest;
  }

  /**
   * Calculate compound risk score based on UN-ISDR formulation:
   * Risk = Hazard Intensity x Exposure x Vulnerability
   */
  calculateCompoundRisk({
    hazardIntensity = 0.5,
    forecastTrend = 1.0,
    anomalyFactor = 1.0,
    exposureFactor = 0.6,
    vulnerabilityFactor = 0.5,
  }) {
    // Amplified hazard intensity incorporating forecast and anomalies
    const amplifiedHazard = Math.min(
      1.0,
      hazardIntensity * forecastTrend * anomalyFactor
    );

    // Compound score scaled 0 - 100
    const rawScore = amplifiedHazard * exposureFactor * vulnerabilityFactor * 100 * 3.33;
    const overallRiskScore = Math.round(Math.min(100, Math.max(5, rawScore)));

    let level = "LOW";
    if (overallRiskScore >= 75) level = "CRITICAL";
    else if (overallRiskScore >= 55) level = "HIGH";
    else if (overallRiskScore >= 35) level = "MODERATE";

    return {
      overallRiskScore,
      level,
      components: {
        hazardScore: Math.round(amplifiedHazard * 100),
        exposureScore: Math.round(exposureFactor * 100),
        vulnerabilityScore: Math.round(vulnerabilityFactor * 100),
        anomalyFactor: Number(anomalyFactor.toFixed(2)),
      },
    };
  }

  /**
   * Assess real-time risk around specific coordinates,
   * dynamically factoring in continuous gridded/station rainfall time-series
   */
  async assessRisk({ latitude, longitude, radiusKm = 25, hazardType = "all" }) {
    const lat = Number(latitude) || 25.57;
    const lon = Number(longitude) || 91.88;

    // 1. Query nearest hazard predictions
    let hazardIntensity = 0.45;
    let primaryHazard = hazardType !== "all" ? hazardType : "flood";

    const mongoose = require("mongoose");
    if (mongoose.connection.readyState === 1) {
      try {
        const recentPredictions = await Prediction.find({
          status: { $in: ["active", "predicted"] },
        })
          .sort({ probability: -1, createdAt: -1 })
          .limit(3)
          .lean();

        if (recentPredictions.length > 0) {
          hazardIntensity = recentPredictions[0].probability || 0.65;
          primaryHazard = recentPredictions[0].disasterType || primaryHazard;
        }
      } catch {
        hazardIntensity = 0.65;
      }
    } else {
      hazardIntensity = 0.65;
    }

    // 2. Query sensor readings for anomaly and forecast factors
    let anomalyFactor = 1.05;
    let forecastTrend = 1.1;

    if (mongoose.connection.readyState === 1) {
      try {
        const recentSensors = await SensorReading.find()
          .sort({ createdAt: -1 })
          .limit(5)
          .lean();

        if (recentSensors.length > 0) {
          const hasWarning = recentSensors.some(
            (s) => s.status === "warning" || s.status === "danger"
          );
          if (hasWarning) {
            anomalyFactor = 1.25;
            forecastTrend = 1.2;
          }
        }
      } catch {
        // Fallback
      }
    }

    // 3. Dynamic Rainfall Time-Series Integration
    const rainfallRecord = await this.findClosestRainfallRecord(lat, lon);
    let rainfallMetrics = null;

    if (rainfallRecord) {
      const rolling = rainfallRecord.rolling || {};
      const forecast = rainfallRecord.forecast || {};
      const rain1h = rolling.rain1h || 0;
      const rain24h = rolling.rain24h || 0;
      const rain72h = rolling.rain72h || 0;
      const next24h = forecast.rainNext24h || 0;

      // Amplify hazard intensity based on IMD 24h Rainfall Intensity standards
      if (rain24h >= 204.5) {
        // Extremely Heavy Rain
        hazardIntensity = Math.min(1.0, hazardIntensity + 0.35);
      } else if (rain24h >= 115.6) {
        // Very Heavy Rain
        hazardIntensity = Math.min(1.0, hazardIntensity + 0.25);
      } else if (rain24h >= 64.5) {
        // Heavy Rain
        hazardIntensity = Math.min(1.0, hazardIntensity + 0.15);
      }

      // Saturated soil geotechnical trigger (Antecedent 72h accumulation)
      if (rain72h >= 180) {
        anomalyFactor = Math.max(anomalyFactor, 1.4);
      } else if (rain72h >= 120) {
        anomalyFactor = Math.max(anomalyFactor, 1.25);
      }

      // Flash cloudburst trigger (1-hour rate)
      if (rain1h >= 25) {
        anomalyFactor = Math.max(anomalyFactor, 1.35);
        if (primaryHazard === "all" || !primaryHazard) primaryHazard = "flood";
      }

      // Forecasted storm surge
      if (next24h >= 50) {
        forecastTrend = Math.max(forecastTrend, 1.3);
      }

      rainfallMetrics = {
        stationId: rainfallRecord.stationId,
        stationName: rainfallRecord.stationName,
        source: rainfallRecord.source,
        rain1h,
        rain3h: rolling.rain3h || 0,
        rain24h,
        rain72h,
        forecastNext24h: next24h,
        imdIntensityCategory: rainfallRecord.imdIntensityCategory || "Moderate Rain",
        landslideTriggerRisk: rainfallRecord.riskIndicators?.landslideTriggerRisk || "LOW",
        flashFloodTriggerRisk: rainfallRecord.riskIndicators?.flashFloodTriggerRisk || "LOW",
        saturationTriggerBreached: rainfallRecord.riskIndicators?.saturationTriggerBreached || false,
      };
    }

    const assessment = this.calculateCompoundRisk({
      hazardIntensity,
      forecastTrend,
      anomalyFactor,
      exposureFactor: 0.72,
      vulnerabilityFactor: 0.65,
    });

    return {
      targetLocation: { latitude: lat, longitude: lon, radiusKm },
      primaryHazard,
      ...assessment,
      rainfallMetrics,
      assessedAt: new Date().toISOString(),
      evacuationRecommended: assessment.overallRiskScore >= 65,
      alertBroadcastRecommended: assessment.overallRiskScore >= 50,
    };
  }

  /**
   * Get all active regional risk zones (for Web App and Mobile App maps)
   */
  async getAllZones() {
    // Dynamic enrichment with latest ingested rainfall
    const meghalayaRain = Array.from(this.rainfallCache.values()).find(
      (r) => r.state === "Meghalaya"
    );
    const assamRain = Array.from(this.rainfallCache.values()).find(
      (r) => r.state === "Assam"
    );

    return [
      {
        id: "zone-meghalaya-1",
        name: "East Khasi Hills Escarpment",
        state: "Meghalaya",
        boundaryCoordinates: [
          { lat: 25.56, lng: 91.88 },
          { lat: 25.62, lng: 91.95 },
          { lat: 25.54, lng: 91.98 },
        ],
        overallRiskScore: meghalayaRain && meghalayaRain.rolling?.rain24h > 150 ? 92 : 84,
        level: "CRITICAL",
        primaryHazard: "landslide",
        populationAtRisk: 14200,
        criticalInfrastructureImpacted: ["NH-40", "Umiam Hydel Feeder Line", "Sonapur Tunnel"],
        activeSensorsCount: 38,
        rainfall: {
          rain24h: meghalayaRain?.rolling?.rain24h || 212.8,
          rain72h: meghalayaRain?.rolling?.rain72h || 420.0,
          imdCategory: meghalayaRain?.imdIntensityCategory || "Extremely Heavy Rain",
        },
        lastUpdated: new Date().toISOString(),
      },
      {
        id: "zone-assam-2",
        name: "Lower Brahmaputra Floodplain",
        state: "Assam",
        boundaryCoordinates: [
          { lat: 26.15, lng: 91.75 },
          { lat: 26.25, lng: 91.85 },
          { lat: 26.12, lng: 91.90 },
        ],
        overallRiskScore: assamRain && assamRain.rolling?.rain24h > 100 ? 79 : 72,
        level: "HIGH",
        primaryHazard: "flood",
        populationAtRisk: 28500,
        criticalInfrastructureImpacted: ["Saraighat Rail-Road Corridor", "Water Works Station"],
        activeSensorsCount: 45,
        rainfall: {
          rain24h: assamRain?.rolling?.rain24h || 128.0,
          rain72h: assamRain?.rolling?.rain72h || 235.0,
          imdCategory: assamRain?.imdIntensityCategory || "Very Heavy Rain",
        },
        lastUpdated: new Date().toISOString(),
      },
      {
        id: "zone-odisha-3",
        name: "Puri-Paradip Coastal Belt",
        state: "Odisha",
        boundaryCoordinates: [
          { lat: 19.8, lng: 85.8 },
          { lat: 20.3, lng: 86.6 },
          { lat: 19.9, lng: 86.2 },
        ],
        overallRiskScore: 48,
        level: "MODERATE",
        primaryHazard: "cyclone",
        populationAtRisk: 19000,
        criticalInfrastructureImpacted: ["Coastal Highway", "Fisheries Jetty"],
        activeSensorsCount: 22,
        rainfall: {
          rain24h: 32.5,
          rain72h: 58.0,
          imdCategory: "Moderate Rain",
        },
        lastUpdated: new Date().toISOString(),
      },
    ];
  }

  /**
   * Get platform-wide risk summary
   */
  async getSummary() {
    const zones = await this.getAllZones();
    const criticalZones = zones.filter((z) => z.level === "CRITICAL").length;
    const highZones = zones.filter((z) => z.level === "HIGH").length;
    const totalPopulation = zones.reduce((acc, z) => acc + (z.populationAtRisk || 0), 0);

    return {
      totalZonesMonitored: zones.length,
      criticalZonesCount: criticalZones,
      highRiskZonesCount: highZones,
      totalPopulationAtRisk: totalPopulation,
      highestRiskLevel: criticalZones > 0 ? "CRITICAL" : highZones > 0 ? "HIGH" : "MODERATE",
      rainfallTelemetryLinked: this.rainfallCache.size > 0,
      cachedStationsCount: this.rainfallCache.size,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get single zone risk assessment by ID
   */
  async getZoneAssessment(zoneId) {
    const zones = await this.getAllZones();
    const zone = zones.find((z) => z.id === zoneId) || zones[0];
    const risk = this.calculateCompoundRisk({
      hazardIntensity: (zone.overallRiskScore || 50) / 100,
      forecastTrend: 1.15,
      anomalyFactor: 1.08,
      exposureFactor: 0.75,
      vulnerabilityFactor: 0.70,
    });

    return {
      zoneId: zone.id,
      zoneName: zone.name,
      level: risk.level,
      overallRiskScore: risk.overallRiskScore,
      components: risk.components,
      primaryHazard: zone.primaryHazard,
      populationAtRisk: zone.populationAtRisk,
      rainfall: zone.rainfall,
      assessedAt: new Date().toISOString(),
      evacuationRecommended: risk.overallRiskScore >= 75,
    };
  }
}

module.exports = new RiskEngineService();
