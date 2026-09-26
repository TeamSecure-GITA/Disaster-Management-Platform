import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';

export const UserLocation: React.FC<{ label?: string }> = ({ label = 'Your Current GPS Fix' }) => (
  <View style={styles.container}>
    <View style={styles.pulse} />
    <Text style={styles.label}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 6,
    backgroundColor: 'rgba(0, 240, 255, 0.12)',
    borderRadius: 6,
  },
  pulse: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
    marginRight: 6,
  },
  label: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '700',
  },
});
