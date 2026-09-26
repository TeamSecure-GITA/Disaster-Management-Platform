import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';

export const HazardLegend: React.FC = () => (
  <View style={styles.row}>
    <View style={[styles.dot, { backgroundColor: COLORS.emergency }]} />
    <Text style={styles.label}>Critical (&gt;75%)</Text>
    <View style={[styles.dot, { backgroundColor: COLORS.warning }]} />
    <Text style={styles.label}>Moderate</Text>
    <View style={[styles.dot, { backgroundColor: COLORS.success }]} />
    <Text style={styles.label}>Safe (&lt;35%)</Text>
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  label: {
    color: COLORS.textMuted,
    fontSize: 11,
  },
});
