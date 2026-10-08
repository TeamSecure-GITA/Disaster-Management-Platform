import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Header } from '../../../components/navigation/Header';
import { COLORS } from '../../../constants/colors';
import { openWebFeature } from '../../../utils/webPortal';

export default function NERTopographyScreen() {
  const [selectedSuite, setSelectedSuite] = useState('Hill Cut Landslide Simulation');

  const suites = [
    { title: 'Hill Cut Landslide Simulation', desc: 'Predicts escarpment shear failures and road cleavage under monsoon soil load.', status: 'OPERATIONAL' },
    { title: 'River Basin Overtopping', desc: 'Brahmaputra hydrological flow model calculating embankment breach margins.', status: 'CALIBRATED' },
    { title: 'Seismic Liquefaction Radar', desc: 'Identifies unconsolidated silt sand layers vulnerable to earthquake shear wave failure.', status: 'ACTIVE' },
    { title: 'Valley Flash Flood Funnel', desc: 'High-velocity water surge velocity calculations through narrow mountain gorges.', status: 'READY' },
  ];

  return (
    <View style={styles.container}>
      <Header title="NER Topography Simulation" showBack />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heroBox}>
          <Text style={styles.heroTitle}>🏔️ NORTHEAST MULTI-HAZARD TOPOGRAPHY</Text>
          <Text style={styles.heroSub}>
            Dedicated GIS topography models calibrated for the Eastern Himalayas and Brahmaputra drainage basin.
          </Text>
        </View>

        <Text style={styles.sectionHeader}>SIMULATION SUITE MODULES</Text>

        {suites.map((s, idx) => (
          <TouchableOpacity
            key={idx}
            style={[styles.card, selectedSuite === s.title && styles.cardActive]}
            onPress={() => setSelectedSuite(s.title)}
          >
            <View style={styles.cardTop}>
              <Text style={styles.cardTitle}>{s.title}</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{s.status}</Text>
              </View>
            </View>
            <Text style={styles.cardDesc}>{s.desc}</Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={styles.webBtn} onPress={() => openWebFeature('/ner-topography-suite')}>
          <Text style={styles.webBtnText}>Open Full 3D Topography Suite on Web ↗</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16 },
  heroBox: { backgroundColor: 'rgba(139, 92, 246, 0.12)', borderWidth: 1, borderColor: '#8b5cf6', borderRadius: 10, padding: 14, marginBottom: 16 },
  heroTitle: { color: '#a78bfa', fontSize: 12, fontWeight: '800', marginBottom: 4 },
  heroSub: { color: COLORS.textSecondary, fontSize: 12, lineHeight: 17 },
  sectionHeader: { color: COLORS.textMuted, fontSize: 11, fontWeight: '800', letterSpacing: 1, marginBottom: 10 },
  card: { backgroundColor: COLORS.surface, padding: 14, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border, marginBottom: 10 },
  cardActive: { borderColor: '#8b5cf6', backgroundColor: COLORS.surfaceLight },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  cardTitle: { color: COLORS.textPrimary, fontSize: 13, fontWeight: '700', flex: 1 },
  badge: { backgroundColor: 'rgba(139, 92, 246, 0.2)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, borderWidth: 1, borderColor: '#8b5cf6' },
  badgeText: { color: '#c4b5fd', fontSize: 9, fontWeight: '800' },
  cardDesc: { color: COLORS.textSecondary, fontSize: 12, lineHeight: 16 },
  webBtn: { padding: 12, borderRadius: 8, borderWidth: 1, borderColor: COLORS.primary, alignItems: 'center', marginTop: 14 },
  webBtnText: { color: COLORS.primary, fontWeight: '700', fontSize: 12 },
});
