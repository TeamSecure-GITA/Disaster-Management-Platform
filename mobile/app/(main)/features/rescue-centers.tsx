import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { Header } from '../../../components/navigation/Header';
import { COLORS } from '../../../constants/colors';
import { openWebFeature } from '../../../utils/webPortal';

interface RescueCenter {
  id: string;
  name: string;
  agency: 'NDRF' | 'SDRF' | 'Indian Army' | 'Coast Guard';
  district: string;
  phone: string;
  personnel: number;
  boats: number;
  ambulances: number;
  status: 'ACTIVE_DEPLOYED' | 'STANDBY_READY' | 'FIELD_OPERATION';
  distanceKm: number;
  coords: { lat: number; lng: number };
}

const RESCUE_CENTERS: RescueCenter[] = [
  {
    id: 'rc-1',
    name: '1st Bn NDRF Regional Response Center (RRC)',
    agency: 'NDRF',
    district: 'Guwahati, Kamrup Metro',
    phone: '0361-2840284',
    personnel: 120,
    boats: 18,
    ambulances: 6,
    status: 'ACTIVE_DEPLOYED',
    distanceKm: 4.2,
    coords: { lat: 26.18, lng: 91.73 },
  },
  {
    id: 'rc-2',
    name: 'SDRF Rapid Action Depot & Dive Team',
    agency: 'SDRF',
    district: 'Jorhat Riverine Sector',
    phone: '1070',
    personnel: 65,
    boats: 12,
    ambulances: 4,
    status: 'FIELD_OPERATION',
    distanceKm: 12.8,
    coords: { lat: 26.75, lng: 94.22 },
  },
  {
    id: 'rc-3',
    name: 'Eastern Command Field Rescue Outpost',
    agency: 'Indian Army',
    district: 'Tezpur Division',
    phone: '112',
    personnel: 240,
    boats: 24,
    ambulances: 12,
    status: 'STANDBY_READY',
    distanceKm: 28.5,
    coords: { lat: 26.65, lng: 92.80 },
  },
  {
    id: 'rc-4',
    name: '12th Bn NDRF Forward Operating Base',
    agency: 'NDRF',
    district: 'Itanagar / Doimukh',
    phone: '0360-2277112',
    personnel: 90,
    boats: 8,
    ambulances: 5,
    status: 'ACTIVE_DEPLOYED',
    distanceKm: 45.0,
    coords: { lat: 27.10, lng: 93.62 },
  },
];

