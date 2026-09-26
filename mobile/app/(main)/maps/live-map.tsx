import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Header } from '../../../components/navigation/Header';
import { DisasterMap } from '../../../components/maps/DisasterMap';
import { HazardLegend } from '../../../components/risk/HazardLegend';
import { useLocation } from '../../../hooks/useLocation';
import { COLORS } from '../../../constants/colors';

export default function LiveMapScreen() {
  const { location } = useLocation();
  return (
    <View style={styles.container}>
      <Header title="Live Tactical Hazard Map" />
      <View style={styles.content}>
        <DisasterMap center={location} />
        <HazardLegend />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16 },
});
