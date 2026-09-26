import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { EmergencyServiceItem } from '../../types/emergency';
import { Card } from '../common/Card';
import { EmergencyUtils } from '../../utils/emergency';
import { COLORS } from '../../constants/colors';

export const EmergencyServiceCard: React.FC<{ service: EmergencyServiceItem }> = ({ service }) => (
  <Card style={styles.card}>
    <View style={styles.info}>
      <Text style={styles.name}>{service.name}</Text>
      <Text style={styles.number}>DIAL {service.number} (24x7 Toll-Free)</Text>
    </View>
    <TouchableOpacity onPress={() => EmergencyUtils.callNumber(service.number)} style={styles.btn}>
      <Text style={styles.btnText}>DIAL {service.number}</Text>
    </TouchableOpacity>
  </Card>
);

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  info: {
    flex: 1,
  },
  name: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  number: {
    color: COLORS.primary,
    fontSize: 12,
    marginTop: 2,
    fontWeight: '600',
  },
  btn: {
    backgroundColor: COLORS.surfaceElevated,
    borderColor: COLORS.primary,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  btnText: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 12,
  },
});
