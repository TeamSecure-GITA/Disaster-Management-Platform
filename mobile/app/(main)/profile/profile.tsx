import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Header } from '../../../components/navigation/Header';
import { Avatar } from '../../../components/common/Avatar';
import { Button } from '../../../components/common/Button';
import { useAuth } from '../../../hooks/useAuth';
import { COLORS } from '../../../constants/colors';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  return (
    <View style={styles.container}>
      <Header title="Responder / Citizen Profile" />
      <View style={styles.content}>
        <Avatar name={user?.fullName || 'Rahul Sharma'} size={64} />
        <Text style={styles.name}>{user?.fullName || 'Commander Rahul Sharma'}</Text>
        <Text style={styles.role}>Role: {(user?.role || 'Responder').toUpperCase()}</Text>
        <Text style={styles.phone}>{user?.phone || '+919876543210'}</Text>
        <Button title="LOG OUT" onPress={logout} variant="outline" style={{ marginTop: 24 }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 24, alignItems: 'center' },
  name: { color: COLORS.textPrimary, fontSize: 18, fontWeight: '800', marginTop: 12 },
  role: { color: COLORS.primary, fontSize: 12, fontWeight: '700', marginTop: 4 },
  phone: { color: COLORS.textSecondary, fontSize: 13, marginTop: 4 },
});
