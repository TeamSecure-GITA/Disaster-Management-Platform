import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';
import { useConnectivityStore } from '../../stores/connectivity.store';

export const OfflineBanner: React.FC = () => {
  const isOnline = useConnectivityStore((s) => s.isOnline);
  if (isOnline) return null;

  return (
    <View style={styles.banner}>
      <Text style={styles.text}>📡 Offline Mode Active — Local SQLite & LoRa Mesh Relaying Enabled</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    backgroundColor: COLORS.warning,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  text: {
    color: '#090D16',
    fontSize: 12,
    fontWeight: '700',
  },
});
