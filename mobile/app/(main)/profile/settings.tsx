import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Header } from '../../../components/navigation/Header';
import { COLORS } from '../../../constants/colors';

export default function SettingsScreen() {
  return (
    <View style={styles.container}>
      <Header title="App Settings" showBack />
      <View style={styles.content}>
        <Text style={styles.text}>LoRa Mesh Relay: Enabled</Text>
        <Text style={styles.text}>Offline Map Cache: 142 MB</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16 },
  text: { color: COLORS.textPrimary, fontSize: 14, marginBottom: 8 },
});
