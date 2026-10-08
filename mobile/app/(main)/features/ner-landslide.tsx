import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Header } from '../../../components/navigation/Header';
import { COLORS } from '../../../constants/colors';
import { openWebFeature } from '../../../utils/webPortal';

export default function NERLandslideScreen() {
  const [selectedSensor, setSelectedSensor] = useState('Kamakhya Hill Station #3');

  const sensors = [
    { id: 'S1', name: 'Kamakhya Hill Station #3', porePressure: '87.4 kPa (CRITICAL)', displacement: '4.8 mm/hr', risk: 'HIGH', soilSaturation: '94%' },
    { id: 'S2', name: 'NH-40 Byrnihat Escarpment', porePressure: '52.1 kPa (ELEVATED)', displacement: '1.2 mm/hr', risk: 'MODERATE', soilSaturation: '78%' },
    { id: 'S3', name: 'Naranarayan InSAR Anchor', porePressure: '31.0 kPa (NORMAL)', displacement: '0.2 mm/hr', risk: 'LOW', soilSaturation: '51%' },
  ];

  return (
    <View style={styles.container}>
      <Header title="NER Landslide Geotechnical Monitor" showBack />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.alertBanner}>
          <Text style={styles.alertIcon}>⚠️</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.alertTitle}>HIGH SATURATION SLOPE ALARM</Text>
            <Text style={styles.alertSub}>3 Northeast Hill corridors exceeding critical pore-water thresholds.</Text>
          </View>
        </View>

        <Text style={styles.sectionHeader}>BOREHOLE SENSOR TELEMETRY</Text>

        {sensors.map((s) => (
          <TouchableOpacity
            key={s.id}
            style={[styles.card, selectedSensor === s.name && styles.cardActive]}
            onPress={() => setSelectedSensor(s.name)}
          >
            <View style={styles.cardTop}>
              <Text style={styles.sensorName}>{s.name}</Text>
              <View style={[styles.riskTag, s.risk === 'HIGH' ? styles.riskHigh : styles.riskMod]}>
                <Text style={styles.riskText}>{s.risk}</Text>
              </View>
            </View>
            <View style={styles.metricsGrid}>
              <View style={styles.metricItem}>
                <Text style={styles.metricLbl}>Pore Pressure</Text>
                <Text style={styles.metricVal}>{s.porePressure}</Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.metricLbl}>Displacement</Text>
                <Text style={styles.metricVal}>{s.displacement}</Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.metricLbl}>Soil Saturation</Text>
                <Text style={styles.metricVal}>{s.soilSaturation}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={styles.webBtn} onPress={() => openWebFeature('/ner-landslide-monitor')}>
          <Text style={styles.webBtnText}>Open 3D InSAR & Slope Angle Radar on Web ↗</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16 },
  alertBanner: { flexDirection: 'row', backgroundColor: 'rgba(255, 42, 85, 0.15)', borderWidth: 1, borderColor: COLORS.emergency, borderRadius: 10, padding: 12, marginBottom: 16, alignItems: 'center', gap: 10 },
  alertIcon: { fontSize: 24 },
  alertTitle: { color: COLORS.emergency, fontSize: 13, fontWeight: '800' },
  alertSub: { color: COLORS.textSecondary, fontSize: 11, marginTop: 2 },
  sectionHeader: { color: COLORS.textMuted, fontSize: 11, fontWeight: '800', letterSpacing: 1, marginBottom: 8 },
  card: { backgroundColor: COLORS.surface, padding: 14, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border, marginBottom: 10 },
  cardActive: { borderColor: COLORS.primary, backgroundColor: COLORS.surfaceLight },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sensorName: { color: COLORS.textPrimary, fontSize: 13, fontWeight: '700' },
  riskTag: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  riskHigh: { backgroundColor: 'rgba(255, 42, 85, 0.2)', borderWidth: 1, borderColor: COLORS.emergency },
  riskMod: { backgroundColor: 'rgba(255, 184, 0, 0.2)', borderWidth: 1, borderColor: COLORS.warning },
  riskText: { fontSize: 10, fontWeight: '800', color: COLORS.textPrimary },
  metricsGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  metricItem: { flex: 1 },
  metricLbl: { fontSize: 10, color: COLORS.textMuted },
  metricVal: { fontSize: 11, color: COLORS.textPrimary, fontWeight: '700', marginTop: 2 },
  webBtn: { padding: 12, borderRadius: 8, borderWidth: 1, borderColor: COLORS.primary, alignItems: 'center', marginTop: 12 },
  webBtnText: { color: COLORS.primary, fontWeight: '700', fontSize: 12 },
});
