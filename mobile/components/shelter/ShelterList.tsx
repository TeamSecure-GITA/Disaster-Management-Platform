import React from 'react';
import { View, StyleSheet } from 'react-native';
import { EmergencyShelter } from '../../types/shelter';
import { ShelterCard } from './ShelterCard';

export const ShelterList: React.FC<{ shelters: EmergencyShelter[]; onSelect?: (s: EmergencyShelter) => void }> = ({
  shelters,
  onSelect,
}) => (
  <View style={styles.list}>
    {shelters.map((s) => (
      <ShelterCard key={s.id} shelter={s} onSelect={() => onSelect?.(s)} />
    ))}
  </View>
);

const styles = StyleSheet.create({
  list: {
    paddingVertical: 8,
  },
});
