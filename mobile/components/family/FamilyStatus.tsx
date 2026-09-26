import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';

export const FamilyStatus: React.FC<{ status: string }> = ({ status }) => (
  <Text style={styles.text}>Safety Status: {status}</Text>
);

const styles = StyleSheet.create({
  text: {
    color: COLORS.success,
    fontSize: 12,
    fontWeight: '700',
  },
});
