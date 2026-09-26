import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';

export const ShelterSafety: React.FC<{ rating?: string }> = ({ rating = 'Grade A (Reinforced Masonry)' }) => (
  <View style={styles.row}>
    <Text style={styles.label}>Structural Safety Rating: </Text>
    <Text style={styles.val}>{rating}</Text>
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    marginTop: 4,
  },
  label: {
    color: COLORS.textMuted,
    fontSize: 11,
  },
  val: {
    color: COLORS.success,
    fontSize: 11,
    fontWeight: '700',
  },
});
