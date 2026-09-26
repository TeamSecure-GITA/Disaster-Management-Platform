import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '../../components/common/Button';
import { COLORS } from '../../constants/colors';

export default function LocationPermissionModal() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Location Permission Required</Text>
      <Text style={styles.desc}>Disaster Sentinel needs high-precision GPS to compute geotechnical slope failure distances and route you away from active hazard zones.</Text>
      <Button title="GRANT GPS ACCESS" onPress={() => router.back()} style={{ marginBottom: 12 }} />
      <Button title="Not Now" onPress={() => router.back()} variant="secondary" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surface, padding: 24, justifyContent: 'center' },
  title: { fontSize: 18, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 10 },
  desc: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 18, marginBottom: 20 },
});
