import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../stores/auth.store';
import { Button } from '../../components/common/Button';
import { Header } from '../../components/navigation/Header';
import { COLORS } from '../../constants/colors';
import { ROUTES } from '../../constants/routes';

export default function LoginScreen() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const [email, setEmail] = useState('commander@sentinel.org');
  const [password, setPassword] = useState('SentinelPass2026!');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    await login(email, password);
    setLoading(false);
    router.replace(ROUTES.MAIN.HOME as any);
  };

  return (
    <View style={styles.container}>
      <Header title="Commander & Citizen Login" />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Access Disaster Operations</Text>
        <Text style={styles.sub}>Log in to coordinate relief dispatch, verify field incident telemetry, and manage emergency circles.</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Email address or Phone (+91)"
          placeholderTextColor={COLORS.textMuted}
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor={COLORS.textMuted}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        
        <Button title="SIGN IN" onPress={handleLogin} loading={loading} style={styles.btn} />
        <Button title="Create New Citizen Account" onPress={() => router.push(ROUTES.AUTH.REGISTER as any)} variant="outline" style={styles.btnOutline} />
        <Button title="Continue to Emergency Dashboard ›" onPress={() => router.replace(ROUTES.MAIN.HOME as any)} variant="secondary" style={styles.btnSecondary} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 20 },
  title: { fontSize: 20, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 6 },
  sub: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 24, lineHeight: 18 },
  input: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, color: COLORS.textPrimary, padding: 14, marginBottom: 14, fontSize: 14 },
  btn: { marginTop: 10 },
  btnOutline: { marginTop: 12 },
  btnSecondary: { marginTop: 16 },
});
