import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Header } from '../../../components/navigation/Header';
import { COLORS } from '../../../constants/colors';
import { openWebFeature } from '../../../utils/webPortal';

export default function MeshConsoleScreen() {
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [logs, setLogs] = useState([
    { id: 'L1', time: '14:22:01', node: 'NODE-0x4A (Relay 1)', rssi: '-78 dBm', snr: '+8.2 dB', payload: 'HEARTBEAT: ALL SECTORS NOMINAL' },
    { id: 'L2', time: '14:21:40', node: 'NODE-0x2B (Beacon)', rssi: '-84 dBm', snr: '+6.1 dB', payload: 'GPS BEACON: 26.173,91.731' },
    { id: 'L3', time: '14:20:15', node: 'GATEWAY-ROOT (HQ)', rssi: '-65 dBm', snr: '+11.4 dB', payload: 'ACK MESH SYNC: 14 NODES ACTIVE' },
  ]);

  const handleSend = () => {
    if (!broadcastMsg.trim()) return;
    const newLog = {
      id: Date.now().toString(),
      time: new Date().toLocaleTimeString(),
      node: 'LOCAL-PHONE (LoRa UART)',
      rssi: '-70 dBm',
      snr: '+9.0 dB',
      payload: broadcastMsg.trim(),
    };
    setLogs([newLog, ...logs]);
    setBroadcastMsg('');
    Alert.alert('LoRa Broadcast Sent', 'Packet dispatched over 433MHz / 868MHz mesh frequency.');
  };

  return (
    <View style={styles.container}>
      <Header title="LoRa Mesh Hardware Console" showBack />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.meshStats}>
          <View style={styles.meshStatBox}>
            <Text style={styles.statVal}>14</Text>
            <Text style={styles.statLbl}>Active Nodes</Text>
          </View>
          <View style={styles.meshStatBox}>
            <Text style={[styles.statVal, { color: COLORS.success }]}>99.4%</Text>
            <Text style={styles.statLbl}>Delivery Rate</Text>
          </View>
          <View style={styles.meshStatBox}>
            <Text style={[styles.statVal, { color: COLORS.primary }]}>3 Hops</Text>
            <Text style={styles.statLbl}>Max Depth</Text>
          </View>
        </View>

        <Text style={styles.sectionHeader}>BROADCAST PACKET OVER MESH</Text>
        <View style={styles.sendBox}>
          <TextInput
            style={styles.input}
            placeholder="Type emergency packet or text command..."
            placeholderTextColor={COLORS.textMuted}
            value={broadcastMsg}
            onChangeText={setBroadcastMsg}
          />
          <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
            <Text style={styles.sendBtnText}>TX PACKET</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionHeader}>LIVE MESH PACKET STREAM</Text>
        {logs.map((log) => (
          <View key={log.id} style={styles.packetCard}>
            <View style={styles.packetHeader}>
              <Text style={styles.nodeText}>{log.node}</Text>
              <Text style={styles.timeText}>{log.time}</Text>
            </View>
            <Text style={styles.payloadText}>{log.payload}</Text>
            <View style={styles.rfMetrics}>
              <Text style={styles.rfText}>RSSI: {log.rssi}</Text>
              <Text style={styles.rfText}>SNR: {log.snr}</Text>
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.webBtn} onPress={() => openWebFeature('/mesh-console')}>
          <Text style={styles.webBtnText}>Open Full LoRa Topology Console on Web ↗</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16 },
  meshStats: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  meshStatBox: { flex: 1, backgroundColor: COLORS.surface, padding: 12, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center' },
  statVal: { fontSize: 18, fontWeight: '800', color: COLORS.primary },
  statLbl: { fontSize: 10, color: COLORS.textMuted, marginTop: 4, fontWeight: '600' },
  sectionHeader: { color: COLORS.textMuted, fontSize: 11, fontWeight: '800', letterSpacing: 1, marginBottom: 8 },
  sendBox: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  input: { flex: 1, backgroundColor: COLORS.surface, borderRadius: 8, paddingHorizontal: 12, color: COLORS.textPrimary, borderWidth: 1, borderColor: COLORS.border, fontSize: 13 },
  sendBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 16, borderRadius: 8, justifyContent: 'center' },
  sendBtnText: { color: COLORS.textInverse, fontWeight: '800', fontSize: 12 },
  packetCard: { backgroundColor: COLORS.surface, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: COLORS.border, marginBottom: 8 },
  packetHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  nodeText: { color: COLORS.primary, fontSize: 12, fontWeight: '700' },
  timeText: { color: COLORS.textMuted, fontSize: 10 },
  payloadText: { color: COLORS.textPrimary, fontSize: 12, fontFamily: 'monospace', marginBottom: 6 },
  rfMetrics: { flexDirection: 'row', gap: 12 },
  rfText: { color: COLORS.textSecondary, fontSize: 10 },
  webBtn: { padding: 12, borderRadius: 8, borderWidth: 1, borderColor: COLORS.primary, alignItems: 'center', marginTop: 14 },
  webBtnText: { color: COLORS.primary, fontWeight: '700', fontSize: 12 },
});
