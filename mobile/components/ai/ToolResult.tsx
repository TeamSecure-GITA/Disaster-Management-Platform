import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';

export const ToolResult: React.FC<{ toolName: string; data: any }> = ({ toolName, data }) => (
  <View style={styles.container}>
    <Text style={styles.title}>TOOL TELEMETRY: {toolName.toUpperCase()}</Text>
    <Text style={styles.raw}>{JSON.stringify(data, null, 2)}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0F172A',
    padding: 8,
    borderRadius: 6,
    marginVertical: 4,
  },
  title: {
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: '700',
  },
  raw: {
    color: COLORS.textMuted,
    fontSize: 10,
  },
});
