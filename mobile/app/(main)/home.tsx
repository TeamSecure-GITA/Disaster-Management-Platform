import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Header } from '../../components/navigation/Header';
import { SOSButton } from '../../components/emergency/SOSButton';
import { AlertCard } from '../../components/emergency/AlertCard';
import { RiskCard } from '../../components/risk/RiskCard';
import { useAlerts } from '../../hooks/useAlerts';
import { useRisk } from '../../hooks/useRisk';
import { useEmergencyStore } from '../../stores/emergency.store';
import { COLORS } from '../../constants/colors';
import { ROUTES } from '../../constants/routes';

export default function HomeScreen() {
  const router = useRouter();
  const { alerts, fetchAlerts } = useAlerts();
  const { predictions, fetchPredictions } = useRisk();
  const startCountdown = useEmergencyStore((s) => s.startCountdown);

  useEffect(() => {
    fetchAlerts();
    fetchPredictions();
  }, []);

  const handleSosPress = () => {
    startCountdown();
    router.push(ROUTES.MAIN.EMERGENCY.SOS as any);
  };

  return (
    <View style={styles.container}>
      <Header title="Disaster Sentinel Command" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.sosSection}>
          <SOSButton onPress={handleSosPress} size={150} />
          <Text style={styles.sosCaption}>PRESS TO BROADCAST URGENT GPS BEACON</Text>
        </View>

        <View style={styles.quickGrid}>
          <TouchableOpacity style={styles.gridBtn} onPress={() => router.push(ROUTES.MAIN.MAPS.LIVE as any)}>
            <Text style={styles.gridIcon}>🗺️</Text>
            <Text style={styles.gridLabel}>Live Hazard Map</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.gridBtn} onPress={() => router.push(ROUTES.MAIN.AI.CHAT as any)}>
            <Text style={styles.gridIcon}>🤖</Text>
            <Text style={styles.gridLabel}>AI Copilot</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.gridBtn} onPress={() => router.push(ROUTES.MAIN.SAFETY.SHELTERS as any)}>
            <Text style={styles.gridIcon}>🏕️</Text>
            <Text style={styles.gridLabel}>Safe Shelters</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.gridBtn} onPress={() => router.push(ROUTES.MAIN.INCIDENTS.REPORT as any)}>
            <Text style={styles.gridIcon}>🚨</Text>
            <Text style={styles.gridLabel}>Report Incident</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>ACTIVE EARLY WARNINGS</Text>
        {alerts.slice(0, 1).map((a) => (
          <AlertCard key={a.id} alert={a} />
        ))}

        <Text style={styles.sectionTitle}>GEOTECHNICAL HAZARD PROGNOSIS</Text>
        {predictions.slice(0, 1).map((p) => (
          <RiskCard key={p.id} prediction={p} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16 },
  sosSection: { alignItems: 'center', marginVertical: 16 },
  sosCaption: { color: COLORS.emergency, fontSize: 11, fontWeight: '800', marginTop: 12, letterSpacing: 0.5 },
  quickGrid: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 14 },
  gridBtn: { flex: 1, backgroundColor: COLORS.surface, padding: 12, borderRadius: 12, alignItems: 'center', marginHorizontal: 3, borderWidth: 1, borderColor: COLORS.border },
  gridIcon: { fontSize: 20, marginBottom: 4 },
  gridLabel: { color: COLORS.textPrimary, fontSize: 10, fontWeight: '700', textAlign: 'center' },
  sectionTitle: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '800', letterSpacing: 1, marginTop: 14, marginBottom: 8 },
});
