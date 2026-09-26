import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { EmergencyShelter } from '../../types/shelter';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { COLORS } from '../../constants/colors';

export const ShelterCard: React.FC<{ shelter: EmergencyShelter; onSelect?: () => void }> = ({ shelter, onSelect }) => {
  const occPct = Math.round((shelter.currentOccupancy / shelter.capacity) * 100);
  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.name}>{shelter.name}</Text>
        <Badge label={shelter.status} variant={shelter.status === 'OPEN' ? 'success' : 'warning'} />
      </View>
      <Text style={styles.address}>{shelter.address}</Text>
      <View style={styles.stats}>
        <Text style={styles.stat}>Occupancy: {shelter.currentOccupancy}/{shelter.capacity} ({occPct}%)</Text>
        <Text style={styles.stat}>{shelter.hasMedicalPost ? '🩺 Medical' : ''} {shelter.hasCleanWater ? '💧 Water' : ''}</Text>
      </View>
      {onSelect && (
        <TouchableOpacity onPress={onSelect} style={styles.btn}>
          <Text style={styles.btnText}>VIEW EVACUATION DETAILS ›</Text>
        </TouchableOpacity>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
    marginRight: 8,
  },
  address: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginBottom: 8,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  stat: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  btn: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  btnText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'right',
  },
});
