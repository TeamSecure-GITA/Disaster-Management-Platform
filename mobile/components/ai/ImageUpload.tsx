import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';

export const ImageUpload: React.FC<{ onPickImage: () => void }> = ({ onPickImage }) => (
  <TouchableOpacity onPress={onPickImage} style={styles.btn}>
    <Text style={styles.text}>📷 Inspect Disaster Damage Image</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  btn: {
    padding: 12,
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  text: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 13,
  },
});
