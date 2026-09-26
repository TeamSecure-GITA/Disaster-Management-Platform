import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';

export const ShelterStatus: React.FC<{ status: string }> = ({ status }) => (
  <View style={styles.badge}>
    <Text style={styles.text}>{status}</Text>
  </View>
);

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    backgroundColor: COLORS.surfaceElevated,
  },
  text: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '700',
  },
});
