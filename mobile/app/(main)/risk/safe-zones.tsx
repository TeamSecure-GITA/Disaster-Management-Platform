import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Header } from '../../../components/navigation/Header';
import { COLORS } from '../../../constants/colors';

export default function SafeZonesScreen() {
  return (
    <View style={styles.container}>
      <Header title="Designated Safe Zones" showBack />
      <View style={styles.content}>
        <Text style={styles.text}>1. Shillong Golf Ridge High Ground</Text>
        <Text style={styles.text}>2. Cherrapunji Central Tableland Sector</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16 },
  text: { color: COLORS.textPrimary, fontSize: 14, marginBottom: 8 },
});
