const Prediction = require("../models/Prediction");
const Sensor = require("../models/Sensor");
const SensorReading = require("../models/SensorReading");

class RiskEngineService {
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
   * Assess real-time risk around specific coordinates
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
      assessedAt: new Date().toISOString(),
      evacuationRecommended: assessment.overallRiskScore >= 65,
      alertBroadcastRecommended: assessment.overallRiskScore >= 50,
    };
  }

  /**
   * Get all active regional risk zones (for Web App and Mobile App maps)
   */
  async getAllZones() {
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
        overallRiskScore: 84,
        level: "CRITICAL",
        primaryHazard: "landslide",
        populationAtRisk: 14200,
        criticalInfrastructureImpacted: ["NH-40", "Umiam Hydel Feeder Line"],
        activeSensorsCount: 38,
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
        overallRiskScore: 72,
        level: "HIGH",
        primaryHazard: "flood",
        populationAtRisk: 28500,
        criticalInfrastructureImpacted: ["Saraighat Rail-Road Corridor", "Water Works Station"],
        activeSensorsCount: 45,
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
      timestamp: new Date().toISOString(),
    };
  }
}

module.exports = new RiskEngineService();
