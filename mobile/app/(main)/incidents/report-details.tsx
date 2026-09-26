import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Header } from '../../../components/navigation/Header';
import { COLORS } from '../../../constants/colors';

export default function ReportDetailsScreen() {
  return (
    <View style={styles.container}>
      <Header title="Incident Assessment Details" showBack />
      <View style={styles.content}>
        <Text style={styles.text}>Incident dispatched to Emergency Operations Base Unit 4.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16 },
  text: { color: COLORS.textPrimary, fontSize: 14 },
});
