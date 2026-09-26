import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Header } from '../../../components/navigation/Header';
import { OfflineAlertCard } from '../../../components/offline/OfflineAlertCard';
import { COLORS } from '../../../constants/colors';

export default function OfflineAlertsScreen() {
  return (
    <View style={styles.container}>
      <Header title="Cached Offline Warnings" showBack />
      <View style={styles.content}>
        <OfflineAlertCard
          title="Monsoon Overland Flood Advisory"
          body="Stored in local device SQLite database. Follow higher-elevation pathways."
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16 },
});
