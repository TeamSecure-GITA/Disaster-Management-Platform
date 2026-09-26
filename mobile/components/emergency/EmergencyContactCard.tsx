import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { EmergencyContact } from '../../types/user';
import { Card } from '../common/Card';
import { EmergencyUtils } from '../../utils/emergency';
import { COLORS } from '../../constants/colors';

export const EmergencyContactCard: React.FC<{ contact: EmergencyContact }> = ({ contact }) => (
  <Card style={styles.card}>
    <View style={styles.info}>
      <Text style={styles.name}>{contact.name}</Text>
      <Text style={styles.relation}>{contact.relationship} • {contact.phone}</Text>
    </View>
    <TouchableOpacity onPress={() => EmergencyUtils.callNumber(contact.phone)} style={styles.callBtn}>
      <Text style={styles.callText}>📞 CALL</Text>
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
  relation: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  callBtn: {
    backgroundColor: COLORS.emergency,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  callText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 12,
  },
});
