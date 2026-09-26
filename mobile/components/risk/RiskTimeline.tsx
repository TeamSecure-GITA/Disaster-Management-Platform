import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ForecastPointItem } from '../../types/risk';
import { COLORS } from '../../constants/colors';

export const RiskTimeline: React.FC<{ points: ForecastPointItem[] }> = ({ points }) => (
  <View style={styles.container}>
    <Text style={styles.title}>24-HOUR PROGRESSIVE RISK TIMELINE</Text>
    <View style={styles.list}>
      {points.slice(0, 6).map((p, i) => (
        <View key={i} style={styles.point}>
          <Text style={styles.time}>{new Date(p.timestamp).getHours()}:00</Text>
          <Text style={styles.prob}>{(p.predictedProbability * 100).toFixed(0)}%</Text>
          <Text style={styles.rain}>{p.rainfallForecastMm}mm</Text>
        </View>
      ))}
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  title: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
  },
  list: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  point: {
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  time: {
    color: COLORS.textMuted,
    fontSize: 10,
  },
  prob: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '800',
    marginVertical: 2,
  },
  rain: {
    color: COLORS.textSecondary,
    fontSize: 10,
  },
});
