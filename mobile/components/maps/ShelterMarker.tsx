import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';

export const ShelterMarker: React.FC<{ name: string; capacityPct: number }> = ({ name, capacityPct }) => (
  <View style={styles.marker}>
    <Text style={styles.icon}>🏕️</Text>
    <Text style={styles.text}>{name} ({capacityPct}%)</Text>
  </View>
);

const styles = StyleSheet.create({
  marker: {
    backgroundColor: COLORS.success,
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
    color: '#090D16',
    fontSize: 11,
    fontWeight: '800',
  },
});
