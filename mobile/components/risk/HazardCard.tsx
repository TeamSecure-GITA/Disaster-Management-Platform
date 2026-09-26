import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '../common/Card';
import { COLORS } from '../../constants/colors';

export const HazardCard: React.FC<{ title: string; severity: string; description: string }> = ({
  title,
  severity,
  description,
}) => (
  <Card style={styles.card}>
    <Text style={styles.title}>{title}</Text>
    <Text style={styles.severity}>Severity: {severity.toUpperCase()}</Text>
    <Text style={styles.desc}>{description}</Text>
  </Card>
);

const styles = StyleSheet.create({
  card: {
    marginBottom: 10,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  severity: {
    color: COLORS.warning,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  desc: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginTop: 4,
  },
});
