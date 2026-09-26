import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';

export const ConfidenceIndicator: React.FC<{ confidencePct: number }> = ({ confidencePct }) => (
  <View style={styles.row}>
    <Text style={styles.label}>Model Calibrated Confidence:</Text>
    <Text style={styles.val}>{confidencePct}%</Text>
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  label: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginRight: 6,
  },
  val: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '700',
  },
});
