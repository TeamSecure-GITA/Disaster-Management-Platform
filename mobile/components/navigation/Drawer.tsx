import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '../../constants/colors';
import { ROUTES } from '../../constants/routes';

export const Drawer: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const router = useRouter();

  const navItems = [
    { label: 'All Platform Features Hub', route: ROUTES.MAIN.FEATURES.INDEX, icon: '⚡' },
    { label: 'Emergency SOS Center', route: ROUTES.MAIN.EMERGENCY.SOS, icon: '🆘' },
    { label: 'Live Tactical Map', route: ROUTES.MAIN.MAPS.LIVE, icon: '🗺️' },
    { label: 'Disaster Early Warnings', route: ROUTES.MAIN.EMERGENCY.ALERTS, icon: '🚨' },
    { label: 'AI Emergency Copilot', route: ROUTES.MAIN.AI.CHAT, icon: '🤖' },
    { label: 'Damage Assessment', route: ROUTES.MAIN.FEATURES.DAMAGE_ASSESSMENT, icon: '🏚️' },
    { label: 'Relief Fleet Logistics', route: ROUTES.MAIN.FEATURES.RELIEF_TRACKER, icon: '🚚' },
    { label: 'NER Landslide Telemetry', route: ROUTES.MAIN.FEATURES.NER_LANDSLIDE, icon: '⛰️' },
    { label: 'Smart IoT Sensory Grid', route: ROUTES.MAIN.FEATURES.SMART_ALERTS, icon: '📡' },
    { label: 'LoRa Mesh Console', route: ROUTES.MAIN.FEATURES.MESH_CONSOLE, icon: '📻' },
    { label: 'Zero-Internet Mesh', route: ROUTES.MAIN.FEATURES.ZERO_INTERNET, icon: '📴' },
    { label: 'Digital Twin 3D Simulator', route: ROUTES.MAIN.FEATURES.DIGITAL_TWIN, icon: '🏙️' },
    { label: 'World-First Deep-Tech', route: ROUTES.MAIN.FEATURES.WORLD_FIRST, icon: '🔬' },
    { label: 'Family Safety & QR ID', route: ROUTES.MAIN.SAFETY.FAMILY, icon: '👨‍👩‍👧' },
    { label: 'First Aid Protocols', route: ROUTES.MAIN.SAFETY.FIRST_AID, icon: '🩺' },
    { label: 'Emergency SOPs & FAQ', route: ROUTES.MAIN.FEATURES.FAQ, icon: '❓' },
    { label: 'Responder Settings', route: ROUTES.MAIN.PROFILE.SETTINGS, icon: '⚙️' },
  ];

  const handleNavigate = (route: string) => {
    onClose?.();
    router.push(route as any);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>DISASTER SENTINEL COMMAND</Text>
      <Text style={styles.sub}>Full Platform Tactical Directory</Text>
      <ScrollView contentContainerStyle={styles.list}>
        {navItems.map((item, idx) => (
          <TouchableOpacity
            key={idx}
            style={styles.item}
            onPress={() => handleNavigate(item.route)}
          >
            <Text style={styles.itemIcon}>{item.icon}</Text>
            <Text style={styles.itemLabel}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
    paddingTop: 40,
    paddingHorizontal: 16,
  },
  title: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1,
  },
  sub: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 2,
    marginBottom: 16,
  },
  list: {
    paddingBottom: 30,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 12,
  },
  itemIcon: {
    fontSize: 18,
  },
  itemLabel: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '600',
  },
});
