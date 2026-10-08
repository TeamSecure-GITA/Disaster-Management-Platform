import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { Header } from '../../../components/navigation/Header';
import { COLORS } from '../../../constants/colors';
import { openWebFeature } from '../../../utils/webPortal';

export default function AdministratorHubScreen() {
  const [threatLevel, setThreatLevel] = useState<'RED' | 'ORANGE' | 'YELLOW'>('ORANGE');
  const [broadcastMessage, setBroadcastMessage] = useState(
    'Emergency Evacuation Warning: Inundation threat elevated. Responders proceed to designated muster stations.'
  );
  const [dispatchSent, setDispatchSent] = useState(false);

  const handleSendBroadcast = () => {
    setDispatchSent(true);
    Alert.alert(
      '🚨 Regional Siren & Dispatch Transmitted',
      `Emergency command broadcast sent across regional siren arrays and citizen notification feeds with condition [${threatLevel}].`
    );
  };

  const threatLevels: Array<'RED' | 'ORANGE' | 'YELLOW'> = ['YELLOW', 'ORANGE', 'RED'];

  const getThreatColor = (t: 'RED' | 'ORANGE' | 'YELLOW') => {
    switch (t) {
      case 'RED': return COLORS.emergency;
      case 'ORANGE': return COLORS.warning;
      case 'YELLOW': return '#eab308';
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Administrator Command Hub" showBack />
      <ScrollView contentContainerStyle={styles.content}>
        {/* Clearance Card */}
        <View style={styles.clearanceCard}>
          <Text style={styles.clearanceTag}>🛡️ HIGH COMMAND SECURE CONSOLE</Text>
          <Text style={styles.clearanceTitle}>Operational Incident Commander</Text>
          <Text style={styles.clearanceSub}>
            Authorized for regional broadcast siren activation, escalation condition overrides, and field authorization approval.
          </Text>
        </View>

        {/* Threat Level Selector */}
        <Text style={styles.sectionTitle}>REGIONAL THREAT ESCALATION LEVEL</Text>
        <View style={styles.threatRow}>
          {threatLevels.map((lvl) => (
            <TouchableOpacity
              key={lvl}
              style={[
                styles.threatBtn,
                threatLevel === lvl && {
                  borderColor: getThreatColor(lvl),
                  backgroundColor: `${getThreatColor(lvl)}22`,
                },
              ]}
              onPress={() => setThreatLevel(lvl)}
            >
              <Text
                style={[
                  styles.threatText,
                  threatLevel === lvl && { color: getThreatColor(lvl), fontWeight: '900' },
                ]}
              >
                ● CONDITION {lvl}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Emergency Broadcast Section */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Emergency Siren & Notification Broadcast</Text>
          <Text style={styles.cardSub}>
            Transmits high-priority sound alarm and push alerts to all devices in the active regional radius.
          </Text>

          <Text style={styles.inputLabel}>Broadcast Dispatch Directive</Text>
          <TextInput
            style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
            multiline
            value={broadcastMessage}
            onChangeText={setBroadcastMessage}
            placeholder="Enter directive instructions for citizens and responders..."
            placeholderTextColor={COLORS.textMuted}
          />

          <TouchableOpacity style={styles.broadcastBtn} onPress={handleSendBroadcast}>
            <Text style={styles.broadcastBtnText}>🚨 TRANSMIT EMERGENCY BROADCAST</Text>
          </TouchableOpacity>
        </View>

        {/* Active Command KPIs */}
        <Text style={styles.sectionTitle}>FIELD OPERATOR TELEMETRY</Text>
        <View style={styles.kpiRow}>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiVal}>14</Text>
            <Text style={styles.kpiLbl}>Active Teams</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={[styles.kpiVal, { color: COLORS.warning }]}>48</Text>
            <Text style={styles.kpiLbl}>Citizen Tickets</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={[styles.kpiVal, { color: COLORS.success }]}>99.4%</Text>
            <Text style={styles.kpiLbl}>Mesh Uptime</Text>
          </View>
        </View>

        {/* Audit Log Snippet */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Recent Incident Audit Logs</Text>
          <View style={styles.logItem}>
            <Text style={styles.logTime}>10 mins ago</Text>
            <Text style={styles.logText}>District HQ verified Flash Flood Alert in Pasighat Ward 4</Text>
          </View>
          <View style={styles.logItem}>
            <Text style={styles.logTime}>24 mins ago</Text>
            <Text style={styles.logText}>Field Unit SDRF-02 confirmed safe evacuation of 42 residents</Text>
          </View>
          <View style={styles.logItem}>
            <Text style={styles.logTime}>1 hr ago</Text>
            <Text style={styles.logText}>LoRa Mesh gateway connected to Forward Aerial Base</Text>
          </View>
        </View>

        {/* Full Admin Console Web Launcher */}
        <TouchableOpacity
          style={styles.webBtn}
          onPress={() => openWebFeature('/administrator')}
        >
          <Text style={styles.webBtnText}>Open Full Administrator Hub & Ticket Console on Web ↗</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16, paddingBottom: 40 },
  clearanceCard: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1,
    borderColor: '#ef4444',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  clearanceTag: { color: '#ef4444', fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  clearanceTitle: { color: COLORS.textPrimary, fontSize: 15, fontWeight: '800', marginTop: 4, marginBottom: 4 },
  clearanceSub: { color: COLORS.textSecondary, fontSize: 11, lineHeight: 16 },
  sectionTitle: { color: COLORS.textMuted, fontSize: 11, fontWeight: '800', letterSpacing: 1, marginBottom: 10 },
  threatRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  threatBtn: {
    flex: 1,
    backgroundColor: COLORS.surface,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  threatText: { color: COLORS.textMuted, fontSize: 10, fontWeight: '700' },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    marginBottom: 16,
  },
  cardTitle: { color: COLORS.textPrimary, fontSize: 13, fontWeight: '700', marginBottom: 4 },
  cardSub: { color: COLORS.textSecondary, fontSize: 11, lineHeight: 16, marginBottom: 12 },
  inputLabel: { color: COLORS.textMuted, fontSize: 10, fontWeight: '700', marginBottom: 4 },
  input: {
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 10,
    color: COLORS.textPrimary,
    fontSize: 11,
    marginBottom: 12,
  },
  broadcastBtn: {
    backgroundColor: COLORS.emergency,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  broadcastBtnText: { color: '#FFF', fontSize: 11, fontWeight: '800' },
  kpiRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  kpiCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  kpiVal: { color: COLORS.primary, fontSize: 18, fontWeight: '800' },
  kpiLbl: { color: COLORS.textMuted, fontSize: 10, marginTop: 2 },
  logItem: { borderBottomWidth: 1, borderBottomColor: COLORS.border, paddingVertical: 8 },
  logTime: { color: COLORS.textMuted, fontSize: 9, fontWeight: '700' },
  logText: { color: COLORS.textSecondary, fontSize: 11, marginTop: 2 },
  webBtn: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.primary,
    alignItems: 'center',
    marginTop: 8,
  },
  webBtnText: { color: COLORS.primary, fontWeight: '700', fontSize: 12 },
});
