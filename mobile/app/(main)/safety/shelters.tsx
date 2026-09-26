import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Header } from '../../../components/navigation/Header';
import { ShelterList } from '../../../components/shelter/ShelterList';
import { useShelters } from '../../../hooks/useShelters';
import { COLORS } from '../../../constants/colors';

export default function SheltersScreen() {
  const { shelters, fetchShelters } = useShelters();

  useEffect(() => {
    fetchShelters();
  }, []);

  return (
    <View style={styles.container}>
      <Header title="Emergency Shelters" />
      <ShelterList shelters={shelters} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: 16 },
});
