import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Header } from '../../../components/navigation/Header';
import { COLORS } from '../../../constants/colors';
import { openWebFeature } from '../../../utils/webPortal';

export default function DroneAnalyticsScreen() {
  const [drones] = useState([
    { id: 'DRONE-X1', status: 'ACTIVE FLIGHT', battery: '76%', alt: '120m AGL', speed: '34 km/h', targets: '3 Human heat signatures' },
    { id: 'DRONE-X2', status: 'HOVERING', battery: '42%', alt: '85m AGL', speed: '0 km/h', targets: '1 Inundated building rooftop' },
    { id: 'DRONE-X3', status: 'RETURNING', battery: '18%', alt: '150m AGL', speed: '48 km/h', targets: 'Low Battery Auto-RTH' },
  ]);

  return (
    <View style={styles.container}>
      <Header title="Drone Video AI Reconnaissance" showBack />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heroCard}>
          <Text style={styles.heroTitle}>AERIAL SEARCH & RESCUE PATROL</Text>
          <Text style={styles.heroSub}>
            Computer vision edge models detecting survivors, debris obstructions and thermal signatures from autonomous UAV camera feeds.
          </Text>
        </View>

        <Text style={styles.sectionHeader}>DEPLOYED UAV SQUADRON</Text>

        {drones.map((d) => (
          <View key={d.id} style={styles.droneCard}>
            <View style={styles.droneTop}>
              <Text style={styles.droneId}>🚁 {d.id}</Text>
              <View style={[styles.badge, d.status === 'ACTIVE FLIGHT' ? styles.badgeGreen : styles.badgeBlue]}>
                <Text style={styles.badgeText}>{d.status}</Text>
              </View>
            </View>
            <View style={styles.telemetryRow}>
              <Text style={styles.telItem}>⚡ Bat: {d.battery}</Text>
              <Text style={styles.telItem}>📏 Alt: {d.alt}</Text>
              <Text style={styles.telItem}>💨 Vel: {d.speed}</Text>
            </View>
            <View style={styles.targetBox}>
              <Text style={styles.targetLabel}>AI Detection:</Text>
              <Text style={styles.targetVal}>{d.targets}</Text>
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.webBtn} onPress={() => openWebFeature('/drone-analytics')}>
          <Text style={styles.webBtnText}>Open Live UAV Video & Thermal Stream on Web ↗</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16 },
  heroCard: { backgroundColor: 'rgba(56, 189, 248, 0.12)', borderWidth: 1, borderColor: COLORS.primary, borderRadius: 10, padding: 14, marginBottom: 16 },
  heroTitle: { color: COLORS.primary, fontSize: 12, fontWeight: '800', marginBottom: 4 },
  heroSub: { color: COLORS.textSecondary, fontSize: 12, lineHeight: 17 },
  sectionHeader: { color: COLORS.textMuted, fontSize: 11, fontWeight: '800', letterSpacing: 1, marginBottom: 10 },
  droneCard: { backgroundColor: COLORS.surface, padding: 14, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border, marginBottom: 10 },
  droneTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  droneId: { color: COLORS.textPrimary, fontSize: 13, fontWeight: '700' },
  badge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  badgeGreen: { backgroundColor: 'rgba(0, 229, 153, 0.15)', borderWidth: 1, borderColor: COLORS.success },
  badgeBlue: { backgroundColor: 'rgba(59, 130, 246, 0.15)', borderWidth: 1, borderColor: COLORS.info },
  badgeText: { fontSize: 10, fontWeight: '800', color: COLORS.textPrimary },
  telemetryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  telItem: { color: COLORS.textMuted, fontSize: 11 },
  targetBox: { backgroundColor: COLORS.surfaceLight, padding: 8, borderRadius: 6 },
  targetLabel: { color: COLORS.primary, fontSize: 10, fontWeight: '700' },
  targetVal: { color: COLORS.textPrimary, fontSize: 11, marginTop: 2 },
  webBtn: { padding: 12, borderRadius: 8, borderWidth: 1, borderColor: COLORS.primary, alignItems: 'center', marginTop: 14 },
  webBtnText: { color: COLORS.primary, fontWeight: '700', fontSize: 12 },
});
