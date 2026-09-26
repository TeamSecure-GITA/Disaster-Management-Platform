import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Header } from '../../../components/navigation/Header';
import { SOSCountdown } from '../../../components/emergency/SOSCountdown';
import { SOSStatus } from '../../../components/emergency/SOSStatus';
import { Button } from '../../../components/common/Button';
import { useEmergencyStore } from '../../../stores/emergency.store';
import { useLocation } from '../../../hooks/useLocation';
import { COLORS } from '../../../constants/colors';

export default function SOSScreen() {
  const { sosStatus, countdownSeconds, decrementCountdown, cancelSOS, triggerSOS } = useEmergencyStore();
  const { location } = useLocation();

  useEffect(() => {
    let timer: any;
    if (sosStatus === 'countdown' && countdownSeconds > 0) {
      timer = setTimeout(() => decrementCountdown(), 1000);
    } else if (sosStatus === 'countdown' && countdownSeconds === 0) {
      triggerSOS({
        sosId: `sos-${Date.now()}`,
        userId: 'usr-demo-1',
        coordinates: location,
        timestamp: new Date().toISOString(),
        batteryLevelPct: 88,
      });
    }
    return () => clearTimeout(timer);
  }, [sosStatus, countdownSeconds]);

  return (
    <View style={styles.container}>
      <Header title="Emergency Distress Beacon" showBack />
      <View style={styles.content}>
        {sosStatus === 'countdown' ? (
          <SOSCountdown secondsRemaining={countdownSeconds} onCancel={cancelSOS} />
        ) : (
          <View style={styles.activeBox}>
            <Text style={styles.title}>SOS ACTIVE</Text>
            <Text style={styles.sub}>Transmitting live coordinates over Cellular & LoRa Mesh Network.</Text>
            <Text style={styles.coords}>GPS: {location.latitude.toFixed(5)}°N, {location.longitude.toFixed(5)}°E</Text>
            <SOSStatus status={sosStatus} />
            <Button title="CANCEL ACTIVE BEACON" onPress={cancelSOS} variant="outline" style={{ marginTop: 24 }} />
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { flex: 1, padding: 20, justifyContent: 'center' },
  activeBox: { alignItems: 'center' },
  title: { fontSize: 28, fontWeight: '900', color: COLORS.emergency, marginBottom: 8 },
  sub: { color: COLORS.textSecondary, textAlign: 'center', marginBottom: 16 },
  coords: { color: COLORS.primary, fontWeight: '700', marginBottom: 20 },
});
