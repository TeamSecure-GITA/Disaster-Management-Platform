import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Header } from '../../components/navigation/Header';
import { SOSButton } from '../../components/emergency/SOSButton';
import { AlertCard } from '../../components/emergency/AlertCard';
import { RiskCard } from '../../components/risk/RiskCard';
import { useAlerts } from '../../hooks/useAlerts';
import { useRisk } from '../../hooks/useRisk';
import { useEmergencyStore } from '../../stores/emergency.store';
import { COLORS } from '../../constants/colors';
import { ROUTES } from '../../constants/routes';
import { openWebFeature } from '../../utils/webPortal';

export default function HomeScreen() {
  const router = useRouter();
  const { alerts, fetchAlerts } = useAlerts();
  const { predictions, fetchPredictions } = useRisk();
  const startCountdown = useEmergencyStore((s) => s.startCountdown);

  useEffect(() => {
    fetchAlerts();
    fetchPredictions();
  }, []);

  const handleSosPress = () => {
    startCountdown();
    router.push(ROUTES.MAIN.EMERGENCY.SOS as any);
  };

  return (
    <View style={styles.container}>
      <Header title="Disaster Sentinel Command" />
      <ScrollView contentContainerStyle={styles.content}>
        {/* ── 1. Central SOS Beacon Section ── */}
        <View style={styles.sosSection}>
          <SOSButton onPress={handleSosPress} size={140} />
          <Text style={styles.sosCaption}>PRESS TO BROADCAST URGENT GPS BEACON</Text>
        </View>

        {/* ── 2. All Features Hub Banner ── */}
        <TouchableOpacity
          style={styles.hubBanner}
          onPress={() => router.push(ROUTES.MAIN.FEATURES.INDEX as any)}
          activeOpacity={0.8}
        >
          <View style={styles.hubBannerLeft}>
            <Text style={styles.hubBannerIcon}>⚡</Text>
            <View>
              <Text style={styles.hubBannerTitle}>All Platform Features (40+ Modules)</Text>
              <Text style={styles.hubBannerSubtitle}>
                Complete tactical toolchain matching full web platform
              </Text>
            </View>
          </View>
          <Text style={styles.hubBannerArrow}>EXPLORE ›</Text>
        </TouchableOpacity>

        {/* ── 3. Immediate Crisis Response Grid ── */}
        <Text style={styles.sectionTitle}>🚨 IMMEDIATE CRISIS RESPONSE</Text>
        <View style={styles.gridRow}>
          <TouchableOpacity
            style={styles.gridCard}
            onPress={() => router.push(ROUTES.MAIN.MAPS.LIVE as any)}
          >
            <Text style={styles.cardIcon}>🗺️</Text>
            <Text style={styles.cardLabel}>Live Situation Map</Text>
            <Text style={styles.cardSub}>Tactical GIS</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.gridCard}
            onPress={() => router.push(ROUTES.MAIN.RISK.EVACUATION as any)}
          >
            <Text style={styles.cardIcon}>🧭</Text>
            <Text style={styles.cardLabel}>Evacuation Routes</Text>
            <Text style={styles.cardSub}>Safe paths</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.gridCard}
            onPress={() => router.push(ROUTES.MAIN.SAFETY.SHELTERS as any)}
          >
            <Text style={styles.cardIcon}>🏕️</Text>
            <Text style={styles.cardLabel}>Safe Shelters</Text>
            <Text style={styles.cardSub}>Relief camps</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.gridRow}>
          <TouchableOpacity
            style={styles.gridCard}
            onPress={() => router.push(ROUTES.MAIN.FEATURES.DAMAGE_ASSESSMENT as any)}
          >
            <Text style={styles.cardIcon}>🏚️</Text>
            <Text style={styles.cardLabel}>Damage Triage</Text>
            <Text style={styles.cardSub}>Rapid survey</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.gridCard}
            onPress={() => router.push(ROUTES.MAIN.FEATURES.RELIEF_TRACKER as any)}
          >
            <Text style={styles.cardIcon}>🚚</Text>
            <Text style={styles.cardLabel}>Relief Fleet</Text>
            <Text style={styles.cardSub}>GPS Convoys</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.gridCard}
            onPress={() => router.push(ROUTES.MAIN.FEATURES.DYNAMIC_EVACUATION as any)}
          >
            <Text style={styles.cardIcon}>🏃</Text>
            <Text style={styles.cardLabel}>Anti-Herd Evac</Text>
            <Text style={styles.cardSub}>Flow balance</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.gridRow}>
          <TouchableOpacity
            style={styles.gridCard}
            onPress={() => router.push(ROUTES.MAIN.FEATURES.RESCUE_CENTERS as any)}
          >
            <Text style={styles.cardIcon}>🏥</Text>
            <Text style={styles.cardLabel}>Rescue Centers</Text>
            <Text style={styles.cardSub}>NDRF Base Camps</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.gridCard}
            onPress={() => router.push(ROUTES.MAIN.RISK.SAFE_ZONES as any)}
          >
            <Text style={styles.cardIcon}>🛡️</Text>
            <Text style={styles.cardLabel}>Safe Zones</Text>
            <Text style={styles.cardSub}>Geotech green</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.gridCard}
            onPress={() => router.push(ROUTES.MAIN.EMERGENCY.CONTACTS as any)}
          >
            <Text style={styles.cardIcon}>📞</Text>
            <Text style={styles.cardLabel}>Helplines</Text>
            <Text style={styles.cardSub}>1078, 112, 108</Text>
          </TouchableOpacity>
        </View>

        {/* ── 4. Tactical Intelligence & AI ── */}
        <Text style={styles.sectionTitle}>🛰️ TACTICAL INTELLIGENCE & TELEMETRY</Text>
        <View style={styles.gridRow}>
          <TouchableOpacity
            style={styles.gridCard}
            onPress={() => router.push(ROUTES.MAIN.AI.CHAT as any)}
          >
            <Text style={styles.cardIcon}>🤖</Text>
            <Text style={styles.cardLabel}>AI Copilot</Text>
            <Text style={styles.cardSub}>Disaster advisor</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.gridCard}
            onPress={() => router.push(ROUTES.MAIN.AI.VOICE as any)}
          >
            <Text style={styles.cardIcon}>🎙️</Text>
            <Text style={styles.cardLabel}>Voice Assistant</Text>
            <Text style={styles.cardSub}>Hands-free</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.gridCard}
            onPress={() => router.push(ROUTES.MAIN.FEATURES.NER_LANDSLIDE as any)}
          >
            <Text style={styles.cardIcon}>⛰️</Text>
            <Text style={styles.cardLabel}>NER Landslide</Text>
            <Text style={styles.cardSub}>Slope sensors</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.gridRow}>
          <TouchableOpacity
            style={styles.gridCard}
            onPress={() => router.push(ROUTES.MAIN.FEATURES.STATISTICS as any)}
          >
            <Text style={styles.cardIcon}>📊</Text>
            <Text style={styles.cardLabel}>Statistics</Text>
            <Text style={styles.cardSub}>Impact KPIs</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.gridCard}
            onPress={() => router.push(ROUTES.MAIN.FEATURES.CLIMATE_CHRONICLE as any)}
          >
            <Text style={styles.cardIcon}>🌍</Text>
            <Text style={styles.cardLabel}>Climate Intel</Text>
            <Text style={styles.cardSub}>Decadal trends</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.gridCard}
            onPress={() => router.push(ROUTES.MAIN.RISK.SAFE_ZONES as any)}
          >
            <Text style={styles.cardIcon}>🛡️</Text>
            <Text style={styles.cardLabel}>Safe Zones</Text>
            <Text style={styles.cardSub}>Geotech green</Text>
          </TouchableOpacity>
        </View>

        {/* ── 5. Connectivity & Off-Grid Mesh ── */}
        <Text style={styles.sectionTitle}>📡 CONNECTIVITY & OFF-GRID MESH</Text>
        <View style={styles.gridRow}>
          <TouchableOpacity
            style={styles.gridCard}
            onPress={() => router.push(ROUTES.MAIN.FEATURES.SMART_ALERTS as any)}
          >
            <Text style={styles.cardIcon}>📡</Text>
            <Text style={styles.cardLabel}>IoT Sensor Grid</Text>
            <Text style={styles.cardSub}>Hydrology/seismic</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.gridCard}
            onPress={() => router.push(ROUTES.MAIN.FEATURES.MESH_CONSOLE as any)}
          >
            <Text style={styles.cardIcon}>📻</Text>
            <Text style={styles.cardLabel}>LoRa Console</Text>
            <Text style={styles.cardSub}>Packet monitor</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.gridCard}
            onPress={() => router.push(ROUTES.MAIN.FEATURES.ZERO_INTERNET as any)}
          >
            <Text style={styles.cardIcon}>📴</Text>
            <Text style={styles.cardLabel}>Zero-Internet</Text>
            <Text style={styles.cardSub}>Peer-to-peer</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.gridRow}>
          <TouchableOpacity
            style={styles.gridCard}
            onPress={() => router.push(ROUTES.MAIN.FEATURES.LOW_BANDWIDTH as any)}
          >
            <Text style={styles.cardIcon}>⚡</Text>
            <Text style={styles.cardLabel}>Ultra-Low 2G</Text>
            <Text style={styles.cardSub}>Text portal</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.gridCard}
            onPress={() => router.push(ROUTES.MAIN.OFFLINE.STATUS as any)}
          >
            <Text style={styles.cardIcon}>💾</Text>
            <Text style={styles.cardLabel}>Offline Storage</Text>
            <Text style={styles.cardSub}>SQLite sync</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.gridCard}
            onPress={() => router.push(ROUTES.MAIN.FEATURES.DRONE_ANALYTICS as any)}
          >
            <Text style={styles.cardIcon}>🚁</Text>
            <Text style={styles.cardLabel}>Drone Recon</Text>
            <Text style={styles.cardSub}>UAV thermal</Text>
          </TouchableOpacity>
        </View>

        {/* ── 6. Citizen & Community Safety ── */}
        <Text style={styles.sectionTitle}>👨‍👩‍👧 CITIZEN & COMMUNITY SAFETY</Text>
        <View style={styles.gridRow}>
          <TouchableOpacity
            style={styles.gridCard}
            onPress={() => router.push(ROUTES.MAIN.SAFETY.FAMILY as any)}
          >
            <Text style={styles.cardIcon}>👨‍👩‍👧</Text>
            <Text style={styles.cardLabel}>Family Safety</Text>
            <Text style={styles.cardSub}>Circle radar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.gridCard}
            onPress={() => router.push(ROUTES.MAIN.INCIDENTS.REPORT as any)}
          >
            <Text style={styles.cardIcon}>📸</Text>
            <Text style={styles.cardLabel}>Report Incident</Text>
            <Text style={styles.cardSub}>Field capture</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.gridCard}
            onPress={() => router.push(ROUTES.MAIN.SAFETY.GUIDE as any)}
          >
            <Text style={styles.cardIcon}>📖</Text>
            <Text style={styles.cardLabel}>Safety Guides</Text>
            <Text style={styles.cardSub}>SOP manuals</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.gridRow}>
          <TouchableOpacity
            style={styles.gridCard}
            onPress={() => router.push(ROUTES.MAIN.SAFETY.FIRST_AID as any)}
          >
            <Text style={styles.cardIcon}>🩺</Text>
            <Text style={styles.cardLabel}>First Aid Manual</Text>
            <Text style={styles.cardSub}>Emergency steps</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.gridCard}
            onPress={() => router.push(ROUTES.MAIN.EMERGENCY.CONTACTS as any)}
          >
            <Text style={styles.cardIcon}>📞</Text>
            <Text style={styles.cardLabel}>Helplines</Text>
            <Text style={styles.cardSub}>1078, 112, 108</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.gridCard}
            onPress={() => router.push(ROUTES.MAIN.FEATURES.VOLUNTEER_TASKS as any)}
          >
            <Text style={styles.cardIcon}>🤝</Text>
            <Text style={styles.cardLabel}>Volunteer Tasks</Text>
            <Text style={styles.cardSub}>Micro-missions</Text>
          </TouchableOpacity>
        </View>

        {/* ── 7. Innovation Lab & Simulations ── */}
        <Text style={styles.sectionTitle}>🔬 INNOVATION LAB & SIMULATIONS</Text>
        <View style={styles.gridRow}>
          <TouchableOpacity
            style={styles.gridCard}
            onPress={() => router.push(ROUTES.MAIN.FEATURES.DIGITAL_TWIN as any)}
          >
            <Text style={styles.cardIcon}>🏙️</Text>
            <Text style={styles.cardLabel}>Digital Twin 3D</Text>
            <Text style={styles.cardSub}>Physics simulator</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.gridCard}
            onPress={() => router.push(ROUTES.MAIN.FEATURES.NER_TOPOGRAPHY as any)}
          >
            <Text style={styles.cardIcon}>🏔️</Text>
            <Text style={styles.cardLabel}>NER Topography</Text>
            <Text style={styles.cardSub}>Multi-hazard suite</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.gridCard}
            onPress={() => router.push(ROUTES.MAIN.FEATURES.WORLD_FIRST as any)}
          >
            <Text style={styles.cardIcon}>🔬</Text>
            <Text style={styles.cardLabel}>World-First Tech</Text>
            <Text style={styles.cardSub}>Deep sensor lab</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.gridRow}>
          <TouchableOpacity
            style={styles.gridCard}
            onPress={() => router.push(ROUTES.MAIN.FEATURES.DECENTRALIZED_RESILIENCE as any)}
          >
            <Text style={styles.cardIcon}>📡</Text>
            <Text style={styles.cardLabel}>SAR Radar</Text>
            <Text style={styles.cardSub}>Decentralized</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.gridCard}
            onPress={() => router.push(ROUTES.MAIN.FEATURES.EXTREME_RESILIENCE as any)}
          >
            <Text style={styles.cardIcon}>🧪</Text>
            <Text style={styles.cardLabel}>Extreme Grid</Text>
            <Text style={styles.cardSub}>WASM & LiFi</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.gridCard}
            onPress={() => router.push(ROUTES.MAIN.FEATURES.AR_RISK as any)}
          >
            <Text style={styles.cardIcon}>👓</Text>
            <Text style={styles.cardLabel}>AR Risk Scan</Text>
            <Text style={styles.cardSub}>Camera elevation</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.gridRow}>
          <TouchableOpacity
            style={styles.gridCard}
            onPress={() => router.push(ROUTES.MAIN.FEATURES.HYPER_SPEED_RESCUE as any)}
          >
            <Text style={styles.cardIcon}>⚡</Text>
            <Text style={styles.cardLabel}>Hyper Rescue</Text>
            <Text style={styles.cardSub}>Sub-3m swarm</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.gridCard}
            onPress={() => router.push(ROUTES.MAIN.FEATURES.VULNERABILITY_MAP as any)}
          >
            <Text style={styles.cardIcon}>🌉</Text>
            <Text style={styles.cardLabel}>Infra Vulnerability</Text>
            <Text style={styles.cardSub}>GIS Heatmap</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.gridCard}
            onPress={() => router.push(ROUTES.MAIN.FEATURES.AID_LEDGER as any)}
          >
            <Text style={styles.cardIcon}>📦</Text>
            <Text style={styles.cardLabel}>Aid Ledger</Text>
            <Text style={styles.cardSub}>Crypto supply</Text>
          </TouchableOpacity>
        </View>

        {/* ── 8. System, Protocols & Support ── */}
        <Text style={styles.sectionTitle}>⚙️ PROTOCOLS & PLATFORM SUPPORT</Text>
        <View style={styles.gridRow}>
          <TouchableOpacity
            style={styles.gridCard}
            onPress={() => router.push(ROUTES.MAIN.FEATURES.ADMINISTRATOR_HUB as any)}
          >
            <Text style={styles.cardIcon}>🛡️</Text>
            <Text style={styles.cardLabel}>Admin Hub</Text>
            <Text style={styles.cardSub}>Threat override</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.gridCard}
            onPress={() => router.push(ROUTES.MAIN.FEATURES.FAQ as any)}
          >
            <Text style={styles.cardIcon}>❓</Text>
            <Text style={styles.cardLabel}>SOP & FAQ</Text>
            <Text style={styles.cardSub}>Disaster guide</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.gridCard}
            onPress={() => router.push(ROUTES.MAIN.FEATURES.REVIEWS as any)}
          >
            <Text style={styles.cardIcon}>⭐</Text>
            <Text style={styles.cardLabel}>Feedback</Text>
            <Text style={styles.cardSub}>Field reviews</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.gridRow}>
          <TouchableOpacity
            style={styles.gridCard}
            onPress={() => router.push(ROUTES.MAIN.FEATURES.RECONSTRUCTION as any)}
          >
            <Text style={styles.cardIcon}>🏗️</Text>
            <Text style={styles.cardLabel}>Rebuild Map</Text>
            <Text style={styles.cardSub}>Recovery status</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.gridCard}
            onPress={() => router.push(ROUTES.MAIN.PROFILE.SETTINGS as any)}
          >
            <Text style={styles.cardIcon}>⚙️</Text>
            <Text style={styles.cardLabel}>Settings</Text>
            <Text style={styles.cardSub}>Preferences</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.gridCard}
            onPress={() => router.push(ROUTES.MAIN.PROFILE.DETAILS as any)}
          >
            <Text style={styles.cardIcon}>👤</Text>
            <Text style={styles.cardLabel}>Profile</Text>
            <Text style={styles.cardSub}>Responder ID</Text>
          </TouchableOpacity>
        </View>

        {/* ── 9. Active Broadcasts Feeds ── */}
        <Text style={styles.sectionTitle}>ACTIVE EARLY WARNINGS</Text>
        {alerts.slice(0, 1).map((a) => (
          <AlertCard key={a.id} alert={a} />
        ))}

        <Text style={styles.sectionTitle}>GEOTECHNICAL HAZARD PROGNOSIS</Text>
        {predictions.slice(0, 1).map((p) => (
          <RiskCard key={p.id} prediction={p} />
        ))}

        {/* ── 10. Web Edition Launcher ── */}
        <TouchableOpacity
          style={styles.webBanner}
          onPress={() => openWebFeature('/')}
          activeOpacity={0.8}
        >
          <Text style={styles.webBannerIcon}>🌐</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.webBannerTitle}>Full Desktop Command Console</Text>
            <Text style={styles.webBannerSub}>
              Access web version for wide-screen monitors and high-resolution 3D GIS
            </Text>
          </View>
          <Text style={styles.webBannerBtn}>LAUNCH ↗</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16, paddingBottom: 40 },
  sosSection: { alignItems: 'center', marginVertical: 14 },
  sosCaption: { color: COLORS.emergency, fontSize: 11, fontWeight: '800', marginTop: 10, letterSpacing: 0.5 },
  hubBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0, 240, 255, 0.12)',
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
  },
  hubBannerLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 10 },
  hubBannerIcon: { fontSize: 24 },
  hubBannerTitle: { color: COLORS.primary, fontSize: 13, fontWeight: '800' },
  hubBannerSubtitle: { color: COLORS.textSecondary, fontSize: 11, marginTop: 2 },
  hubBannerArrow: { color: COLORS.textInverse, backgroundColor: COLORS.primary, fontSize: 10, fontWeight: '800', paddingVertical: 5, paddingHorizontal: 9, borderRadius: 6 },
  sectionTitle: { color: COLORS.textSecondary, fontSize: 11, fontWeight: '800', letterSpacing: 1, marginTop: 16, marginBottom: 8 },
  gridRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  gridCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  cardIcon: { fontSize: 20, marginBottom: 4 },
  cardLabel: { color: COLORS.textPrimary, fontSize: 10, fontWeight: '700', textAlign: 'center' },
  cardSub: { color: COLORS.textMuted, fontSize: 9, textAlign: 'center', marginTop: 2 },
  webBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(2, 132, 199, 0.15)',
    borderWidth: 1,
    borderColor: '#0284c7',
    borderRadius: 12,
    padding: 14,
    marginTop: 20,
    marginBottom: 20,
    gap: 12,
  },
  webBannerIcon: { fontSize: 24 },
  webBannerTitle: { fontSize: 13, fontWeight: '800', color: '#38bdf8' },
  webBannerSub: { fontSize: 11, color: COLORS.textSecondary, marginTop: 2 },
  webBannerBtn: {
    backgroundColor: '#0284c7',
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
});
