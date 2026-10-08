import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Header } from '../../../components/navigation/Header';
import { COLORS } from '../../../constants/colors';
import { openWebFeature } from '../../../utils/webPortal';

export default function StatisticsScreen() {
  const stats = [
    { label: 'Active Monitored Disasters', value: '4 Regional Events', change: '+1 in 24h', color: COLORS.emergency },
    { label: 'Citizens Safely Evacuated', value: '18,420 Individuals', change: '96.2% success', color: COLORS.success },
    { label: 'Emergency Responders Deployed', value: '1,280 Personnel', change: 'Full mobilization', color: COLORS.primary },
    { label: 'Disaster Shelters Operational', value: '84 Active Facilities', change: '72% capacity', color: COLORS.info },
    { label: 'Average Emergency Response Time', value: '4.2 Minutes', change: '-35% faster', color: COLORS.success },
    { label: 'LoRa Mesh Emergency Packets Relayed', value: '45,820 Packets', change: '100% deliverability', color: COLORS.warning },
  ];

  return (
    <View style={styles.container}>
      <Header title="Statistics & Operational Impact" showBack />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionHeader}>PLATFORM PERFORMANCE KPIS</Text>

        {stats.map((s, idx) => (
          <View key={idx} style={styles.statCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.statLbl}>{s.label}</Text>
              <Text style={[styles.statVal, { color: s.color }]}>{s.value}</Text>
            </View>
            <View style={styles.changeBadge}>
              <Text style={styles.changeText}>{s.change}</Text>
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.webBtn} onPress={() => openWebFeature('/statistics')}>
          <Text style={styles.webBtnText}>Open Detailed Charts & Export PDF on Web ↗</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16 },
  sectionHeader: { color: COLORS.textMuted, fontSize: 11, fontWeight: '800', letterSpacing: 1, marginBottom: 12 },
  statCard: { flexDirection: 'row', backgroundColor: COLORS.surface, padding: 14, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border, marginBottom: 10, alignItems: 'center' },
  statLbl: { fontSize: 11, color: COLORS.textSecondary, marginBottom: 2 },
  statVal: { fontSize: 15, fontWeight: '800' },
  changeBadge: { backgroundColor: COLORS.surfaceLight, paddingVertical: 4, paddingHorizontal: 8, borderRadius: 6, borderWidth: 1, borderColor: COLORS.borderLight },
  changeText: { fontSize: 10, color: COLORS.textPrimary, fontWeight: '700' },
  webBtn: { padding: 12, borderRadius: 8, borderWidth: 1, borderColor: COLORS.primary, alignItems: 'center', marginTop: 14 },
  webBtnText: { color: COLORS.primary, fontWeight: '700', fontSize: 12 },
});
