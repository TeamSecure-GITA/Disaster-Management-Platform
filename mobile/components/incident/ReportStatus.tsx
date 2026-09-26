import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';

export const ReportStatus: React.FC<{ status: string }> = ({ status }) => (
  <View style={styles.box}>
    <Text style={styles.text}>Report Verification: {status.toUpperCase()}</Text>
  </View>
);

const styles = StyleSheet.create({
  box: {
    padding: 6,
    borderRadius: 4,
    backgroundColor: COLORS.surfaceElevated,
  },
  text: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '700',
  },
});
