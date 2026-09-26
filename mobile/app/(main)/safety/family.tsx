import React, { useEffect } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Header } from '../../../components/navigation/Header';
import { FamilyCard } from '../../../components/family/FamilyCard';
import { useFamilyStore } from '../../../stores/family.store';
import { COLORS } from '../../../constants/colors';

export default function FamilyScreen() {
  const { members, fetchMembers } = useFamilyStore();

  useEffect(() => {
    fetchMembers();
  }, []);

  return (
    <View style={styles.container}>
      <Header title="Family Safety Circle" />
      <FlatList
        data={members}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <FamilyCard member={item} />}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  list: { padding: 16 },
});
