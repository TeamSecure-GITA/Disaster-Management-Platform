import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Header } from '../../../components/navigation/Header';
import { Button } from '../../../components/common/Button';
import { useOffline } from '../../../hooks/useOffline';
import { COLORS } from '../../../constants/colors';

export default function SyncStatusScreen() {
  const { status, syncNow } = useOffline();
  return (
    <View style={styles.container}>
      <Header title="Offline & LoRa Mesh Synchronization" />
      <View style={styles.content}>
        <Text style={styles.text}>Pending records in queue: {status.pendingCount}</Text>
        <Text style={styles.sub}>Last sync: {status.lastSyncAt ? new Date(status.lastSyncAt).toLocaleTimeString() : 'Never'}</Text>
        <Button title="SYNC WITH COMMAND CLOUD" onPress={syncNow} loading={status.isSyncing} style={{ marginTop: 20 }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 20 },
  text: { color: COLORS.textPrimary, fontSize: 16, fontWeight: '700' },
  sub: { color: COLORS.textSecondary, fontSize: 13, marginTop: 4 },
});
