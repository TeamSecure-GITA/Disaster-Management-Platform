import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';

export const RiskIndicator: React.FC<{ level: string }> = ({ level }) => {
  const isHigh = level === 'CRITICAL' || level === 'HIGH';
  return (
    <View style={[styles.indicator, { backgroundColor: isHigh ? COLORS.emergency : COLORS.success }]}>
      <Text style={styles.text}>{level}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  indicator: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  text: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '800',
  },
});
