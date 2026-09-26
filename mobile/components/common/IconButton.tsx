import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { COLORS } from '../../constants/colors';

interface IconButtonProps {
  icon: string;
  onPress: () => void;
  style?: ViewStyle;
  variant?: 'default' | 'emergency' | 'primary';
}

export const IconButton: React.FC<IconButtonProps> = ({ icon, onPress, style, variant = 'default' }) => {
  const bg = variant === 'emergency' ? COLORS.emergency : variant === 'primary' ? COLORS.primary : COLORS.surfaceElevated;
  const color = variant === 'default' ? COLORS.textPrimary : '#090D16';

  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress} style={[styles.container, { backgroundColor: bg }, style]}>
      <Text style={[styles.iconText, { color }]}>{icon}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 18,
    fontWeight: '700',
  },
});
