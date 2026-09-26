import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { DisasterAlert } from '../../types/alert';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { COLORS } from '../../constants/colors';

export const AlertCard: React.FC<{ alert: DisasterAlert }> = ({ alert }) => {
  const isCritical = alert.severity === 'CRITICAL' || alert.severity === 'EMERGENCY';
  return (
    <Card variant={isCritical ? 'emergency' : 'default'} style={styles.card}>
      <View style={styles.header}>
        <Badge label={alert.severity} variant={isCritical ? 'emergency' : 'warning'} />
        <Text style={styles.time}>{new Date(alert.issuedAt).toLocaleTimeString()}</Text>
      </View>
      <Text style={styles.title}>{alert.title}</Text>
      <Text style={styles.message}>{alert.message}</Text>
      {alert.actionInstructions.length > 0 && (
        <View style={styles.instructions}>
          {alert.actionInstructions.map((ins, i) => (
            <Text key={i} style={styles.insText}>• {ins}</Text>
          ))}
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  time: {
    color: COLORS.textMuted,
    fontSize: 11,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 6,
  },
  message: {
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  instructions: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  insText: {
    color: COLORS.textPrimary,
    fontSize: 12,
    marginBottom: 2,
  },
});
