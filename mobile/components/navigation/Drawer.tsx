import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';

export const Drawer: React.FC = () => (
  <View style={styles.container}>
    <Text style={styles.text}>Disaster Sentinel Command Menu</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
    padding: 20,
  },
  text: {
    color: COLORS.textPrimary,
    fontSize: 16,
  },
});
