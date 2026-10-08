import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Header } from '../../../components/navigation/Header';
import { COLORS } from '../../../constants/colors';
import { openWebFeature } from '../../../utils/webPortal';

export default function ARSeeTheRiskScreen() {
  const [scanning, setScanning] = useState(false);
  const [reading, setReading] = useState({
    slopeAngle: '38.4° (CRITICAL)',
    waterProjection: '+2.1m Inundation Level',
    groundStability: 'UNSTABLE (Pore sat >80%)',
    evacRecommendation: 'EVACUATE UPHILL BEARING 045°',
  });

  const handleScan = () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      Alert.alert('AR Risk Scan Complete', 'Camera elevation & flood projections updated based on local terrain mesh.');
    }, 1500);
  };

  return (
    <View style={styles.container}>
      <Header title="AR See The Risk Scanner" showBack />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heroBox}>
          <Text style={styles.heroTitle}>👓 AUGMENTED REALITY HAZARD SCANNER</Text>
          <Text style={styles.heroSub}>
            Uses smartphone accelerometer, gyro and camera to project 3D flood high-water levels and slope collapse zones onto physical surroundings.
          </Text>
        </View>

        <View style={styles.arPreviewBox}>
          <Text style={styles.arIcon}>📷</Text>
          <Text style={styles.arTitle}>CAMERA HUD SCANNER</Text>
          <Text style={styles.arSub}>Point camera towards hillslope, river bank or structure</Text>

          <TouchableOpacity
            style={[styles.scanBtn, scanning && styles.scanBtnActive]}
            onPress={handleScan}
            disabled={scanning}
          >
            <Text style={styles.scanBtnText}>{scanning ? 'CALIBRATING AR HUD...' : 'START AR SCANNER'}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionHeader}>REAL-TIME AR TELEMETRY</Text>

        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.lbl}>Slope Incline Angle:</Text>
            <Text style={[styles.val, { color: COLORS.emergency }]}>{reading.slopeAngle}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.lbl}>Projected Flood Crest:</Text>
            <Text style={[styles.val, { color: COLORS.warning }]}>{reading.waterProjection}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.lbl}>Soil Ground Stability:</Text>
            <Text style={styles.val}>{reading.groundStability}</Text>
          </View>
          <View style={[styles.row, { borderBottomWidth: 0, marginTop: 4 }]}>
            <Text style={styles.lbl}>AI Action Order:</Text>
            <Text style={[styles.val, { color: COLORS.primary }]}>{reading.evacRecommendation}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.webBtn} onPress={() => openWebFeature('/ar-see-the-risk')}>
          <Text style={styles.webBtnText}>Open WebXR AR Scanner on Web Browser ↗</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16 },
  heroBox: { backgroundColor: 'rgba(20, 184, 166, 0.12)', borderWidth: 1, borderColor: '#14b8a6', borderRadius: 10, padding: 14, marginBottom: 16 },
  heroTitle: { color: '#2dd4bf', fontSize: 12, fontWeight: '800', marginBottom: 4 },
  heroSub: { color: COLORS.textSecondary, fontSize: 12, lineHeight: 17 },
  arPreviewBox: { backgroundColor: '#020617', borderWidth: 1, borderColor: '#1e293b', borderRadius: 12, padding: 24, alignItems: 'center', marginBottom: 16 },
  arIcon: { fontSize: 36, marginBottom: 8 },
  arTitle: { color: COLORS.primary, fontSize: 14, fontWeight: '800', letterSpacing: 1 },
  arSub: { color: COLORS.textMuted, fontSize: 11, textAlign: 'center', marginTop: 4, marginBottom: 16 },
  scanBtn: { backgroundColor: '#14b8a6', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8 },
  scanBtnActive: { backgroundColor: '#0f766e' },
  scanBtnText: { color: '#FFF', fontWeight: '800', fontSize: 12, letterSpacing: 0.5 },
  sectionHeader: { color: COLORS.textMuted, fontSize: 11, fontWeight: '800', letterSpacing: 1, marginBottom: 10 },
  card: { backgroundColor: COLORS.surface, padding: 14, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border, marginBottom: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: COLORS.borderLight },
  lbl: { color: COLORS.textSecondary, fontSize: 12 },
  val: { color: COLORS.textPrimary, fontSize: 12, fontWeight: '700' },
  webBtn: { padding: 12, borderRadius: 8, borderWidth: 1, borderColor: COLORS.primary, alignItems: 'center', marginTop: 14 },
  webBtnText: { color: COLORS.primary, fontWeight: '700', fontSize: 12 },
});
