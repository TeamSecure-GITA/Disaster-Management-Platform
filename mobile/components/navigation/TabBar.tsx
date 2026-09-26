import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { COLORS } from '../../constants/colors';
import { ROUTES } from '../../constants/routes';

export const TabBar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();

  const tabs = [
    { label: 'Home', route: ROUTES.MAIN.HOME, icon: '🏠' },
    { label: 'Alerts', route: ROUTES.MAIN.EMERGENCY.ALERTS, icon: '🚨' },
    { label: 'SOS', route: ROUTES.MAIN.EMERGENCY.SOS, icon: '🆘', isSOS: true },
    { label: 'Live Map', route: ROUTES.MAIN.MAPS.LIVE, icon: '🗺️' },
    { label: 'AI Copilot', route: ROUTES.MAIN.AI.CHAT, icon: '🤖' },
  ];

  return (
    <View style={styles.bar}>
      {tabs.map((tab) => {
        const isActive = pathname.startsWith(tab.route);
        return (
          <TouchableOpacity
            key={tab.route}
            style={[styles.tab, tab.isSOS && styles.sosTab]}
            onPress={() => router.push(tab.route as any)}
          >
            <Text style={[styles.icon, tab.isSOS && styles.sosIcon]}>{tab.icon}</Text>
            <Text style={[styles.label, isActive && styles.activeLabel, tab.isSOS && styles.sosLabel]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    height: 64,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingBottom: 4,
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  sosTab: {
    marginTop: -20,
    backgroundColor: COLORS.emergency,
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 3,
    borderColor: COLORS.background,
  },
  icon: {
    fontSize: 20,
  },
  sosIcon: {
    fontSize: 24,
  },
  label: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: '600',
    marginTop: 2,
  },
  activeLabel: {
    color: COLORS.primary,
  },
  sosLabel: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '800',
  },
});
