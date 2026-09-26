import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';
import { SOSStatusType } from '../../types/emergency';

export const SOSStatus: React.FC<{ status: SOSStatusType }> = ({ status }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>SOS DISPATCH STATUS:</Text>
      <Text style={[styles.status, status === 'acknowledged' ? styles.active : styles.idle]}>
        {status.toUpperCase()}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: 8,
  },
  label: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '700',
    marginRight: 8,
  },
  status: {
    fontSize: 13,
    fontWeight: '800',
  },
  active: {
    color: COLORS.emergency,
  },
  idle: {
    color: COLORS.textSecondary,
  },
});
