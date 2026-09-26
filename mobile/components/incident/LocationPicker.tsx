import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';
import { GeoCoordinates } from '../../types/location';

export const LocationPicker: React.FC<{ coordinates: GeoCoordinates }> = ({ coordinates }) => (
  <View style={styles.box}>
    <Text style={styles.label}>GPS Coordinate Tag:</Text>
    <Text style={styles.val}>{coordinates.latitude.toFixed(5)}° N, {coordinates.longitude.toFixed(5)}° E</Text>
  </View>
);

const styles = StyleSheet.create({
  box: {
    padding: 10,
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: 8,
    marginVertical: 6,
  },
  label: {
    color: COLORS.textMuted,
    fontSize: 11,
  },
  val: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
});
