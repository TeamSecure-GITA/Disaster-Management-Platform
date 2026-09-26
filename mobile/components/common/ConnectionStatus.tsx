import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';
import { useConnectivityStore } from '../../stores/connectivity.store';

export const ConnectionStatus: React.FC = () => {
  const isOnline = useConnectivityStore((s) => s.isOnline);
  const color = isOnline ? COLORS.success : COLORS.warning;

  return (
    <View style={styles.row}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.label, { color }]}>{isOnline ? 'Online (REST/WS)' : 'LoRa Mesh Mode'}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
});
