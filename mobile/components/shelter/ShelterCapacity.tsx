import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';

export const ShelterCapacity: React.FC<{ current: number; max: number }> = ({ current, max }) => {
  const pct = Math.min(100, Math.round((current / max) * 100));
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Capacity Utilization: {pct}% ({current}/{max})</Text>
      <View style={styles.bar}>
        <View style={[styles.fill, { width: `${pct}%`, backgroundColor: pct > 85 ? COLORS.emergency : COLORS.success }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
  },
  label: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginBottom: 2,
  },
  bar: {
    height: 6,
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: 3,
    overflow: 'hidden',
  },
  fill: {
    height: 6,
  },
});
