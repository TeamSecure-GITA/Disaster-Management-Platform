import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '../../components/common/Button';
import { COLORS } from '../../constants/colors';

export default function SOSConfirmationModal() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Confirm Emergency Distress Beacon</Text>
      <Text style={styles.desc}>This will dispatch immediate alerts to nearest NDRF/SDRF teams and transmit your coordinates.</Text>
      <Button title="TRIGGER IMMEDIATE SOS" onPress={() => router.back()} variant="emergency" style={{ marginBottom: 12 }} />
      <Button title="Cancel" onPress={() => router.back()} variant="outline" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surface, padding: 24, justifyContent: 'center' },
  title: { fontSize: 20, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 12 },
  desc: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 20, marginBottom: 24 },
});
