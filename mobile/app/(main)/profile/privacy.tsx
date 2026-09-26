import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Header } from '../../../components/navigation/Header';
import { COLORS } from '../../../constants/colors';

export default function PrivacyScreen() {
  return (
    <View style={styles.container}>
      <Header title="Data Privacy & Encryption" showBack />
      <View style={styles.content}>
        <Text style={styles.text}>Telemetry encrypted on device before local storage and mesh relay.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16 },
  text: { color: COLORS.textSecondary, fontSize: 13, lineHeight: 20 },
});
