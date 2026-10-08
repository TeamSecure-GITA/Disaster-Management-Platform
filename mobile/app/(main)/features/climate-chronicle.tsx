import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Header } from '../../../components/navigation/Header';
import { COLORS } from '../../../constants/colors';
import { openWebFeature } from '../../../utils/webPortal';

export default function ClimateChronicleScreen() {
  const events = [
    { year: '2024', name: 'Assam Flood Wave IV', severity: 'Severe', impact: '2.4M Displaced', detail: 'Brahmaputra crested 1.8m above danger mark' },
    { year: '2023', name: 'Cyclone Tej & Mid-Monsoon Flash Inundation', severity: 'High', impact: '840k Affected', detail: 'Intense precipitation anomaly in Brahmaputra-Barak basin' },
    { year: '2020', name: 'Deopani Flash Flood & Landslide Rupture', severity: 'Catastrophic', impact: 'National Highway NH-52 Severed', detail: 'Rapid debris flow blocked eastern gorge pass' },
    { year: '2016', name: 'Brahmaputra Basin Megaflood', severity: 'Catastrophic', impact: '3.8M Displaced', detail: 'Kaziranga submerged, 1,200 villages inundated' },
  ];

  return (
    <View style={styles.container}>
      <Header title="Climate Disaster Intelligence" showBack />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>MULTI-DECADAL CLIMATE TRENDS</Text>
          <Text style={styles.summaryBody}>
            Analysis of 50 years of meteorological records in Northeast India shows a 34% increase in localized cloudburst frequency and intensified flash flood surge speeds.
          </Text>
        </View>

        <Text style={styles.sectionHeader}>HISTORICAL CRISIS CHRONICLE</Text>

        {events.map((e, idx) => (
          <View key={idx} style={styles.eventCard}>
            <View style={styles.eventYearBox}>
              <Text style={styles.eventYear}>{e.year}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.eventName}>{e.name}</Text>
              <Text style={styles.eventImpact}>{e.impact}</Text>
              <Text style={styles.eventDetail}>{e.detail}</Text>
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.webBtn} onPress={() => openWebFeature('/climate-chronicle')}>
          <Text style={styles.webBtnText}>Open Full Interactive Climate Chronicle on Web ↗</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16 },
  summaryCard: { backgroundColor: 'rgba(14, 165, 233, 0.12)', borderWidth: 1, borderColor: '#0ea5e9', borderRadius: 10, padding: 14, marginBottom: 16 },
  summaryTitle: { color: '#38bdf8', fontSize: 12, fontWeight: '800', marginBottom: 4 },
  summaryBody: { color: COLORS.textSecondary, fontSize: 12, lineHeight: 17 },
  sectionHeader: { color: COLORS.textMuted, fontSize: 11, fontWeight: '800', letterSpacing: 1, marginBottom: 10 },
  eventCard: { flexDirection: 'row', backgroundColor: COLORS.surface, padding: 12, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border, marginBottom: 10, gap: 12, alignItems: 'center' },
  eventYearBox: { backgroundColor: COLORS.surfaceLight, paddingVertical: 8, paddingHorizontal: 10, borderRadius: 6, borderWidth: 1, borderColor: COLORS.borderLight, alignItems: 'center', justifyContent: 'center' },
  eventYear: { color: COLORS.primary, fontWeight: '800', fontSize: 13 },
  eventName: { color: COLORS.textPrimary, fontSize: 13, fontWeight: '700' },
  eventImpact: { color: COLORS.warning, fontSize: 11, fontWeight: '700', marginTop: 2 },
  eventDetail: { color: COLORS.textMuted, fontSize: 11, marginTop: 2 },
  webBtn: { padding: 12, borderRadius: 8, borderWidth: 1, borderColor: COLORS.primary, alignItems: 'center', marginTop: 14 },
  webBtnText: { color: COLORS.primary, fontWeight: '700', fontSize: 12 },
});
