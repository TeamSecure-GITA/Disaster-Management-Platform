import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { Header } from '../../components/navigation/Header';
import { Button } from '../../components/common/Button';
import { COLORS } from '../../constants/colors';

export default function VerifyAccountScreen() {
  return (
    <View style={styles.container}>
      <Header title="Verify Identity" showBack />
      <View style={styles.content}>
        <Text style={styles.title}>Enter 6-Digit Emergency OTP</Text>
        <TextInput style={styles.input} placeholder="• • • • • •" placeholderTextColor={COLORS.textMuted} keyboardType="number-pad" maxLength={6} />
        <Button title="CONFIRM IDENTITY" onPress={() => {}} style={{ marginTop: 12 }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 20 },
  title: { color: COLORS.textPrimary, fontSize: 16, fontWeight: '700', marginBottom: 12 },
  input: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, color: COLORS.textPrimary, padding: 14, textAlign: 'center', fontSize: 24, letterSpacing: 8 },
});
