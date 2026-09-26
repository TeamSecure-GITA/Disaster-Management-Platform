import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';
import { Button } from './Button';

interface ErrorViewProps {
  message?: string;
  onRetry?: () => void;
}

export const ErrorView: React.FC<ErrorViewProps> = ({ message = 'Failed to load telemetry', onRetry }) => (
  <View style={styles.container}>
    <Text style={styles.icon}>⚠️</Text>
    <Text style={styles.text}>{message}</Text>
    {onRetry && <Button title="Retry Now" onPress={onRetry} variant="secondary" style={styles.btn} />}
  </View>
);

const styles = StyleSheet.create({
  container: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 32,
    marginBottom: 8,
  },
  text: {
    color: COLORS.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  btn: {
    minWidth: 140,
  },
});
