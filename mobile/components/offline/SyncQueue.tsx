import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PendingSyncItem } from '../../types/offline';
import { SyncItem } from './SyncItem';
import { COLORS } from '../../constants/colors';

export const SyncQueue: React.FC<{ items: PendingSyncItem[] }> = ({ items }) => (
  <View style={styles.container}>
    <Text style={styles.title}>PENDING OFFLINE SYNC QUEUE ({items.length})</Text>
    {items.length === 0 ? (
      <Text style={styles.empty}>All local disaster reports & telemetry are synced.</Text>
    ) : (
      items.map((it) => <SyncItem key={it.id} item={it} />)
    )}
  </View>
);

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  title: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 6,
  },
  empty: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
});
