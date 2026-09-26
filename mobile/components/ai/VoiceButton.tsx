import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';

export const VoiceButton: React.FC<{ isListening: boolean; onPress: () => void }> = ({ isListening, onPress }) => (
  <TouchableOpacity onPress={onPress} style={[styles.btn, isListening && styles.active]}>
    <Text style={styles.icon}>{isListening ? '🛑' : '🎙️'}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  btn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  active: {
    borderColor: COLORS.emergency,
    backgroundColor: COLORS.emergencyBg,
  },
  icon: {
    fontSize: 20,
  },
});
