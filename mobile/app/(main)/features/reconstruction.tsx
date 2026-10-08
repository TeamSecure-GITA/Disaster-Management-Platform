import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Header } from '../../../components/navigation/Header';
import { COLORS } from '../../../constants/colors';
import { openWebFeature } from '../../../utils/webPortal';

export default function ReconstructionScreen() {
  const projects = [
    { name: 'Saraighat Overpass Structural Shoring', prog: '78%', status: 'Active Works', est: 'Completion: 4 Days' },
    { name: 'Chandrapur Embankment Stone Pitching', prog: '45%', status: 'In Progress', est: 'Completion: 8 Days' },
    { name: 'Ward 12 Drinking Water Pipe Repair', prog: '92%', status: 'Final Testing', est: 'Completion: 12 Hours' },
    { name: 'NH-37 Debris Clearing & Asphalt Sealing', prog: '60%', status: 'Active Heavy Machinery', est: 'Completion: 3 Days' },
  ];

  return (
    <View style={styles.container}>
      <Header title="Community Reconstruction" showBack />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heroBox}>
          <Text style={styles.heroTitle}>🏗️ POST-DISASTER RESTORATION MONITOR</Text>
          <Text style={styles.heroSub}>
            Tracking municipal rebuilding projects, road re-openings, bridge restorations and critical lifeline utilities.
          </Text>
        </View>

        <Text style={styles.sectionHeader}>KEY RESTORATION INITIATIVES</Text>

        {projects.map((p, idx) => (
          <View key={idx} style={styles.card}>
            <View style={styles.cardTop}>
              <Text style={styles.cardTitle}>{p.name}</Text>
              <Text style={styles.progText}>{p.prog}</Text>
            </View>
            <View style={styles.barBackground}>
              <View style={[styles.barFill, { width: p.prog as any }]} />
            </View>
            <View style={styles.cardMeta}>
              <Text style={styles.statusText}>⚙️ {p.status}</Text>
              <Text style={styles.estText}>{p.est}</Text>
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.webBtn} onPress={() => openWebFeature('/reconstruction')}>
          <Text style={styles.webBtnText}>Open Community Reconstruction Map on Web ↗</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16 },
  heroBox: { backgroundColor: 'rgba(255, 184, 0, 0.12)', borderWidth: 1, borderColor: COLORS.warning, borderRadius: 10, padding: 14, marginBottom: 16 },
  heroTitle: { color: COLORS.warning, fontSize: 12, fontWeight: '800', marginBottom: 4 },
  heroSub: { color: COLORS.textSecondary, fontSize: 12, lineHeight: 17 },
  sectionHeader: { color: COLORS.textMuted, fontSize: 11, fontWeight: '800', letterSpacing: 1, marginBottom: 10 },
  card: { backgroundColor: COLORS.surface, padding: 14, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border, marginBottom: 10 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  cardTitle: { color: COLORS.textPrimary, fontSize: 13, fontWeight: '700', flex: 1, marginRight: 8 },
  progText: { color: COLORS.primary, fontWeight: '800', fontSize: 13 },
  barBackground: { height: 6, backgroundColor: COLORS.surfaceLight, borderRadius: 3, overflow: 'hidden', marginBottom: 8 },
  barFill: { height: '100%', backgroundColor: COLORS.primary, borderRadius: 3 },
  cardMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statusText: { color: COLORS.textSecondary, fontSize: 11 },
  estText: { color: COLORS.textMuted, fontSize: 11 },
  webBtn: { padding: 12, borderRadius: 8, borderWidth: 1, borderColor: COLORS.primary, alignItems: 'center', marginTop: 14 },
  webBtnText: { color: COLORS.primary, fontWeight: '700', fontSize: 12 },
});
