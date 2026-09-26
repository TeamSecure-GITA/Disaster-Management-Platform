import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Header } from '../../../components/navigation/Header';
import { Button } from '../../../components/common/Button';
import { COLORS } from '../../../constants/colors';
import { ROUTES } from '../../../constants/routes';

export default function EmergencyIndex() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <Header title="Emergency Command Hub" />
      <ScrollView contentContainerStyle={styles.content}>
        <Button title="🆘 BROADCAST EMERGENCY SOS" onPress={() => router.push(ROUTES.MAIN.EMERGENCY.SOS as any)} variant="emergency" style={styles.btn} />
        <Button title="🚨 ACTIVE DISASTER ALERTS" onPress={() => router.push(ROUTES.MAIN.EMERGENCY.ALERTS as any)} variant="primary" style={styles.btn} />
        <Button title="👥 EMERGENCY FAMILY CONTACTS" onPress={() => router.push(ROUTES.MAIN.EMERGENCY.CONTACTS as any)} variant="secondary" style={styles.btn} />
        <Button title="📞 24x7 TOLL-FREE SERVICES" onPress={() => router.push(ROUTES.MAIN.EMERGENCY.SERVICES as any)} variant="secondary" style={styles.btn} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16 },
  btn: { marginBottom: 12 },
});
