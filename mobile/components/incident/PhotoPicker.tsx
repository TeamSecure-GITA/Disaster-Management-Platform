import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';

export const PhotoPicker: React.FC<{ onPick: () => void }> = ({ onPick }) => (
  <TouchableOpacity onPress={onPick} style={styles.btn}>
    <Text style={styles.text}>📷 Attach Incident Photo / Aerial Frame</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  btn: {
    padding: 12,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    alignItems: 'center',
  },
  text: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '600',
  },
});
