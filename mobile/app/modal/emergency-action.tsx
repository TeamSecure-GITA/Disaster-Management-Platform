import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '../../components/common/Button';
import { COLORS } from '../../constants/colors';

export default function EmergencyActionModal() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Immediate Life-Saving Action</Text>
      <Text style={styles.desc}>Floodwaters approaching danger mark. Immediate evacuation required to Polo Grounds Shelter.</Text>
      <Button title="NAVIGATE SAFE EVACUATION CORRIDOR" onPress={() => router.back()} variant="emergency" style={{ marginBottom: 12 }} />
      <Button title="Dismiss" onPress={() => router.back()} variant="outline" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surface, padding: 24, justifyContent: 'center' },
  title: { fontSize: 18, fontWeight: '800', color: COLORS.emergency, marginBottom: 10 },
  desc: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 18, marginBottom: 20 },
});
