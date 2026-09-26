import { Incident, ResponderTeam, ShelterLocation } from '../types/incident';

interface IncidentState {
  incidents: Incident[];
  responders: ResponderTeam[];
  shelters: ShelterLocation[];
  activeIncidentId: string | null;
  loading: boolean;
}

type Listener = () => void;

class IncidentStore {
  private state: IncidentState = {
    incidents: [
      {
        id: 'inc-01',
        title: 'Shillong Bypass Landslide Blockage',
        description: 'Heavy rain triggered debris flow blocking NH-10 corridor. Two vehicles immobilized.',
        type: 'landslide',
        severity: 'HIGH',
        status: 'DISPATCHED',
        location: {
          address: 'NH-10 Km 42, Ri-Bhoi Sector',
          coordinates: { lat: 25.688, lng: 91.93 },
        },
        reportedBy: 'LoRa Tiltmeter Mesh Alert #882',
        affectedPeople: 45,
        assignedTeams: ['NDRF-Unit-4', 'Meghalaya-SDRF-A'],
        dispatchedDrones: ['UAV-Recon-02'],
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'inc-02',
        title: 'Brahmaputra Riverbed Flash Flood Inundation',
        description: 'Water surge exceeding danger marks at Majuli embankment zone. Pre-evacuation underway.',
        type: 'flash_flood',
        severity: 'CATASTROPHIC',
        status: 'ON_SCENE',
        location: {
          address: 'Majuli Island Sector 3, Assam',
          coordinates: { lat: 26.95, lng: 94.21 },
        },
        reportedBy: 'Flood Gauge Station F-19',
        affectedPeople: 320,
        assignedTeams: ['NDRF-Water-Rescue-1'],
        dispatchedDrones: ['UAV-Thermal-01'],
        createdAt: new Date(Date.now() - 7200000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    responders: [
      {
        id: 'resp-1',
        name: 'NDRF Quick Action Battalion 1',
        type: 'NDRF',
        coordinates: { lat: 25.65, lng: 91.91 },
        status: 'ON_MISSION',
        assignedIncidentId: 'inc-01',
        personnelCount: 24,
        contactFrequency: '144.200 MHz VHF',
      },
      {
        id: 'resp-2',
        name: 'SDRF Medical Evac Alpha',
        type: 'MEDICAL_PARAMEDIC',
        coordinates: { lat: 25.59, lng: 91.88 },
        status: 'IDLE',
        personnelCount: 8,
        contactFrequency: '145.500 MHz VHF',
      },
    ],
    shelters: [
      {
        id: 'shl-1',
        name: 'Shillong Sports Complex Shelter Center',
        address: 'Polo Grounds, Shillong',
        coordinates: { lat: 25.584, lng: 91.898 },
        capacity: 500,
        occupied: 185,
        amenities: ['Generators', 'First Aid Trauma Kit', 'Satellite Comms', 'Clean Water'],
        contactPhone: '+91-364-222340',
        isOpen: true,
      },
    ],
    activeIncidentId: 'inc-01',
    loading: false,
  };

  private listeners: Set<Listener> = new Set();

  public getState = (): IncidentState => this.state;

  public subscribe = (listener: Listener): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  private notify() {
    this.listeners.forEach((listener) => listener());
  }

  public setActiveIncident = (id: string | null) => {
    this.state = { ...this.state, activeIncidentId: id };
    this.notify();
  };

  public addIncident = (incident: Incident) => {
    this.state = {
      ...this.state,
      incidents: [incident, ...this.state.incidents],
    };
    this.notify();
  };

  public updateIncidentStatus = (id: string, status: Incident['status']) => {
    this.state = {
      ...this.state,
      incidents: this.state.incidents.map((inc) =>
        inc.id === id ? { ...inc, status, updatedAt: new Date().toISOString() } : inc
      ),
    };
    this.notify();
  };
}

export const incidentStore = new IncidentStore();
