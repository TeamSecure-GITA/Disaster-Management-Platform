import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';

interface BadgeProps {
  label: string;
  variant?: 'emergency' | 'warning' | 'success' | 'info' | 'primary';
}

export const Badge: React.FC<BadgeProps> = ({ label, variant = 'info' }) => {
  const getColor = () => {
    switch (variant) {
      case 'emergency': return { bg: COLORS.emergencyBg, text: COLORS.emergency };
      case 'warning': return { bg: COLORS.warningBg, text: COLORS.warning };
      case 'success': return { bg: COLORS.successBg, text: COLORS.success };
      case 'primary': return { bg: COLORS.primaryBg, text: COLORS.primary };
      default: return { bg: 'rgba(59, 130, 246, 0.12)', text: COLORS.info };
    }
  };
  const c = getColor();

  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      <Text style={[styles.text, { color: c.text }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
});
