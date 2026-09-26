import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';

export const FamilyAlert: React.FC<{ alertText: string }> = ({ alertText }) => (
  <View style={styles.alert}>
    <Text style={styles.text}>⚠️ {alertText}</Text>
  </View>
);

const styles = StyleSheet.create({
  alert: {
    backgroundColor: COLORS.emergencyBg,
    padding: 8,
    borderRadius: 6,
    marginVertical: 4,
  },
  text: {
    color: COLORS.emergency,
    fontSize: 12,
    fontWeight: '700',
  },
});
