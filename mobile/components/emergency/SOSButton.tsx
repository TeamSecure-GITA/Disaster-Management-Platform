import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { COLORS } from '../../constants/colors';

interface SOSButtonProps {
  onPress: () => void;
  size?: number;
}

export const SOSButton: React.FC<SOSButtonProps> = ({ onPress, size = 180 }) => {
  return (
    <View style={[styles.outerGlow, { width: size + 36, height: size + 36, borderRadius: (size + 36) / 2 }]}>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onPress}
        style={[styles.button, { width: size, height: size, borderRadius: size / 2 }]}
      >
        <Text style={styles.sosText}>SOS</Text>
        <Text style={styles.subText}>PRESS FOR 3 SEC</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  outerGlow: {
    backgroundColor: 'rgba(255, 42, 85, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  button: {
    backgroundColor: COLORS.emergency,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 12,
    shadowColor: COLORS.emergency,
    shadowOpacity: 0.6,
    shadowRadius: 20,
  },
  sosText: {
    fontSize: 48,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: 2,
  },
  subText: {
    fontSize: 10,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.85)',
    marginTop: 4,
    letterSpacing: 1,
  },
});
