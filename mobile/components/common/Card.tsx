import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { COLORS } from '../../constants/colors';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'elevated' | 'emergency';
}

export const Card: React.FC<CardProps> = ({ children, style, variant = 'default' }) => {
  const bg = variant === 'elevated' ? COLORS.surfaceElevated : COLORS.surface;
  const border = variant === 'emergency' ? COLORS.emergency : COLORS.border;

  return <View style={[styles.card, { backgroundColor: bg, borderColor: border }, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },
});
