import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '../../constants/colors';
import { ROUTES } from '../../constants/routes';

interface NavSection {
  title: string;
  items: Array<{ label: string; route: string; icon: string; badge?: string }>;
}

export const Drawer: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const router = useRouter();

  const sections: NavSection[] = [
    {
      title: '⚡ CORE COMMAND HUB',
      items: [
        { label: 'All Platform Features Hub', route: ROUTES.MAIN.FEATURES.INDEX, icon: '⚡', badge: '35+ MODULES' },
        { label: 'Emergency SOS Center', route: ROUTES.MAIN.EMERGENCY.SOS, icon: '🆘', badge: '1-TAP' },
        { label: 'Live Situation Map', route: ROUTES.MAIN.MAPS.LIVE, icon: '🗺️', badge: 'GIS' },
        { label: 'Disaster Early Warnings', route: ROUTES.MAIN.EMERGENCY.ALERTS, icon: '🚨', badge: 'LIVE' },
      ],
    },
    {
      title: '🚨 IMMEDIATE CRISIS RESPONSE',
      items: [
        { label: 'Rescue Centers & Base Camps', route: ROUTES.MAIN.FEATURES.RESCUE_CENTERS, icon: '🏥' },
        { label: 'Evacuation Route Planner', route: ROUTES.MAIN.RISK.EVACUATION, icon: '🧭' },
        { label: 'Safe Shelters & Havens', route: ROUTES.MAIN.SAFETY.SHELTERS, icon: '🏕️' },
        { label: 'Rapid Damage Assessment', route: ROUTES.MAIN.FEATURES.DAMAGE_ASSESSMENT, icon: '🏚️' },
        { label: 'Live Relief Fleet Tracker', route: ROUTES.MAIN.FEATURES.RELIEF_TRACKER, icon: '🚚' },
        { label: 'Anti-Herd Dynamic Evacuation', route: ROUTES.MAIN.FEATURES.DYNAMIC_EVACUATION, icon: '🏃' },
        { label: 'Autonomous Safe Zone Tracker', route: ROUTES.MAIN.RISK.SAFE_ZONES, icon: '🛡️' },
      ],
    },
    {
      title: '🛰️ TACTICAL INTELLIGENCE',
      items: [
        { label: 'AI Emergency Copilot', route: ROUTES.MAIN.AI.CHAT, icon: '🤖' },
        { label: 'Hands-Free Voice Assistant', route: ROUTES.MAIN.AI.VOICE, icon: '🎙️' },
        { label: 'NER Landslide Telemetry', route: ROUTES.MAIN.FEATURES.NER_LANDSLIDE, icon: '⛰️' },
        { label: 'Statistics & Impact Analytics', route: ROUTES.MAIN.FEATURES.STATISTICS, icon: '📊' },
        { label: 'Climate Disaster Intelligence', route: ROUTES.MAIN.FEATURES.CLIMATE_CHRONICLE, icon: '🌍' },
        { label: 'Geotechnical Hazard Risk', route: ROUTES.MAIN.RISK.CURRENT, icon: '⚠️' },
      ],
    },
    {
      title: '📡 CONNECTIVITY & OFF-GRID MESH',
      items: [
        { label: 'Smart IoT Sensory Grid', route: ROUTES.MAIN.FEATURES.SMART_ALERTS, icon: '📡' },
        { label: 'LoRa Mesh Console', route: ROUTES.MAIN.FEATURES.MESH_CONSOLE, icon: '📻' },
        { label: 'Zero-Internet P2P Mode', route: ROUTES.MAIN.FEATURES.ZERO_INTERNET, icon: '📴' },
        { label: 'Ultra-Low 2G Bandwidth', route: ROUTES.MAIN.FEATURES.LOW_BANDWIDTH, icon: '⚡' },
        { label: 'Offline Storage & SQLite Sync', route: ROUTES.MAIN.OFFLINE.STATUS, icon: '💾' },
      ],
    },
    {
      title: '🚁 FIELD LOGISTICS & WORKFORCE',
      items: [
        { label: 'Drone Video AI Reconnaissance', route: ROUTES.MAIN.FEATURES.DRONE_ANALYTICS, icon: '🚁' },
        { label: 'Volunteer Micro-Tasking Network', route: ROUTES.MAIN.FEATURES.VOLUNTEER_TASKS, icon: '🤝' },
        { label: 'Aid Distribution Blockchain Ledger', route: ROUTES.MAIN.FEATURES.AID_LEDGER, icon: '📦' },
        { label: 'Community Reconstruction Map', route: ROUTES.MAIN.FEATURES.RECONSTRUCTION, icon: '🏗️' },
      ],
    },
    {
      title: '👨‍👩‍👧 CITIZEN & COMMUNITY SAFETY',
      items: [
        { label: 'Family Safety Circles & Radar', route: ROUTES.MAIN.SAFETY.FAMILY, icon: '👨‍👩‍👧' },
        { label: 'Digital QR Rescue ID Card', route: ROUTES.MAIN.SAFETY.FAMILY_MEMBER, icon: '🪪' },
        { label: 'Report Citizen Incident', route: ROUTES.MAIN.INCIDENTS.REPORT, icon: '📸' },
        { label: 'My Submitted Reports', route: ROUTES.MAIN.INCIDENTS.MY_REPORTS, icon: '📋' },
        { label: 'Standard Safety Action Guides', route: ROUTES.MAIN.SAFETY.GUIDE, icon: '📖' },
        { label: 'Life-Saving First Aid Manual', route: ROUTES.MAIN.SAFETY.FIRST_AID, icon: '🩺' },
        { label: 'Emergency Helplines & Numbers', route: ROUTES.MAIN.EMERGENCY.CONTACTS, icon: '📞' },
      ],
    },
    {
      title: '🔬 INNOVATION LAB (DEEP-TECH)',
      items: [
        { label: 'Hyper-Speed Rescue Suite', route: ROUTES.MAIN.FEATURES.HYPER_SPEED_RESCUE, icon: '⚡', badge: 'SUB-3M' },
        { label: 'Infrastructure Vulnerability Heatmap', route: ROUTES.MAIN.FEATURES.VULNERABILITY_MAP, icon: '🌉' },
        { label: 'AI Digital Twin 3D Simulator', route: ROUTES.MAIN.FEATURES.DIGITAL_TWIN, icon: '🏙️' },
        { label: 'Multi-Disaster Topography Suite', route: ROUTES.MAIN.FEATURES.NER_TOPOGRAPHY, icon: '🏔️' },
        { label: 'World-First Deep Tech Suite', route: ROUTES.MAIN.FEATURES.WORLD_FIRST, icon: '🔬' },
        { label: 'Decentralized SAR Radar Grid', route: ROUTES.MAIN.FEATURES.DECENTRALIZED_RESILIENCE, icon: '📡' },
        { label: 'Extreme Resilience WASM/LiFi Grid', route: ROUTES.MAIN.FEATURES.EXTREME_RESILIENCE, icon: '🧪' },
        { label: 'AR See The Risk Scanner', route: ROUTES.MAIN.FEATURES.AR_RISK, icon: '👓' },
      ],
    },
    {
      title: '⚙️ ADMINISTRATION & SUPPORT',
      items: [
        { label: 'Administrator Command Hub', route: ROUTES.MAIN.FEATURES.ADMINISTRATOR_HUB, icon: '🛡️', badge: 'HQ' },
        { label: 'Emergency SOPs & FAQ', route: ROUTES.MAIN.FEATURES.FAQ, icon: '❓' },
        { label: 'Operational Field Feedback', route: ROUTES.MAIN.FEATURES.REVIEWS, icon: '⭐' },
        { label: 'Responder Settings & Hardware', route: ROUTES.MAIN.PROFILE.SETTINGS, icon: '⚙️' },
        { label: 'Responder Profile & Credentials', route: ROUTES.MAIN.PROFILE.DETAILS, icon: '👤' },
      ],
    },
  ];

  const handleNavigate = (route: string) => {
    onClose?.();
    router.push(route as any);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerBox}>
        <Text style={styles.title}>DISASTER SENTINEL COMMAND</Text>
        <Text style={styles.sub}>Complete Tactical Navigation — All 40+ Features</Text>
      </View>
      <ScrollView contentContainerStyle={styles.list}>
        {sections.map((sec, sIdx) => (
          <View key={sIdx} style={styles.sectionBlock}>
            <Text style={styles.sectionHeader}>{sec.title}</Text>
            {sec.items.map((item, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.item}
                onPress={() => handleNavigate(item.route)}
                activeOpacity={0.7}
              >
                <Text style={styles.itemIcon}>{item.icon}</Text>
                <Text style={styles.itemLabel}>{item.label}</Text>
                {item.badge && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{item.badge}</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
    paddingTop: 44,
    paddingHorizontal: 16,
  },
  headerBox: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: 12,
    marginBottom: 8,
  },
  title: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1,
  },
  sub: {
    color: COLORS.textMuted,
    fontSize: 10,
    marginTop: 2,
  },
  list: {
    paddingBottom: 40,
  },
  sectionBlock: {
    marginTop: 14,
  },
  sectionHeader: {
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 6,
    opacity: 0.8,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    gap: 10,
  },
  itemIcon: {
    fontSize: 16,
    width: 22,
    textAlign: 'center',
  },
  itemLabel: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  badge: {
    backgroundColor: 'rgba(0, 240, 255, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  badgeText: {
    color: COLORS.primary,
    fontSize: 8,
    fontWeight: '800',
  },
});
