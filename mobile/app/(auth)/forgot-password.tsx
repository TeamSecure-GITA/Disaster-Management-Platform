import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { Header } from '../../components/navigation/Header';
import { Button } from '../../components/common/Button';
import { COLORS } from '../../constants/colors';

export default function ForgotPasswordScreen() {
  return (
    <View style={styles.container}>
      <Header title="Account Recovery" showBack />
      <View style={styles.content}>
        <Text style={styles.title}>Reset Authentication Password</Text>
        <TextInput style={styles.input} placeholder="Registered Email or Mobile" placeholderTextColor={COLORS.textMuted} />
        <Button title="SEND RESET OTP" onPress={() => {}} style={{ marginTop: 12 }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 20 },
  title: { color: COLORS.textPrimary, fontSize: 16, fontWeight: '700', marginBottom: 12 },
  input: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, color: COLORS.textPrimary, padding: 14, marginBottom: 12 },
});
