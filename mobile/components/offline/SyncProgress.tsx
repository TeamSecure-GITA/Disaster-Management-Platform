import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { COLORS } from '../../constants/colors';

export const SyncProgress: React.FC<{ isSyncing: boolean }> = ({ isSyncing }) => {
  if (!isSyncing) return null;
  return (
    <View style={styles.row}>
      <ActivityIndicator size="small" color={COLORS.primary} />
      <Text style={styles.text}>Syncing local records with command cloud...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    gap: 8,
  },
  text: {
    color: COLORS.primary,
    fontSize: 12,
  },
});
