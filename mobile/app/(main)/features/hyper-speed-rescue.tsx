import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Header } from '../../../components/navigation/Header';
import { COLORS } from '../../../constants/colors';
import { openWebFeature } from '../../../utils/webPortal';

export default function HyperSpeedRescueScreen() {
  const [activeTab, setActiveTab] = useState<'swarm' | 'ar_hud' | 'acoustic' | 'satellite'>('swarm');
  const [swarmTriggered, setSwarmTriggered] = useState(false);
  const [countdown, setCountdown] = useState(142);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (swarmTriggered && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [swarmTriggered, countdown]);

  const handleLaunchSwarm = () => {
    setSwarmTriggered(true);
    setCountdown(142);
    Alert.alert(
      'Autonomous Drone Swarm Dispatched',
      '3 Heavy-lift UAVs airborne from Forward Depot #2. Estimated rapid insertion: 2 mins 22 secs.'
    );
  };

  return (
    <View style={styles.container}>
      <Header title="Hyper-Speed Rescue Suite" showBack />
      <ScrollView contentContainerStyle={styles.content}>
        {/* Banner */}
        <View style={styles.heroBanner}>
          <Text style={styles.heroTag}>⚡ SUB-3 MINUTE INTERVENTION GRID</Text>
          <Text style={styles.heroTitle}>Autonomous Swarms & Spatial AR HUD</Text>
          <Text style={styles.heroDesc}>
            Eliminates dispatch delay with autonomous UAV escorts, acoustic survivor triangulation, and orbital LEO relays.
          </Text>
        </View>

        {/* Navigation Tabs */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'swarm' && styles.tabBtnActive]}
            onPress={() => setActiveTab('swarm')}
          >
            <Text style={[styles.tabText, activeTab === 'swarm' && styles.tabTextActive]}>🚁 Swarm</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'ar_hud' && styles.tabBtnActive]}
            onPress={() => setActiveTab('ar_hud')}
          >
            <Text style={[styles.tabText, activeTab === 'ar_hud' && styles.tabTextActive]}>🥽 AR HUD</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'acoustic' && styles.tabBtnActive]}
            onPress={() => setActiveTab('acoustic')}
          >
            <Text style={[styles.tabText, activeTab === 'acoustic' && styles.tabTextActive]}>🔊 Acoustic</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'satellite' && styles.tabBtnActive]}
            onPress={() => setActiveTab('satellite')}
          >
            <Text style={[styles.tabText, activeTab === 'satellite' && styles.tabTextActive]}>🛰️ LEO</Text>
          </TouchableOpacity>
        </View>

        {/* Tab 1: Drone Swarm */}
        {activeTab === 'swarm' && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Autonomous Drone Swarm Dispatch</Text>
              <Text style={styles.liveBadge}>DEPOT READY</Text>
            </View>
            <Text style={styles.subText}>
              Autonomous aerial units launch within 15 seconds of distress detection with zero human authorization bottleneck.
            </Text>

            <View style={styles.telemetryBox}>
              <View style={styles.telemetryRow}>
                <Text style={styles.telLabel}>Base Station:</Text>
                <Text style={styles.telValue}>Forward Aerial Depot #2</Text>
              </View>
              <View style={styles.telemetryRow}>
                <Text style={styles.telLabel}>Formation Flight Speed:</Text>
                <Text style={[styles.telValue, { color: COLORS.primary }]}>76 km/h (V-Escort)</Text>
              </View>
              <View style={styles.telemetryRow}>
                <Text style={styles.telLabel}>Target Radius:</Text>
                <Text style={styles.telValue}>4.8 km High-Risk Corridor</Text>
              </View>
              <View style={styles.telemetryRow}>
                <Text style={styles.telLabel}>Active Payload:</Text>
                <Text style={styles.telValue}>FLIR Duo Thermal + Self-Inflate Vests</Text>
              </View>
            </View>

            {swarmTriggered ? (
              <View style={styles.countdownBox}>
                <Text style={styles.countdownTitle}>FORMATION IN FLIGHT</Text>
                <Text style={styles.countdownTime}>
                  ETA: {Math.floor(countdown / 60)}m {countdown % 60}s
                </Text>
                <Text style={styles.countdownSub}>Telemetry streaming over direct encrypted mesh</Text>
              </View>
            ) : (
              <TouchableOpacity style={styles.launchBtn} onPress={handleLaunchSwarm}>
                <Text style={styles.launchBtnText}>🚀 DISPATCH AUTONOMOUS SWARM NOW</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Tab 2: AR Rescue HUD */}
        {activeTab === 'ar_hud' && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Spatial AR Rescue HUD Telemetry</Text>
            <Text style={styles.subText}>
              Overlays vital spatial vectors, victim depth coordinates, and hazard perimeters directly onto field goggles.
            </Text>

            <View style={styles.hudDisplay}>
              <Text style={styles.hudCompass}>BEARING: 048° NORTHEAST</Text>
              <Text style={styles.hudDistance}>38m TO STRANDED VICTIM</Text>
              <Text style={styles.hudSub}>Estimated rubble depth: 2.4 meters (Micro-thermal signal confirmed)</Text>
            </View>

            <View style={styles.chipsRow}>
              <View style={styles.chip}><Text style={styles.chipText}>HUD Refresh: 60 FPS</Text></View>
              <View style={styles.chip}><Text style={styles.chipText}>Spatial Mesh: Active</Text></View>
              <View style={styles.chip}><Text style={styles.chipText}>Laser LiDAR: Locked</Text></View>
            </View>
          </View>
        )}

        {/* Tab 3: Acoustic Scream Triangulation */}
        {activeTab === 'acoustic' && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Acoustic Distress & Scream Triangulation</Text>
            <Text style={styles.subText}>
              Analyzes micro-vibrations and vocal distress patterns using distributed hydrophone and seismograph arrays.
            </Text>

            <View style={styles.acousticRow}>
              <View style={styles.acousticNode}>
                <Text style={styles.nodeName}>Mic Array Alpha</Text>
                <Text style={styles.nodeVal}>72 dB</Text>
                <Text style={styles.nodeStatus}>LOCKED</Text>
              </View>
              <View style={styles.acousticNode}>
                <Text style={styles.nodeName}>Mic Array Beta</Text>
                <Text style={styles.nodeVal}>68 dB</Text>
                <Text style={styles.nodeStatus}>LOCKED</Text>
              </View>
              <View style={styles.acousticNode}>
                <Text style={styles.nodeName}>Mic Array Gamma</Text>
                <Text style={styles.nodeVal}>81 dB</Text>
                <Text style={styles.nodeStatus}>PEAK SIGNAL</Text>
              </View>
            </View>
            <Text style={styles.subText}>
              Confidence: 94.6% human vocal distress within 15m radius of Sector 3 Riverbed.
            </Text>
          </View>
        )}

        {/* Tab 4: LEO Satellite Bridge */}
        {activeTab === 'satellite' && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>LEO Constellation Satellite Uplink</Text>
            <Text style={styles.subText}>
              Bypasses destroyed cell towers via automated direct burst to Low-Earth-Orbit satellite transponders.
            </Text>

            <View style={styles.telemetryBox}>
              <View style={styles.telemetryRow}>
                <Text style={styles.telLabel}>Constellation Orbit:</Text>
                <Text style={styles.telValue}>550 km Polar Inclination</Text>
              </View>
              <View style={styles.telemetryRow}>
                <Text style={styles.telLabel}>Active Passes:</Text>
                <Text style={[styles.telValue, { color: COLORS.success }]}>2 Satellites in Direct Zenith</Text>
              </View>
              <View style={styles.telemetryRow}>
                <Text style={styles.telLabel}>Latency / Ping:</Text>
                <Text style={styles.telValue}>28 ms Direct Up/Down</Text>
              </View>
            </View>
          </View>
        )}

        {/* Launch Web Console Link */}
        <TouchableOpacity
          style={styles.webBtn}
          onPress={() => openWebFeature('/hyper-speed-rescue')}
        >
          <Text style={styles.webBtnText}>Open Complete Hyper-Speed Rescue Console on Web ↗</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16, paddingBottom: 40 },
  heroBanner: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1,
    borderColor: '#ef4444',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  heroTag: { color: '#ef4444', fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  heroTitle: { color: COLORS.textPrimary, fontSize: 16, fontWeight: '800', marginTop: 4, marginBottom: 4 },
  heroDesc: { color: COLORS.textSecondary, fontSize: 12, lineHeight: 17 },
  tabBar: { flexDirection: 'row', backgroundColor: COLORS.surface, borderRadius: 8, padding: 4, marginBottom: 16 },
  tabBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 6 },
  tabBtnActive: { backgroundColor: COLORS.surfaceLight, borderWidth: 1, borderColor: COLORS.primary },
  tabText: { color: COLORS.textMuted, fontSize: 11, fontWeight: '700' },
  tabTextActive: { color: COLORS.primary },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    marginBottom: 16,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  cardTitle: { color: COLORS.textPrimary, fontSize: 14, fontWeight: '700', flex: 1 },
  liveBadge: { color: COLORS.success, fontSize: 10, fontWeight: '800', backgroundColor: 'rgba(34, 197, 94, 0.15)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  subText: { color: COLORS.textSecondary, fontSize: 12, lineHeight: 17, marginBottom: 12 },
  telemetryBox: {
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  telemetryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  telLabel: { color: COLORS.textMuted, fontSize: 11 },
  telValue: { color: COLORS.textPrimary, fontSize: 11, fontWeight: '700' },
  launchBtn: {
    backgroundColor: COLORS.emergency,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  launchBtnText: { color: '#FFF', fontWeight: '800', fontSize: 12, letterSpacing: 0.5 },
  countdownBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.18)',
    borderWidth: 1,
    borderColor: COLORS.emergency,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  countdownTitle: { color: COLORS.emergency, fontSize: 11, fontWeight: '800' },
  countdownTime: { color: '#FFF', fontSize: 20, fontWeight: '900', marginVertical: 4 },
  countdownSub: { color: COLORS.textMuted, fontSize: 10 },
  hudDisplay: {
    backgroundColor: '#020617',
    borderWidth: 1,
    borderColor: '#38bdf8',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  hudCompass: { color: '#38bdf8', fontSize: 12, fontWeight: '800', letterSpacing: 1 },
  hudDistance: { color: '#FFF', fontSize: 16, fontWeight: '900', marginVertical: 6 },
  hudSub: { color: COLORS.textSecondary, fontSize: 10, textAlign: 'center' },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { backgroundColor: COLORS.surfaceLight, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  chipText: { color: COLORS.textMuted, fontSize: 10, fontWeight: '600' },
  acousticRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  acousticNode: {
    flex: 1,
    backgroundColor: COLORS.surfaceLight,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  nodeName: { color: COLORS.textMuted, fontSize: 9, fontWeight: '600' },
  nodeVal: { color: COLORS.primary, fontSize: 16, fontWeight: '800', marginVertical: 4 },
  nodeStatus: { color: COLORS.success, fontSize: 8, fontWeight: '800' },
  webBtn: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.primary,
    alignItems: 'center',
    marginTop: 4,
  },
  webBtnText: { color: COLORS.primary, fontWeight: '700', fontSize: 12 },
});
