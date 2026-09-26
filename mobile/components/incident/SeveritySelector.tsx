import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';

const SEVS = ['low', 'moderate', 'high', 'critical'];

export const SeveritySelector: React.FC<{ selected: string; onSelect: (s: string) => void }> = ({
  selected,
  onSelect,
}) => (
  <View style={styles.row}>
    {SEVS.map((s) => (
      <TouchableOpacity
        key={s}
        style={[styles.btn, selected === s && styles.active]}
        onPress={() => onSelect(s)}
      >
        <Text style={[styles.text, selected === s && styles.activeText]}>{s.toUpperCase()}</Text>
      </TouchableOpacity>
    ))}
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 8,
  },
  btn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  active: {
    borderColor: COLORS.emergency,
    backgroundColor: COLORS.emergencyBg,
  },
  text: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '700',
  },
  activeText: {
    color: COLORS.emergency,
  },
});
