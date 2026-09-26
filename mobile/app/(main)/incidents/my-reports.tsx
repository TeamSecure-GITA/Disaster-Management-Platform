import React, { useEffect } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Header } from '../../../components/navigation/Header';
import { IncidentCard } from '../../../components/incident/IncidentCard';
import { useIncidents } from '../../../hooks/useIncidents';
import { COLORS } from '../../../constants/colors';

export default function MyReportsScreen() {
  const { incidents, fetchIncidents } = useIncidents();

  useEffect(() => {
    fetchIncidents();
  }, []);

  return (
    <View style={styles.container}>
      <Header title="My Incident Reports" />
      <FlatList
        data={incidents}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <IncidentCard incident={item} />}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  list: { padding: 16 },
});
