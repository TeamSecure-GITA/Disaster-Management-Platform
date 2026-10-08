import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Header } from '../../../components/navigation/Header';
import { COLORS } from '../../../constants/colors';
import { openWebFeature } from '../../../utils/webPortal';

export default function ExtremeResilienceScreen() {
  const tools = [
    { title: 'WASM Edge Supercomputer', desc: 'Compiles offline physics engines & GIS routing entirely in native WebAssembly with zero server overhead.', status: 'COMPUTING' },
    { title: 'Ultra-Low Power E-Ink Canvas', desc: 'Sub-milliwatt display driver rendering high-contrast emergency maps in direct sunlight.', status: 'STANDBY' },
    { title: 'NFC Emergency Relief Lockers', desc: 'Touchless secure dispensing of ration packages, medicine and emergency satellite phones.', status: 'READY' },
    { title: 'LiFi Optical Data Transmission', desc: 'High-speed directional optical communication via flashlight LED pulses when radio is jammed.', status: 'IDLE' },
  ];

  return (
    <View style={styles.container}>
      <Header title="Extreme Resilience Grid" showBack />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heroBox}>
          <Text style={styles.heroTitle}>🧪 EXTREME ENVIRONMENT RESILIENCE</Text>
          <Text style={styles.heroSub}>
            Hardware and algorithmic adaptations tailored for blackout survival, radiation zones and RF jamming conditions.
          </Text>
        </View>

        <Text style={styles.sectionHeader}>EXTREME HARDWARE CAPABILITIES</Text>

        {tools.map((t, idx) => (
          <View key={idx} style={styles.card}>
            <View style={styles.cardTop}>
              <Text style={styles.cardTitle}>{t.title}</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{t.status}</Text>
              </View>
            </View>
            <Text style={styles.cardDesc}>{t.desc}</Text>
          </View>
        ))}

        <TouchableOpacity style={styles.webBtn} onPress={() => openWebFeature('/extreme-resilience')}>
          <Text style={styles.webBtnText}>Open Extreme Resilience Lab on Web ↗</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16 },
  heroBox: { backgroundColor: 'rgba(6, 182, 212, 0.12)', borderWidth: 1, borderColor: '#06b6d4', borderRadius: 10, padding: 14, marginBottom: 16 },
  heroTitle: { color: '#22d3ee', fontSize: 12, fontWeight: '800', marginBottom: 4 },
  heroSub: { color: COLORS.textSecondary, fontSize: 12, lineHeight: 17 },
  sectionHeader: { color: COLORS.textMuted, fontSize: 11, fontWeight: '800', letterSpacing: 1, marginBottom: 10 },
  card: { backgroundColor: COLORS.surface, padding: 14, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border, marginBottom: 10 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  cardTitle: { color: COLORS.textPrimary, fontSize: 13, fontWeight: '700', flex: 1 },
  badge: { backgroundColor: 'rgba(6, 182, 212, 0.2)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, borderWidth: 1, borderColor: '#06b6d4' },
  badgeText: { color: '#22d3ee', fontSize: 9, fontWeight: '800' },
  cardDesc: { color: COLORS.textSecondary, fontSize: 12, lineHeight: 16 },
  webBtn: { padding: 12, borderRadius: 8, borderWidth: 1, borderColor: COLORS.primary, alignItems: 'center', marginTop: 14 },
  webBtnText: { color: COLORS.primary, fontWeight: '700', fontSize: 12 },
});
