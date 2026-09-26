import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Header } from '../../../components/navigation/Header';
import { COLORS } from '../../../constants/colors';

export default function EvacuationRouteScreen() {
  return (
    <View style={styles.container}>
      <Header title="Evacuation Corridors" showBack />
      <View style={styles.content}>
        <Text style={styles.text}>Primary Corridor: Shillong Southern Bypass</Text>
        <Text style={styles.sub}>Clear of rockfall and bridge failures.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16 },
  text: { color: COLORS.textPrimary, fontSize: 15, fontWeight: '700' },
  sub: { color: COLORS.success, fontSize: 13, marginTop: 4 },
});
