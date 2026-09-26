import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Header } from '../../../components/navigation/Header';
import { COLORS } from '../../../constants/colors';

export default function PermissionsScreen() {
  return (
    <View style={styles.container}>
      <Header title="Hardware Permissions" showBack />
      <View style={styles.content}>
        <Text style={styles.text}>GPS High Precision: GRANTED</Text>
        <Text style={styles.text}>Emergency Notifications: GRANTED</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16 },
  text: { color: COLORS.textPrimary, fontSize: 14, marginBottom: 8 },
});
