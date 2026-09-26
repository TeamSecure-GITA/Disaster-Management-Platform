export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  bloodGroup?: string;
  medicalConditions?: string[];
  emergencyContacts?: EmergencyContact[];
  role: 'citizen' | 'responder' | 'coordinator' | 'admin';
  createdAt?: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  notifyOnSos: boolean;
}
