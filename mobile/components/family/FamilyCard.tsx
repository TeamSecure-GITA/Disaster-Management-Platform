import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FamilyCircleMember } from '../../types/family';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { COLORS } from '../../constants/colors';

export const FamilyCard: React.FC<{ member: FamilyCircleMember }> = ({ member }) => (
  <Card style={styles.card}>
    <View style={styles.row}>
      <View>
        <Text style={styles.name}>{member.fullName} ({member.relation})</Text>
        <Text style={styles.phone}>{member.phone}</Text>
      </View>
      <Badge
        label={member.safetyStatus}
        variant={member.safetyStatus === 'SAFE' ? 'success' : 'emergency'}
      />
    </View>
    {member.lastKnownCoordinates && (
      <Text style={styles.loc}>
        📍 Last known: {member.lastKnownCoordinates.latitude.toFixed(4)}°N, {member.lastKnownCoordinates.longitude.toFixed(4)}°E
      </Text>
    )}
  </Card>
);

const styles = StyleSheet.create({
  card: {
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  phone: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
  loc: {
    color: COLORS.primary,
    fontSize: 11,
    marginTop: 6,
  },
});
