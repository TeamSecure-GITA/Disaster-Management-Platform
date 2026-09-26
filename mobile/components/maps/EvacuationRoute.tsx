import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { EvacuationRouteData } from '../../types/map';
import { Card } from '../common/Card';
import { COLORS } from '../../constants/colors';

export const EvacuationRoute: React.FC<{ route: EvacuationRouteData }> = ({ route }) => (
  <Card style={styles.card}>
    <Text style={styles.name}>{route.name}</Text>
    <Text style={styles.meta}>{route.distanceKm} km • Est. {route.estimatedTravelMinutes} mins</Text>
    <Text style={styles.rating}>Clearance: {route.hazardClearanceRating}</Text>
  </Card>
);

const styles = StyleSheet.create({
  card: {
    marginBottom: 8,
  },
  name: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  meta: {
    color: COLORS.primary,
    fontSize: 12,
    marginTop: 2,
  },
  rating: {
    color: COLORS.success,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 4,
  },
});
