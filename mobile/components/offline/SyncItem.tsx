import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PendingSyncItem } from '../../types/offline';
import { COLORS } from '../../constants/colors';

export const SyncItem: React.FC<{ item: PendingSyncItem }> = ({ item }) => (
  <View style={styles.item}>
    <Text style={styles.action}>{item.action}</Text>
    <Text style={styles.time}>{new Date(item.createdAt).toLocaleTimeString()}</Text>
  </View>
);

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  action: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  time: {
    color: COLORS.textMuted,
    fontSize: 11,
  },
});
