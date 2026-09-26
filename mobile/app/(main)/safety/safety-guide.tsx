import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Header } from '../../../components/navigation/Header';
import { COLORS } from '../../../constants/colors';

export default function SafetyGuideScreen() {
  return (
    <View style={styles.container}>
      <Header title="Disaster Survival Manual" showBack />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading}>🌊 Flash Flood Survival</Text>
        <Text style={styles.text}>1. Never drive through flooded causeways.\n2. Turn off primary electrical mains before water enters living area.\n3. Keep go-bag with medication and radio at all times.</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16 },
  heading: { color: COLORS.primary, fontSize: 16, fontWeight: '700', marginBottom: 8 },
  text: { color: COLORS.textSecondary, fontSize: 13, lineHeight: 20 },
});
