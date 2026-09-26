import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '../common/Card';
import { COLORS } from '../../constants/colors';

export const OfflineAlertCard: React.FC<{ title: string; body: string }> = ({ title, body }) => (
  <Card style={styles.card}>
    <Text style={styles.badge}>CACHED OFFLINE ALERT</Text>
    <Text style={styles.title}>{title}</Text>
    <Text style={styles.body}>{body}</Text>
  </Card>
);

const styles = StyleSheet.create({
  card: {
    marginBottom: 8,
  },
  badge: {
    color: COLORS.warning,
    fontSize: 10,
    fontWeight: '800',
    marginBottom: 4,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  body: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
});
