import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LandslidePredictionData } from '../../types/risk';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { COLORS } from '../../constants/colors';

export const RiskCard: React.FC<{ prediction: LandslidePredictionData }> = ({ prediction }) => {
  const isCritical = prediction.riskLevel === 'CRITICAL' || prediction.factorOfSafety < 1.0;
  return (
    <Card variant={isCritical ? 'emergency' : 'default'} style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.region}>{prediction.location.region}</Text>
        <Badge label={prediction.riskLevel} variant={isCritical ? 'emergency' : 'warning'} />
      </View>
      <View style={styles.metrics}>
        <View style={styles.metric}>
          <Text style={styles.metricLabel}>Factor of Safety</Text>
          <Text style={[styles.metricVal, { color: prediction.factorOfSafety < 1.0 ? COLORS.emergency : COLORS.success }]}>
            {prediction.factorOfSafety.toFixed(2)}
          </Text>
        </View>
        <View style={styles.metric}>
          <Text style={styles.metricLabel}>Failure Probability</Text>
          <Text style={styles.metricVal}>{(prediction.probability * 100).toFixed(0)}%</Text>
        </View>
        <View style={styles.metric}>
          <Text style={styles.metricLabel}>24h Rainfall</Text>
          <Text style={styles.metricVal}>{prediction.rainfallPast24hMm} mm</Text>
        </View>
      </View>
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
    marginBottom: 12,
  },
  region: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
    marginRight: 8,
  },
  metrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metric: {
    alignItems: 'center',
  },
  metricLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginBottom: 2,
  },
  metricVal: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '800',
  },
});
