import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Header } from '../../../components/navigation/Header';
import { COLORS } from '../../../constants/colors';
import { openWebFeature } from '../../../utils/webPortal';

export default function LowBandwidthScreen() {
  return (
    <View style={styles.container}>
      <Header title="Ultra-Low 2G Emergency Portal" showBack />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.terminalBox}>
          <Text style={styles.termTitle}>[DISASTER SENTINEL 2G RAW TELEMETRY FEED]</Text>
          <Text style={styles.termLine}>BANDWIDTH PROFILE: 9.6 KBPS COMPATIBLE</Text>
          <Text style={styles.termLine}>IMAGES & MEDIA: STRIPPED</Text>
          <Text style={styles.termLine}>LAST REFRESH: 14:25:00 UTC</Text>
          <Text style={styles.termDivider}>----------------------------------------</Text>
          <Text style={styles.alertLine}>[CRITICAL] CYCLONE HIGH SQUALL ADVISORY</Text>
          <Text style={styles.alertDetail}>Wind speeds 75-85 km/h. Coastal areas shelter immediately.</Text>
          <Text style={styles.termDivider}>----------------------------------------</Text>
          <Text style={styles.alertLine}>[EVACUATION] ROUTE NH-27 CLEARANCE</Text>
          <Text style={styles.alertDetail}>Bypass Km 14 to Km 22. Safe shelter open at District Stadium.</Text>
          <Text style={styles.termDivider}>----------------------------------------</Text>
          <Text style={styles.alertLine}>[EMERGENCY HELPLINES]</Text>
          <Text style={styles.alertDetail}>NDRF: 1078 | SDRF: 1070 | Ambulance: 108 | Police: 112</Text>
        </View>

        <TouchableOpacity style={styles.webBtn} onPress={() => openWebFeature('/low-bandwidth')}>
          <Text style={styles.webBtnText}>Open Ultra-Low 2G Web Portal on Browser ↗</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  content: { padding: 16 },
  terminalBox: { backgroundColor: '#050a0f', borderWidth: 1, borderColor: '#1e293b', borderRadius: 8, padding: 14, marginBottom: 16 },
  termTitle: { color: '#00FF66', fontSize: 12, fontWeight: '800', fontFamily: 'monospace', marginBottom: 6 },
  termLine: { color: '#94a3b8', fontSize: 11, fontFamily: 'monospace', marginBottom: 2 },
  termDivider: { color: '#334155', fontFamily: 'monospace', marginVertical: 6 },
  alertLine: { color: '#FF3366', fontSize: 12, fontWeight: '800', fontFamily: 'monospace', marginBottom: 2 },
  alertDetail: { color: '#e2e8f0', fontSize: 11, fontFamily: 'monospace', marginBottom: 4 },
  webBtn: { padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#00FF66', alignItems: 'center', marginTop: 10 },
  webBtnText: { color: '#00FF66', fontWeight: '700', fontSize: 12, fontFamily: 'monospace' },
});
