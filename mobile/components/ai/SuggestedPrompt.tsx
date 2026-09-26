import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';

export const SuggestedPrompt: React.FC<{ prompt: string; onPress: (p: string) => void }> = ({ prompt, onPress }) => (
  <TouchableOpacity onPress={() => onPress(prompt)} style={styles.chip}>
    <Text style={styles.text}>{prompt}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  chip: {
    backgroundColor: COLORS.surfaceElevated,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  text: {
    color: COLORS.primary,
    fontSize: 12,
  },
});
