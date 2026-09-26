import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Header } from '../../../components/navigation/Header';
import { COLORS } from '../../../constants/colors';

export default function RiskHistoryScreen() {
  return (
    <View style={styles.container}>
      <Header title="Historical Hazard Log" showBack />
      <View style={styles.content}>
        <Text style={styles.text}>No antecedent slope failures recorded in past 7 days.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16 },
  text: { color: COLORS.textSecondary, fontSize: 13 },
});
