import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';

export const RiskGauge: React.FC<{ scorePct: number }> = ({ scorePct }) => {
  const color = scorePct > 70 ? COLORS.emergency : scorePct > 40 ? COLORS.warning : COLORS.success;
  return (
    <View style={styles.container}>
      <Text style={[styles.pct, { color }]}>{scorePct}%</Text>
      <Text style={styles.label}>REGIONAL RISK PROBABILITY</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 12,
  },
  pct: {
    fontSize: 42,
    fontWeight: '900',
  },
  label: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
});
