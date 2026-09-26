import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';

interface AvatarProps {
  name: string;
  size?: number;
}

export const Avatar: React.FC<AvatarProps> = ({ name, size = 40 }) => {
  const initials = name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();
  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={[styles.text, { fontSize: size * 0.4 }]}>{initials}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  avatar: {
    backgroundColor: COLORS.surfaceElevated,
    borderColor: COLORS.primary,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: COLORS.primary,
    fontWeight: '700',
  },
});
