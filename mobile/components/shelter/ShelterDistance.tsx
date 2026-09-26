import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';

export const ShelterDistance: React.FC<{ distanceKm: number }> = ({ distanceKm }) => (
  <Text style={styles.text}>📍 {distanceKm.toFixed(1)} km away</Text>
);

const styles = StyleSheet.create({
  text: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '700',
  },
});
