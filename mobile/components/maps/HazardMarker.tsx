import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';

export const HazardMarker: React.FC<{ type: string; severity: string }> = ({ type, severity }) => (
  <View style={styles.marker}>
    <Text style={styles.icon}>⚠️</Text>
    <Text style={styles.text}>{type}</Text>
  </View>
);

const styles = StyleSheet.create({
  marker: {
    backgroundColor: COLORS.emergency,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    fontSize: 12,
    marginRight: 4,
  },
  text: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '800',
  },
});
