import React, { useEffect } from 'react';
import { View, FlatList, StyleSheet, Text } from 'react-native';
import { Header } from '../../../components/navigation/Header';
import { RiskCard } from '../../../components/risk/RiskCard';
import { RiskGauge } from '../../../components/risk/RiskGauge';
import { HazardLegend } from '../../../components/risk/HazardLegend';
import { useRisk } from '../../../hooks/useRisk';
import { COLORS } from '../../../constants/colors';

export default function RiskIndex() {
  const { predictions, fetchPredictions } = useRisk();

  useEffect(() => {
    fetchPredictions();
  }, []);

  return (
    <View style={styles.container}>
      <Header title="Geotechnical Hazard Risk" />
      <FlatList
        ListHeaderComponent={
          <>
            <RiskGauge scorePct={78} />
            <HazardLegend />
            <Text style={styles.title}>MONITORED SECTORS</Text>
          </>
        }
        data={predictions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <RiskCard prediction={item} />}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  list: { padding: 16 },
  title: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '800', marginVertical: 8 },
});
