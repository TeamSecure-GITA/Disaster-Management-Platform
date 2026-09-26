import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Header } from '../../../components/navigation/Header';
import { SyncQueue } from '../../../components/offline/SyncQueue';
import { SyncQueue as QueueService } from '../../../offline/queue';
import { PendingSyncItem } from '../../../types/offline';
import { COLORS } from '../../../constants/colors';

export default function PendingSyncScreen() {
  const [items, setItems] = useState<PendingSyncItem[]>([]);

  useEffect(() => {
    QueueService.getPending().then(setItems);
  }, []);

  return (
    <View style={styles.container}>
      <Header title="Pending Sync Records" showBack />
      <View style={styles.content}>
        <SyncQueue items={items} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16 },
});
