import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { IncidentReport } from '../../types/incident';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { COLORS } from '../../constants/colors';

export const IncidentCard: React.FC<{ incident: IncidentReport }> = ({ incident }) => (
  <Card style={styles.card}>
    <View style={styles.header}>
      <Text style={styles.title}>{incident.title}</Text>
      <Badge label={incident.severity} variant={incident.severity === 'critical' || incident.severity === 'high' ? 'emergency' : 'warning'} />
    </View>
    <Text style={styles.desc}>{incident.description}</Text>
    <View style={styles.footer}>
      <Text style={styles.time}>{new Date(incident.reportedAt).toLocaleTimeString()}</Text>
      <Text style={styles.status}>Status: {incident.status.toUpperCase()}</Text>
    </View>
  </Card>
);

const styles = StyleSheet.create({
  card: {
    marginBottom: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
    marginRight: 8,
  },
  desc: {
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 6,
  },
  time: {
    color: COLORS.textMuted,
    fontSize: 11,
  },
  status: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '700',
  },
});
