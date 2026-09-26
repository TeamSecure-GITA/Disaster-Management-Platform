import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';

export const AIAssistant: React.FC = () => (
  <View style={styles.container}>
    <Text style={styles.title}>AI Disaster Copilot Active</Text>
    <Text style={styles.sub}>Ground truth recommendations & emergency protocols</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    padding: 12,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  title: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  sub: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
});
