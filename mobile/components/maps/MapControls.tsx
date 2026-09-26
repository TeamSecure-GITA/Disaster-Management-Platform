import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';

export const MapControls: React.FC<{ onRecenter?: () => void }> = ({ onRecenter }) => (
  <View style={styles.container}>
    <TouchableOpacity onPress={onRecenter} style={styles.btn}>
      <Text style={styles.text}>🎯</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 12,
    right: 12,
  },
  btn: {
    backgroundColor: COLORS.surfaceElevated,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  text: {
    fontSize: 18,
  },
});
