import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '../../components/common/Button';
import { COLORS } from '../../constants/colors';

export default function ReportPreviewModal() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verify Incident Details</Text>
      <Text style={styles.desc}>Ensure photos and hazard details accurately reflect ground conditions before broadcast.</Text>
      <Button title="SUBMIT REPORT" onPress={() => router.back()} variant="primary" style={{ marginBottom: 12 }} />
      <Button title="Edit Report" onPress={() => router.back()} variant="outline" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surface, padding: 24, justifyContent: 'center' },
  title: { fontSize: 18, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 10 },
  desc: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 18, marginBottom: 20 },
});
