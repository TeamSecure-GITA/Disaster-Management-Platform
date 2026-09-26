import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Header } from '../../../components/navigation/Header';
import { EmergencyContactCard } from '../../../components/emergency/EmergencyContactCard';
import { EmergencyContactsService } from '../../../services/emergency/emergency-contacts.service';
import { EmergencyContact } from '../../../types/user';
import { COLORS } from '../../../constants/colors';

export default function EmergencyContactsScreen() {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);

  useEffect(() => {
    EmergencyContactsService.getContacts().then(setContacts);
  }, []);

  return (
    <View style={styles.container}>
      <Header title="Emergency Circle Contacts" showBack />
      <FlatList
        data={contacts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <EmergencyContactCard contact={item} />}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  list: { padding: 16 },
});
