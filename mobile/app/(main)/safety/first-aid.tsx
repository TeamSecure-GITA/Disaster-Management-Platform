import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Header } from '../../../components/navigation/Header';
import { COLORS } from '../../../constants/colors';

export default function FirstAidScreen() {
  return (
    <View style={styles.container}>
      <Header title="Emergency First Aid Triage" showBack />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading}>🩸 Severe Bleeding Control</Text>
        <Text style={styles.text}>Apply direct, firm pressure with sterile cloth. Elevate limb above heart level. Call 108 immediately.</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16 },
  heading: { color: COLORS.emergency, fontSize: 16, fontWeight: '700', marginBottom: 8 },
  text: { color: COLORS.textSecondary, fontSize: 13, lineHeight: 20 },
});
