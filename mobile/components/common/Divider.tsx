import React from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';

export const Divider: React.FC = () => <View style={styles.divider} />;

const styles = StyleSheet.create({
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 12,
  },
});
