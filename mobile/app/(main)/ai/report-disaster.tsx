import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Header } from '../../../components/navigation/Header';
import { COLORS } from '../../../constants/colors';

export default function ReportDisasterAIScreen() {
  return (
    <View style={styles.container}>
      <Header title="AI Incident Transcription" showBack />
      <View style={styles.content}>
        <Text style={styles.text}>Speak or describe disaster damage; AI will extract GPS coordinates and categorize severity.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16 },
  text: { color: COLORS.textPrimary, fontSize: 14 },
});
