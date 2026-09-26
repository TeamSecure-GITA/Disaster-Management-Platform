import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';

export const IncidentMarker: React.FC<{ title: string }> = ({ title }) => (
  <View style={styles.marker}>
    <Text style={styles.text}>🚨 {title}</Text>
  </View>
);

const styles = StyleSheet.create({
  marker: {
    backgroundColor: COLORS.warning,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  text: {
    color: '#090D16',
    fontSize: 11,
    fontWeight: '800',
  },
});