export default function RescueCentersScreen() {
  const [filterAgency, setFilterAgency] = useState('All');

  const agencies = ['All', 'NDRF', 'SDRF', 'Indian Army'];

  const filtered = RESCUE_CENTERS.filter(
    (c) => filterAgency === 'All' || c.agency === filterAgency
  );

  const handleCall = (phone: string, name: string) => {
    Linking.openURL(`tel:${phone}`).catch(() => {
      Alert.alert('Call Failed', `Could not place call to ${name} (${phone}).`);
    });
  };

  const handleNavigate = (lat: number, lng: number, name: string) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    Linking.openURL(url).catch(() => {
      Alert.alert('Map Error', `Could not open navigation to ${name}.`);
    });
  };

  return (
    <View style={styles.container}>
      <Header title="Rescue Centers & Base Camps" showBack />
      <ScrollView contentContainerStyle={styles.content}>
        {/* Top Summary */}
        <View style={styles.heroCard}>
          <Text style={styles.heroTag}>🚨 SPECIALIZED RESCUE FORCES DIRECTORY</Text>
          <Text style={styles.heroTitle}>NDRF, SDRF & Military Base Camps</Text>
          <Text style={styles.heroSub}>
            Direct communication channels, personnel mobilization strength, and GPS routing to operational disaster hubs.
          </Text>
        </View>

        {/* Agency Filter */}
        <View style={styles.filterRow}>
          {agencies.map((a) => (
            <TouchableOpacity
              key={a}
              style={[styles.filterBtn, filterAgency === a && styles.filterBtnActive]}
              onPress={() => setFilterAgency(a)}
            >
              <Text style={[styles.filterText, filterAgency === a && styles.filterTextActive]}>
                {a}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Centers List */}
        <Text style={styles.sectionTitle}>ACTIVE FIELD DEPOTS ({filtered.length})</Text>

        {filtered.map((center) => (
          <View key={center.id} style={styles.centerCard}>
            <View style={styles.cardHeader}>
              <View style={styles.agencyBadge}>
                <Text style={styles.agencyText}>{center.agency}</Text>
              </View>
              <Text
                style={[
                  styles.statusText,
                  {
                    color:
                      center.status === 'ACTIVE_DEPLOYED'
                        ? COLORS.success
                        : center.status === 'FIELD_OPERATION'
                        ? COLORS.emergency
                        : COLORS.primary,
                  },
                ]}
              >
                ● {center.status.replace('_', ' ')}
              </Text>
            </View>

            <Text style={styles.centerName}>{center.name}</Text>
            <Text style={styles.centerDistrict}>📍 {center.district} • {center.distanceKm} km away</Text>

            {/* Assets Grid */}
            <View style={styles.assetsGrid}>
              <View style={styles.assetItem}>
                <Text style={styles.assetVal}>{center.personnel}</Text>
                <Text style={styles.assetLbl}>Rescuers</Text>
              </View>
              <View style={styles.assetItem}>
                <Text style={styles.assetVal}>{center.boats}</Text>
                <Text style={styles.assetLbl}>Inflatable Boats</Text>
              </View>
              <View style={styles.assetItem}>
                <Text style={styles.assetVal}>{center.ambulances}</Text>
                <Text style={styles.assetLbl}>Ambulances</Text>
              </View>
            </View>

            {/* Actions */}
            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={styles.callBtn}
                onPress={() => handleCall(center.phone, center.name)}
              >
                <Text style={styles.callBtnText}>📞 CALL ({center.phone})</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.navBtn}
                onPress={() => handleNavigate(center.coords.lat, center.coords.lng, center.name)}
              >
                <Text style={styles.navBtnText}>🧭 ROUTE</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {/* Web Radar Link */}
        <TouchableOpacity
          style={styles.webBtn}
          onPress={() => openWebFeature('/rescue-centers')}
        >
          <Text style={styles.webBtnText}>Open Full National Rescue Force Radar on Web ↗</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16, paddingBottom: 40 },
  heroCard: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderWidth: 1,
    borderColor: '#10b981',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  heroTag: { color: '#10b981', fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  heroTitle: { color: COLORS.textPrimary, fontSize: 15, fontWeight: '800', marginTop: 4, marginBottom: 4 },
  heroSub: { color: COLORS.textSecondary, fontSize: 11, lineHeight: 16 },
  filterRow: { flexDirection: 'row', gap: 6, marginBottom: 16 },
  filterBtn: {
    flex: 1,
    backgroundColor: COLORS.surface,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterBtnActive: { borderColor: COLORS.primary, backgroundColor: COLORS.surfaceLight },
  filterText: { color: COLORS.textMuted, fontSize: 11, fontWeight: '700' },
  filterTextActive: { color: COLORS.primary },
  sectionTitle: { color: COLORS.textMuted, fontSize: 11, fontWeight: '800', letterSpacing: 1, marginBottom: 10 },
  centerCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    marginBottom: 12,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  agencyBadge: {
    backgroundColor: 'rgba(0, 240, 255, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  agencyText: { color: COLORS.primary, fontSize: 10, fontWeight: '800' },
  statusText: { fontSize: 10, fontWeight: '800' },
  centerName: { color: COLORS.textPrimary, fontSize: 13, fontWeight: '700', marginBottom: 4 },
  centerDistrict: { color: COLORS.textMuted, fontSize: 11, marginBottom: 10 },
  assetsGrid: {
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 8,
    padding: 8,
    marginBottom: 12,
    justifyContent: 'space-around',
  },
  assetItem: { alignItems: 'center' },
  assetVal: { color: COLORS.textPrimary, fontSize: 14, fontWeight: '800' },
  assetLbl: { color: COLORS.textMuted, fontSize: 9, marginTop: 2 },
  actionsRow: { flexDirection: 'row', gap: 8 },
  callBtn: {
    flex: 2,
    backgroundColor: COLORS.success,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  callBtnText: { color: '#FFF', fontSize: 11, fontWeight: '800' },
  navBtn: {
    flex: 1,
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  navBtnText: { color: COLORS.primary, fontSize: 11, fontWeight: '800' },
  webBtn: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.primary,
    alignItems: 'center',
    marginTop: 8,
  },
  webBtnText: { color: COLORS.primary, fontWeight: '700', fontSize: 12 },
});
