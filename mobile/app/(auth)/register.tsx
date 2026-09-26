import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '../../components/common/Button';
import { Header } from '../../components/navigation/Header';
import { COLORS } from '../../constants/colors';
import { ROUTES } from '../../constants/routes';

export default function RegisterScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  return (
    <View style={styles.container}>
      <Header title="Citizen Registration" showBack />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Register for Early Warnings</Text>
        <TextInput style={styles.input} placeholder="Full Legal Name" placeholderTextColor={COLORS.textMuted} value={name} onChangeText={setName} />
        <TextInput style={styles.input} placeholder="Phone Number (+91)" placeholderTextColor={COLORS.textMuted} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
        <Button title="COMPLETE REGISTRATION" onPress={() => router.replace(ROUTES.MAIN.HOME as any)} style={{ marginTop: 12 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 20 },
  title: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 16 },
  input: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, color: COLORS.textPrimary, padding: 14, marginBottom: 12 },
});
