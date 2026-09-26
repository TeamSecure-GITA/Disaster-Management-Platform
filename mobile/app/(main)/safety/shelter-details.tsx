import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Header } from '../../../components/navigation/Header';
import { COLORS } from '../../../constants/colors';

export default function ShelterDetailsScreen() {
  return (
    <View style={styles.container}>
      <Header title="Shelter Logistics" showBack />
      <View style={styles.content}>
        <Text style={styles.text}>Shelter capacity: 1,200. Clean water and trauma unit online.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16 },
  text: { color: COLORS.textPrimary, fontSize: 14 },
});
