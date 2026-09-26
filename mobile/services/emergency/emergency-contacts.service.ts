import { EmergencyContact } from '../../types/user';
import { OfflineStorage } from '../../offline/storage';

const CONTACTS_KEY = 'sentinel_emergency_contacts';

export const EmergencyContactsService = {
  async getContacts(): Promise<EmergencyContact[]> {
    return (await OfflineStorage.get<EmergencyContact[]>(CONTACTS_KEY)) || [
      { id: 'c-1', name: 'District Emergency Operations Center', relationship: 'Disaster Authority', phone: '1070', notifyOnSos: true },
      { id: 'c-2', name: 'Primary Family Contact', relationship: 'Spouse', phone: '+919876543211', notifyOnSos: true },
    ];
  },
  async saveContacts(contacts: EmergencyContact[]): Promise<void> {
    await OfflineStorage.set(CONTACTS_KEY, contacts);
  }
};
