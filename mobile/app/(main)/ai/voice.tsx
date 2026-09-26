import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Header } from '../../../components/navigation/Header';
import { VoiceButton } from '../../../components/ai/VoiceButton';
import { useVoice } from '../../../hooks/useVoice';
import { COLORS } from '../../../constants/colors';

export default function VoiceScreen() {
  const { isListening, toggleListening } = useVoice();
  return (
    <View style={styles.container}>
      <Header title="Hands-Free Voice AI" showBack />
      <View style={styles.center}>
        <VoiceButton isListening={isListening} onPress={toggleListening} />
        <Text style={styles.text}>{isListening ? 'Listening for emergency commands...' : 'Tap microphone for hands-free guidance'}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  text: { color: COLORS.textSecondary, marginTop: 16, fontSize: 14 },
});
