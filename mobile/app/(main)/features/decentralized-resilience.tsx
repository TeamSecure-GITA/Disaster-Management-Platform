import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Header } from '../../../components/navigation/Header';
import { COLORS } from '../../../constants/colors';
import { openWebFeature } from '../../../utils/webPortal';

export default function DecentralizedResilienceScreen() {
  const modules = [
    { name: 'Ultrasonic Near-Field Mesh Relay', desc: 'Emits 18-20 kHz inaudible acoustic chirp pulses across rubble gaps where RF signals fail.', status: 'TRANSMITTER READY' },
    { name: 'Radio Direction Finding Triangulation', desc: 'Combines multiple responder signal strengths to triangulate emergency beacon locations.', status: '3 ANCHORS LOCKED' },
    { name: 'Decentralized IPFS Disaster Mirror', desc: 'P2P distributed filesystem storing crisis maps, survivor IDs and offline medical manifests.', status: 'MIRROR SYNCED' },
    { name: 'Dynamic Triage Heatmap Engine', desc: 'Real-time clustering of verified casualties, medical urgency and evacuation priorities.', status: 'ONLINE' },
  ];

  return (
    <View style={styles.container}>
      <Header title="Decentralized SAR Resilience" showBack />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heroBox}>
          <Text style={styles.heroTitle}>📡 ZERO-INFRASTRUCTURE RESILIENCE</Text>
          <Text style={styles.heroSub}>
            Decentralized search and rescue toolchain built to operate when all towers, power grids and satellite links are down.
          </Text>
        </View>

        <Text style={styles.sectionHeader}>DECENTRALIZED RESILIENCE PROTOCOLS</Text>

        {modules.map((m, idx) => (
          <View key={idx} style={styles.card}>
            <View style={styles.cardTop}>
              <Text style={styles.cardTitle}>{m.name}</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{m.status}</Text>
              </View>
            </View>
            <Text style={styles.cardDesc}>{m.desc}</Text>
          </View>
        ))}

        <TouchableOpacity style={styles.webBtn} onPress={() => openWebFeature('/decentralized-resilience')}>
          <Text style={styles.webBtnText}>Open Full Decentralized SAR Suite on Web ↗</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16 },
  heroBox: { backgroundColor: 'rgba(236, 72, 153, 0.12)', borderWidth: 1, borderColor: '#ec4899', borderRadius: 10, padding: 14, marginBottom: 16 },
  heroTitle: { color: '#f472b6', fontSize: 12, fontWeight: '800', marginBottom: 4 },
  heroSub: { color: COLORS.textSecondary, fontSize: 12, lineHeight: 17 },
  sectionHeader: { color: COLORS.textMuted, fontSize: 11, fontWeight: '800', letterSpacing: 1, marginBottom: 10 },
  card: { backgroundColor: COLORS.surface, padding: 14, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border, marginBottom: 10 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  cardTitle: { color: COLORS.textPrimary, fontSize: 13, fontWeight: '700', flex: 1 },
  badge: { backgroundColor: 'rgba(236, 72, 153, 0.2)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, borderWidth: 1, borderColor: '#ec4899' },
  badgeText: { color: '#f472b6', fontSize: 9, fontWeight: '800' },
  cardDesc: { color: COLORS.textSecondary, fontSize: 12, lineHeight: 16 },
  webBtn: { padding: 12, borderRadius: 8, borderWidth: 1, borderColor: COLORS.primary, alignItems: 'center', marginTop: 14 },
  webBtnText: { color: COLORS.primary, fontWeight: '700', fontSize: 12 },
});
