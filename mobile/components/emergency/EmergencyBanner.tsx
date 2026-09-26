import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';

export const EmergencyBanner: React.FC<{ message: string }> = ({ message }) => (
  <View style={styles.banner}>
    <Text style={styles.icon}>⚠️</Text>
    <Text style={styles.text}>{message}</Text>
  </View>
);

const styles = StyleSheet.create({
  banner: {
    backgroundColor: COLORS.emergency,
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  icon: {
    fontSize: 18,
    marginRight: 8,
  },
  text: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
  },
});
