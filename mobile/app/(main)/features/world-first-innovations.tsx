import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Header } from '../../../components/navigation/Header';
import { COLORS } from '../../../constants/colors';
import { openWebFeature } from '../../../utils/webPortal';

export default function WorldFirstInnovationsScreen() {
  const [activeTab, setActiveTab] = useState('magnetometer');

  const innovations = [
    { id: 'magnetometer', title: 'Magnetometer Rubble Locator', subtitle: 'Uses phone Hall sensor to pinpoint steel rebar voids under concrete rubble.', metric: 'Depth: 2.8m' },
    { id: 'thermal-tap', title: 'Thermoelectric Thermal Tap', subtitle: 'Detects micro-thermal conduction differences between trapped body heat & debris.', metric: 'ΔT: 0.8°C' },
    { id: 'barometric', title: 'Barometric Flash Flood Surge', subtitle: 'Monitors micro-barometric drops preceding localized cloudbursts by 15 mins.', metric: 'ΔP: 1.4 hPa/10m' },
    { id: 'muon', title: 'Cosmic Muon Density Imaging', subtitle: 'Simulates atmospheric muon scattering to inspect structural density.', metric: 'Flux: 10,000/m²' },
    { id: 'quantum-chaff', title: 'Post-Quantum Chaff Masking', subtitle: 'ML-KEM lattice cryptography & quantum gossip routing for secure communications.', metric: 'Entropy: 256-bit' },
  ];

  return (
    <View style={styles.container}>
      <Header title="World-First Deep-Tech Suite" showBack />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heroBox}>
          <Text style={styles.heroTitle}>🔬 FRONTIER RESCUE SENSOR LAB</Text>
          <Text style={styles.heroSub}>
            Hardware-native deep tech innovations turning regular mobile hardware into life-saving search and rescue radar.
          </Text>
        </View>

        <Text style={styles.sectionHeader}>DEEP-TECH HARDWARE MODULES</Text>

        {innovations.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[styles.card, activeTab === item.id && styles.cardActive]}
            onPress={() => setActiveTab(item.id)}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <View style={styles.metricBadge}>
                <Text style={styles.metricText}>{item.metric}</Text>
              </View>
            </View>
            <Text style={styles.cardSub}>{item.subtitle}</Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={styles.webBtn} onPress={() => openWebFeature('/world-first-innovations')}>
          <Text style={styles.webBtnText}>Open Full Deep-Tech Sensor Suite on Web ↗</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16 },
  heroBox: { backgroundColor: 'rgba(99, 102, 241, 0.12)', borderWidth: 1, borderColor: '#6366f1', borderRadius: 10, padding: 14, marginBottom: 16 },
  heroTitle: { color: '#818cf8', fontSize: 12, fontWeight: '800', marginBottom: 4 },
  heroSub: { color: COLORS.textSecondary, fontSize: 12, lineHeight: 17 },
  sectionHeader: { color: COLORS.textMuted, fontSize: 11, fontWeight: '800', letterSpacing: 1, marginBottom: 10 },
  card: { backgroundColor: COLORS.surface, padding: 14, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border, marginBottom: 10 },
  cardActive: { borderColor: '#6366f1', backgroundColor: COLORS.surfaceLight },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  cardTitle: { color: COLORS.textPrimary, fontSize: 13, fontWeight: '700', flex: 1 },
  metricBadge: { backgroundColor: 'rgba(99, 102, 241, 0.2)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, borderWidth: 1, borderColor: '#6366f1' },
  metricText: { color: '#818cf8', fontSize: 10, fontWeight: '800' },
  cardSub: { color: COLORS.textSecondary, fontSize: 12, lineHeight: 16 },
  webBtn: { padding: 12, borderRadius: 8, borderWidth: 1, borderColor: COLORS.primary, alignItems: 'center', marginTop: 14 },
  webBtnText: { color: COLORS.primary, fontWeight: '700', fontSize: 12 },
});
