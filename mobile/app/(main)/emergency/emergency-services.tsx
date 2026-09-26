import React from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Header } from '../../../components/navigation/Header';
import { EmergencyServiceCard } from '../../../components/emergency/EmergencyServiceCard';
import { EmergencyService } from '../../../services/emergency/emergency.service';
import { COLORS } from '../../../constants/colors';

export default function EmergencyServicesScreen() {
  const services = EmergencyService.getOfficialHotlines();
  return (
    <View style={styles.container}>
      <Header title="24x7 National Helplines" showBack />
      <FlatList
        data={services}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <EmergencyServiceCard service={item} />}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  list: { padding: 16 },
});
