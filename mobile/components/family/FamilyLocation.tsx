import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';

export const FamilyLocation: React.FC<{ text: string }> = ({ text }) => (
  <Text style={styles.text}>Location: {text}</Text>
);

const styles = StyleSheet.create({
  text: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
});
