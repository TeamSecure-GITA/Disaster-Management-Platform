import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Header } from '../../../components/navigation/Header';
import { COLORS } from '../../../constants/colors';

export default function HazardDetailsScreen() {
  return (
    <View style={styles.container}>
      <Header title="Hazard Geophysics" showBack />
      <View style={styles.content}>
        <Text style={styles.text}>Mohr-Coulomb Geotechnical Formulation Active.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16 },
  text: { color: COLORS.textPrimary, fontSize: 14 },
});
