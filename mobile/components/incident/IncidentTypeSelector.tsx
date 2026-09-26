import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';

const TYPES = ['landslide', 'flood', 'building_collapse', 'road_cut', 'fire'];

export const IncidentTypeSelector: React.FC<{ selected: string; onSelect: (t: string) => void }> = ({
  selected,
  onSelect,
}) => (
  <View style={styles.row}>
    {TYPES.map((t) => (
      <TouchableOpacity
        key={t}
        style={[styles.btn, selected === t && styles.active]}
        onPress={() => onSelect(t)}
      >
        <Text style={[styles.text, selected === t && styles.activeText]}>{t.replace('_', ' ')}</Text>
      </TouchableOpacity>
    ))}
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginVertical: 8,
  },
  btn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: COLORS.surface,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  active: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryBg,
  },
  text: {
    color: COLORS.textSecondary,
    fontSize: 11,
    textTransform: 'capitalize',
  },
  activeText: {
    color: COLORS.primary,
    fontWeight: '700',
  },
});
