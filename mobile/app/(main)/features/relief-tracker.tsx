import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Header } from '../../../components/navigation/Header';
import { COLORS } from '../../../constants/colors';
import { openWebFeature } from '../../../utils/webPortal';

interface FleetUnit {
  id: string;
  name: string;
  type: string;
  status: 'EN ROUTE' | 'DELIVERING' | 'STANDBY';
  cargo: string;
  eta: string;
  coord: string;
}

const FLEET_UNITS: FleetUnit[] = [
  { id: 'F-1', name: 'Convoy Alpha (3x 4WD)', type: 'Medical Supplies & Blood Bank', status: 'EN ROUTE', cargo: '500 Trauma Kits', eta: '18 mins', coord: '26.184° N, 91.745° E' },
  { id: 'F-2', name: 'Heavy Relief Truck #04', type: 'Potable Water & Rations', status: 'DELIVERING', cargo: '4,000L Water, 1,200 Meals', eta: 'On-Site', coord: '26.152° N, 91.782° E' },
  { id: 'F-3', name: 'Air-Rescue Drone Swarm #2', type: 'Emergency Satellite Beacons', status: 'EN ROUTE', cargo: '15x Sat-Pagers', eta: '7 mins', coord: '26.195° N, 91.730° E' },
  { id: 'F-4', name: 'Ambulance Unit 09 (SDRF)', type: 'Critical Patient Transport', status: 'STANDBY', cargo: 'ICU Mobile Unit', eta: 'Stationary', coord: '26.140° N, 91.760° E' },
];

export default function ReliefTrackerScreen() {
  const [selectedUnit, setSelectedUnit] = useState<FleetUnit | null>(null);

  return (
    <View style={styles.container}>
      <Header title="Live Relief Fleet & Logistics" showBack />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.statusBar}>
          <Text style={styles.statusDot}>🟢</Text>
          <Text style={styles.statusText}>GPS TELEMETRY ACTIVE — 14 CONVOYS TRACKED</Text>
        </View>

        <Text style={styles.sectionHeader}>DEPLOYED RELIEF CONVOYS</Text>

        {FLEET_UNITS.map((unit) => (
          <TouchableOpacity
            key={unit.id}
            style={[styles.unitCard, selectedUnit?.id === unit.id && styles.unitCardSelected]}
            onPress={() => setSelectedUnit(unit)}
          >
            <View style={styles.unitHeader}>
              <Text style={styles.unitName}>{unit.name}</Text>
              <View style={[styles.badge, unit.status === 'EN ROUTE' ? styles.badgeGreen : styles.badgeBlue]}>
                <Text style={styles.badgeText}>{unit.status}</Text>
              </View>
            </View>
            <Text style={styles.unitType}>{unit.type}</Text>
            <View style={styles.unitMetaRow}>
              <Text style={styles.metaLabel}>📦 Cargo: <Text style={styles.metaVal}>{unit.cargo}</Text></Text>
              <Text style={styles.metaLabel}>⏱️ ETA: <Text style={styles.metaVal}>{unit.eta}</Text></Text>
            </View>
            <Text style={styles.coordText}>GPS: {unit.coord}</Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={styles.webBtn} onPress={() => openWebFeature('/relief-tracker')}>
          <Text style={styles.webBtnText}>Open Full Real-Time GIS Fleet Map on Web ↗</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16 },
  statusBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, padding: 10, borderRadius: 8, marginBottom: 14, borderWidth: 1, borderColor: COLORS.border },
  statusDot: { marginRight: 8, fontSize: 12 },
  statusText: { color: COLORS.primary, fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  sectionHeader: { color: COLORS.textMuted, fontSize: 11, fontWeight: '800', letterSpacing: 1, marginBottom: 8 },
  unitCard: { backgroundColor: COLORS.surface, padding: 14, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border, marginBottom: 10 },
  unitCardSelected: { borderColor: COLORS.primary, backgroundColor: COLORS.surfaceLight },
  unitHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  unitName: { color: COLORS.textPrimary, fontSize: 14, fontWeight: '700' },
  badge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  badgeGreen: { backgroundColor: 'rgba(0, 229, 153, 0.15)', borderWidth: 1, borderColor: COLORS.success },
  badgeBlue: { backgroundColor: 'rgba(59, 130, 246, 0.15)', borderWidth: 1, borderColor: COLORS.info },
  badgeText: { fontSize: 10, fontWeight: '800', color: COLORS.textPrimary },
  unitType: { color: COLORS.textSecondary, fontSize: 12, marginBottom: 6 },
  unitMetaRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  metaLabel: { color: COLORS.textMuted, fontSize: 11 },
  metaVal: { color: COLORS.textPrimary, fontWeight: '700' },
  coordText: { color: '#64748B', fontSize: 10, fontFamily: 'monospace', marginTop: 4 },
  webBtn: { padding: 12, borderRadius: 8, borderWidth: 1, borderColor: COLORS.primary, alignItems: 'center', marginTop: 12 },
  webBtnText: { color: COLORS.primary, fontWeight: '700', fontSize: 12 },
});
