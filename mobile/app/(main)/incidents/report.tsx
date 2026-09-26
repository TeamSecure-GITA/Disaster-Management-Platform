import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Header } from '../../../components/navigation/Header';
import { IncidentForm } from '../../../components/incident/IncidentForm';
import { useIncidents } from '../../../hooks/useIncidents';
import { useLocation } from '../../../hooks/useLocation';
import { COLORS } from '../../../constants/colors';
import { ROUTES } from '../../../constants/routes';

export default function ReportScreen() {
  const router = useRouter();
  const { reportIncident } = useIncidents();
  const { location } = useLocation();

  const handleSubmit = async (data: { title: string; desc: string }) => {
    await reportIncident({
      id: `inc-${Date.now()}`,
      title: data.title,
      category: 'landslide',
      severity: 'high',
      description: data.desc,
      coordinates: location,
      photos: [],
      reportedBy: 'You',
      reportedAt: new Date().toISOString(),
      status: 'pending',
      syncStatus: 'pending_sync',
    });
    router.push(ROUTES.MAIN.INCIDENTS.MY_REPORTS as any);
  };

  return (
    <View style={styles.container}>
      <Header title="Report Field Hazard Incident" showBack />
      <ScrollView contentContainerStyle={styles.content}>
        <IncidentForm onSubmit={handleSubmit} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16 },
});
