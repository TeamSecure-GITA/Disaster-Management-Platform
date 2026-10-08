import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Header } from '../../../components/navigation/Header';
import { COLORS } from '../../../constants/colors';
import { openWebFeature } from '../../../utils/webPortal';

export default function SmartAlertsScreen() {
  const [sensors] = useState([
    { id: 'IOT-1', type: 'Ultrasonic River Gauge', location: 'Saraighat Bridge Pier 4', reading: '49.2m (+1.4m/hr)', status: 'WARNING', battery: '92%' },
    { id: 'IOT-2', type: 'Soil Moisture Capacitive Probe', location: 'Deepor Beel Catchment', reading: '98% Saturation', status: 'CRITICAL', battery: '84%' },
    { id: 'IOT-3', type: 'MEMS Micro-Seismometer', location: 'Dispur Hill Escarpment', reading: '0.04g Micro-tremor', status: 'NORMAL', battery: '96%' },
    { id: 'IOT-4', type: 'Rainfall Piezo Optical Gauge', location: 'Khanapara Ridge', reading: '68 mm/hr (Heavy)', status: 'WARNING', battery: '89%' },
  ]);

  return (
    <View style={styles.container}>
      <Header title="Smart IoT Multi-Sensory Grid" showBack />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.gridHero}>
          <Text style={styles.heroTitle}>SENSORY PERIMETER ONLINE</Text>
          <Text style={styles.heroSub}>32 Distributed telemetry beacons transmitting live hydrology, soil and acoustic vibrations.</Text>
        </View>

        <Text style={styles.sectionHeader}>CONNECTED FIELD SENSORS</Text>

        {sensors.map((s) => (
          <View key={s.id} style={styles.sensorCard}>
            <View style={styles.cardRow}>
              <Text style={styles.sensorType}>{s.type}</Text>
              <View style={[styles.badge, s.status === 'CRITICAL' ? styles.badgeCrit : styles.badgeWarn]}>
                <Text style={styles.badgeText}>{s.status}</Text>
              </View>
            </View>
            <Text style={styles.sensorLoc}>📍 {s.location}</Text>
            <View style={styles.metricRow}>
              <Text style={styles.readingText}>Reading: <Text style={styles.valText}>{s.reading}</Text></Text>
              <Text style={styles.batteryText}>⚡ {s.battery}</Text>
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.webBtn} onPress={() => openWebFeature('/smart-alerts')}>
          <Text style={styles.webBtnText}>Open Multi-Sensory Sensor Mesh on Web ↗</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16 },
  gridHero: { backgroundColor: 'rgba(6, 182, 212, 0.12)', borderWidth: 1, borderColor: '#06b6d4', borderRadius: 10, padding: 14, marginBottom: 16 },
  heroTitle: { color: '#06b6d4', fontSize: 12, fontWeight: '800', marginBottom: 4 },
  heroSub: { color: COLORS.textSecondary, fontSize: 12, lineHeight: 17 },
  sectionHeader: { color: COLORS.textMuted, fontSize: 11, fontWeight: '800', letterSpacing: 1, marginBottom: 10 },
  sensorCard: { backgroundColor: COLORS.surface, padding: 14, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border, marginBottom: 10 },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  sensorType: { color: COLORS.textPrimary, fontSize: 13, fontWeight: '700' },
  sensorLoc: { color: COLORS.textSecondary, fontSize: 11, marginBottom: 8 },
  metricRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  readingText: { color: COLORS.textMuted, fontSize: 11 },
  valText: { color: COLORS.textPrimary, fontWeight: '700' },
  batteryText: { color: COLORS.success, fontSize: 11, fontWeight: '700' },
  badge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  badgeCrit: { backgroundColor: 'rgba(255, 42, 85, 0.2)', borderWidth: 1, borderColor: COLORS.emergency },
  badgeWarn: { backgroundColor: 'rgba(255, 184, 0, 0.2)', borderWidth: 1, borderColor: COLORS.warning },
  badgeText: { fontSize: 10, fontWeight: '800', color: COLORS.textPrimary },
  webBtn: { padding: 12, borderRadius: 8, borderWidth: 1, borderColor: COLORS.primary, alignItems: 'center', marginTop: 14 },
  webBtnText: { color: COLORS.primary, fontWeight: '700', fontSize: 12 },
});
