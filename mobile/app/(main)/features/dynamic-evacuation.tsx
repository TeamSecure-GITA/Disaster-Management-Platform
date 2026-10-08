import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Header } from '../../../components/navigation/Header';
import { COLORS } from '../../../constants/colors';
import { openWebFeature } from '../../../utils/webPortal';

export default function DynamicEvacuationScreen() {
  const [routes, setRoutes] = useState([
    { id: 'R1', name: 'Corridor Alpha (Northern Bypass)', congestion: '12% (LOW CONGESTION)', safetyScore: '98%', time: '14 Mins', rec: true },
    { id: 'R2', name: 'NH-27 Main Arterial Trunk', congestion: '89% (SEVERE HERD CHOKE)', safetyScore: '42%', time: '68 Mins (BLOCKED)', rec: false },
    { id: 'R3', name: 'River Ridge Secondary Ring', congestion: '24% (MODERATE FLOW)', safetyScore: '91%', time: '21 Mins', rec: false },
  ]);

  const selectRoute = (r: typeof routes[0]) => {
    Alert.alert('Evacuation Route Selected', `Dynamic GPS guiding navigation along ${r.name}. Avoiding panic choke-points.`);
  };

  return (
    <View style={styles.container}>
      <Header title="Anti-Herd Dynamic Evacuation" showBack />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heroBox}>
          <Text style={styles.heroTitle}>🏃 ANTI-HERD TRAFFIC LOAD BALANCING</Text>
          <Text style={styles.heroSub}>
            Autonomous routing algorithms that disperse evacuees across multiple arterial routes, preventing fatal stampedes and vehicle gridlocks.
          </Text>
        </View>

        <Text style={styles.sectionHeader}>CALCULATED EVACUATION VECTORS</Text>

        {routes.map((r) => (
          <TouchableOpacity
            key={r.id}
            style={[styles.routeCard, r.rec && styles.routeCardRec]}
            onPress={() => selectRoute(r)}
          >
            <View style={styles.cardTop}>
              <Text style={styles.routeName}>{r.name}</Text>
              {r.rec && (
                <View style={styles.recBadge}>
                  <Text style={styles.recBadgeText}>RECOMMENDED</Text>
                </View>
              )}
            </View>
            <View style={styles.statsRow}>
              <Text style={styles.statLbl}>Congestion: <Text style={r.rec ? styles.statGood : styles.statBad}>{r.congestion}</Text></Text>
              <Text style={styles.statLbl}>Safety: <Text style={styles.statBold}>{r.safetyScore}</Text></Text>
            </View>
            <View style={styles.bottomRow}>
              <Text style={styles.timeVal}>⏱️ {r.time}</Text>
              <Text style={styles.actionPrompt}>{r.rec ? 'TAP TO ENGAGE ROUTE ›' : 'CHOKE-POINT HAZARD ⚠️'}</Text>
            </View>
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={styles.webBtn} onPress={() => openWebFeature('/dynamic-evacuation')}>
          <Text style={styles.webBtnText}>Open Multi-Route Evacuation Map on Web ↗</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16 },
  heroBox: { backgroundColor: 'rgba(56, 189, 248, 0.12)', borderWidth: 1, borderColor: COLORS.primary, borderRadius: 10, padding: 14, marginBottom: 16 },
  heroTitle: { color: COLORS.primary, fontSize: 12, fontWeight: '800', marginBottom: 4 },
  heroSub: { color: COLORS.textSecondary, fontSize: 12, lineHeight: 17 },
  sectionHeader: { color: COLORS.textMuted, fontSize: 11, fontWeight: '800', letterSpacing: 1, marginBottom: 10 },
  routeCard: { backgroundColor: COLORS.surface, padding: 14, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border, marginBottom: 10 },
  routeCardRec: { borderColor: COLORS.primary, backgroundColor: COLORS.surfaceLight },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  routeName: { color: COLORS.textPrimary, fontSize: 13, fontWeight: '700', flex: 1 },
  recBadge: { backgroundColor: 'rgba(0, 240, 255, 0.2)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, borderWidth: 1, borderColor: COLORS.primary },
  recBadgeText: { color: COLORS.primary, fontSize: 9, fontWeight: '800' },
  statsRow: { marginBottom: 8 },
  statLbl: { color: COLORS.textMuted, fontSize: 11, marginBottom: 2 },
  statGood: { color: COLORS.success, fontWeight: '700' },
  statBad: { color: COLORS.emergency, fontWeight: '700' },
  statBold: { color: COLORS.textPrimary, fontWeight: '700' },
  bottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: COLORS.borderLight, paddingTop: 8 },
  timeVal: { color: COLORS.textPrimary, fontSize: 12, fontWeight: '800' },
  actionPrompt: { color: COLORS.primary, fontSize: 11, fontWeight: '700' },
  webBtn: { padding: 12, borderRadius: 8, borderWidth: 1, borderColor: COLORS.primary, alignItems: 'center', marginTop: 14 },
  webBtnText: { color: COLORS.primary, fontWeight: '700', fontSize: 12 },
});
