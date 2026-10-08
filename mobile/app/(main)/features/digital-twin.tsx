import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Header } from '../../../components/navigation/Header';
import { COLORS } from '../../../constants/colors';
import { openWebFeature } from '../../../utils/webPortal';

export default function DigitalTwinScreen() {
  const [rainMm, setRainMm] = useState(120);
  const [soilSaturation, setSoilSaturation] = useState(85);
  const [simRunning, setSimRunning] = useState(false);

  const runSim = () => {
    setSimRunning(true);
    setTimeout(() => {
      setSimRunning(false);
      Alert.alert('3D Physics Simulation Complete', 'Terrain runoff model computed: 18.4% breach probability calculated for Lower Hill Sector.');
    }, 1500);
  };

  return (
    <View style={styles.container}>
      <Header title="AI Digital Twin 3D Simulator" showBack />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heroBox}>
          <Text style={styles.heroTitle}>🏙️ HYDROLOGICAL & SLOPE DIGITAL TWIN</Text>
          <Text style={styles.heroSub}>
            Physics-based digital recreation of urban & mountainous topography simulating flood surge paths and seismic breach points.
          </Text>
        </View>

        <Text style={styles.sectionHeader}>SIMULATION PARAMETERS</Text>

        <View style={styles.paramCard}>
          <Text style={styles.paramLbl}>Extreme Precipitation Rate: <Text style={styles.paramVal}>{rainMm} mm/hr</Text></Text>
          <View style={styles.pillRow}>
            {[60, 120, 180, 240].map((v) => (
              <TouchableOpacity
                key={v}
                style={[styles.paramPill, rainMm === v && styles.paramPillActive]}
                onPress={() => setRainMm(v)}
              >
                <Text style={[styles.pillText, rainMm === v && styles.pillTextActive]}>{v} mm</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.paramLbl, { marginTop: 14 }]}>Pre-existing Soil Saturation: <Text style={styles.paramVal}>{soilSaturation}%</Text></Text>
          <View style={styles.pillRow}>
            {[45, 65, 85, 95].map((s) => (
              <TouchableOpacity
                key={s}
                style={[styles.paramPill, soilSaturation === s && styles.paramPillActive]}
                onPress={() => setSoilSaturation(s)}
              >
                <Text style={[styles.pillText, soilSaturation === s && styles.pillTextActive]}>{s}%</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.runBtn, simRunning && styles.runBtnLoading]}
            onPress={runSim}
            disabled={simRunning}
          >
            <Text style={styles.runBtnText}>
              {simRunning ? 'COMPUTING HYDRO-DYNAMICS...' : '▶ EXECUTE 3D SIMULATION RUN'}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.webBtn} onPress={() => openWebFeature('/digital-twin')}>
          <Text style={styles.webBtnText}>Launch Full WebGL 3D Terrain Viewer on Web ↗</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16 },
  heroBox: { backgroundColor: 'rgba(168, 85, 247, 0.12)', borderWidth: 1, borderColor: '#a855f7', borderRadius: 10, padding: 14, marginBottom: 16 },
  heroTitle: { color: '#c084fc', fontSize: 12, fontWeight: '800', marginBottom: 4 },
  heroSub: { color: COLORS.textSecondary, fontSize: 12, lineHeight: 17 },
  sectionHeader: { color: COLORS.textMuted, fontSize: 11, fontWeight: '800', letterSpacing: 1, marginBottom: 10 },
  paramCard: { backgroundColor: COLORS.surface, padding: 16, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border, marginBottom: 16 },
  paramLbl: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '600', marginBottom: 8 },
  paramVal: { color: COLORS.primary, fontWeight: '800' },
  pillRow: { flexDirection: 'row', gap: 8 },
  paramPill: { flex: 1, backgroundColor: COLORS.surfaceLight, paddingVertical: 8, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  paramPillActive: { backgroundColor: '#a855f7', borderColor: '#a855f7' },
  pillText: { color: COLORS.textSecondary, fontSize: 11, fontWeight: '700' },
  pillTextActive: { color: '#FFF', fontWeight: '800' },
  runBtn: { backgroundColor: '#a855f7', paddingVertical: 14, borderRadius: 8, alignItems: 'center', marginTop: 18 },
  runBtnLoading: { backgroundColor: '#6b21a8' },
  runBtnText: { color: '#FFF', fontWeight: '800', fontSize: 12, letterSpacing: 0.5 },
  webBtn: { padding: 12, borderRadius: 8, borderWidth: 1, borderColor: COLORS.primary, alignItems: 'center', marginTop: 8 },
  webBtnText: { color: COLORS.primary, fontWeight: '700', fontSize: 12 },
});
