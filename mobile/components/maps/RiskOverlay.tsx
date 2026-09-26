import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';

export const RiskOverlay: React.FC = () => (
  <View style={styles.overlay}>
    <Text style={styles.text}>ZONED HAZARD PERIMETER</Text>
  </View>
);

const styles = StyleSheet.create({
  overlay: {
    borderWidth: 2,
    borderColor: COLORS.emergency,
    borderStyle: 'dashed',
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 42, 85, 0.08)',
  },
  text: {
    color: COLORS.emergency,
    fontSize: 10,
    fontWeight: '800',
  },
});
