import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';

export const Loading: React.FC<{ message?: string }> = ({ message = 'Synchronizing real-time telemetry...' }) => (
  <View style={styles.container}>
    <ActivityIndicator size="large" color={COLORS.primary} />
    <Text style={styles.text}>{message}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  text: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginTop: 12,
  },
});
