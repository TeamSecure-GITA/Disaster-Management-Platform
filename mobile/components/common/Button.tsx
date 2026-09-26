import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { COLORS } from '../../constants/colors';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'emergency' | 'secondary' | 'outline';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
  textStyle,
}) => {
  const getBackgroundColor = () => {
    if (disabled) return '#334155';
    switch (variant) {
      case 'emergency': return COLORS.emergency;
      case 'secondary': return COLORS.surfaceElevated;
      case 'outline': return 'transparent';
      default: return COLORS.primary;
    }
  };

  const getTextColor = () => {
    if (disabled) return '#94A3B8';
    switch (variant) {
      case 'outline': return COLORS.primary;
      case 'secondary': return COLORS.textPrimary;
      default: return '#090D16';
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        { backgroundColor: getBackgroundColor() },
        variant === 'outline' && styles.outlineBorder,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <Text style={[styles.text, { color: getTextColor() }, textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  outlineBorder: {
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  text: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
