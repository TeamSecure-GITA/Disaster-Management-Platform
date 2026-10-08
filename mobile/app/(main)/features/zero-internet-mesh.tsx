import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Header } from '../../../components/navigation/Header';
import { COLORS } from '../../../constants/colors';
import { openWebFeature } from '../../../utils/webPortal';

export default function ZeroInternetMeshScreen() {
  const [sosActive, setSosActive] = useState(false);
  const [peers] = useState([
    { id: 'P1', name: 'Nearby Responder (SDRF-04)', distance: '45m away', battery: '82%', hops: 1 },
    { id: 'P2', name: 'Citizen Device (Node-Alpha)', distance: '110m away', battery: '64%', hops: 1 },
    { id: 'P3', name: 'Relay Anchor (North Ridge)', distance: '280m away', battery: '95%', hops: 2 },
  ]);

  const handleSos = () => {
    setSosActive(true);
    Alert.alert('Zero-Internet SOS Dispatched', 'Distress beacon broadcasted to all local peer radios via Wi-Fi Direct and BLE mesh.');
  };

  return (
    <View style={styles.container}>
      <Header title="Zero-Internet P2P Protocol" showBack />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.modeCard}>
          <Text style={styles.modeTitle}>📶 OFF-GRID DIRECT COMMUNICATION</Text>
          <Text style={styles.modeSub}>
            Operating without cellular towers or internet. Messages hop securely across nearby responder smartphones using local peer-to-peer radio protocols.
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.sosBtn, sosActive && styles.sosBtnActive]}
          onPress={handleSos}
        >
          <Text style={styles.sosBtnText}>
            {sosActive ? '🚨 BEACON PULSING TO 3 PEERS' : '🆘 BROADCAST ZERO-INTERNET SOS'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.sectionHeader}>DISCOVERED PEER HARDWARE</Text>

        {peers.map((p) => (
          <View key={p.id} style={styles.peerCard}>
            <View style={styles.peerTop}>
              <Text style={styles.peerName}>{p.name}</Text>
              <Text style={styles.peerDist}>{p.distance}</Text>
            </View>
            <View style={styles.peerMeta}>
              <Text style={styles.metaText}>⚡ Battery: {p.battery}</Text>
              <Text style={styles.metaText}>🔄 Hop Count: {p.hops}</Text>
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.webBtn} onPress={() => openWebFeature('/zero-internet-mesh')}>
          <Text style={styles.webBtnText}>Open Web BroadcastChannel P2P Node ↗</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16 },
  modeCard: { backgroundColor: 'rgba(255, 184, 0, 0.12)', borderWidth: 1, borderColor: COLORS.warning, borderRadius: 10, padding: 14, marginBottom: 16 },
  modeTitle: { color: COLORS.warning, fontSize: 12, fontWeight: '800', marginBottom: 4 },
  modeSub: { color: COLORS.textSecondary, fontSize: 12, lineHeight: 17 },
  sosBtn: { backgroundColor: COLORS.emergency, padding: 14, borderRadius: 10, alignItems: 'center', marginBottom: 20 },
  sosBtnActive: { backgroundColor: '#8B0000' },
  sosBtnText: { color: '#FFF', fontWeight: '800', fontSize: 13, letterSpacing: 0.5 },
  sectionHeader: { color: COLORS.textMuted, fontSize: 11, fontWeight: '800', letterSpacing: 1, marginBottom: 10 },
  peerCard: { backgroundColor: COLORS.surface, padding: 12, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border, marginBottom: 8 },
  peerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  peerName: { color: COLORS.textPrimary, fontSize: 13, fontWeight: '700' },
  peerDist: { color: COLORS.primary, fontSize: 11, fontWeight: '700' },
  peerMeta: { flexDirection: 'row', justifyContent: 'space-between' },
  metaText: { color: COLORS.textMuted, fontSize: 11 },
  webBtn: { padding: 12, borderRadius: 8, borderWidth: 1, borderColor: COLORS.primary, alignItems: 'center', marginTop: 14 },
  webBtnText: { color: COLORS.primary, fontWeight: '700', fontSize: 12 },
});
