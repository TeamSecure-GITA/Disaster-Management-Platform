import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '../../constants/colors';

export const BackButton: React.FC = () => {
  const router = useRouter();
  return (
    <TouchableOpacity onPress={() => router.back()} style={styles.btn}>
      <Text style={styles.text}>‹ Back</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  btn: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  text: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '600',
  },
});
