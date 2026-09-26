import React, { useEffect } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Header } from '../../../components/navigation/Header';
import { AlertCard } from '../../../components/emergency/AlertCard';
import { useAlerts } from '../../../hooks/useAlerts';
import { COLORS } from '../../../constants/colors';

export default function AlertsScreen() {
  const { alerts, fetchAlerts } = useAlerts();

  useEffect(() => {
    fetchAlerts();
  }, []);

  return (
    <View style={styles.container}>
      <Header title="Official Warnings & Alerts" showBack />
      <FlatList
        data={alerts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <AlertCard alert={item} />}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  list: { padding: 16 },
});
