import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';
import { GeoCoordinates } from '../../types/location';

interface DisasterMapProps {
  center?: GeoCoordinates;
  children?: React.ReactNode;
}

export const DisasterMap: React.FC<DisasterMapProps> = ({ center, children }) => (
  <View style={styles.mapContainer}>
    <View style={styles.mapHeader}>
      <Text style={styles.mapLabel}>🗺️ OFFLINE TILE GRID — NORTHEAST CORRIDOR</Text>
      <Text style={styles.coords}>
        {center ? `${center.latitude.toFixed(4)}°N, ${center.longitude.toFixed(4)}°E` : '25.2700°N, 91.7300°E'}
      </Text>
    </View>
    <View style={styles.crosshair}>
      <Text style={styles.crossText}>+</Text>
    </View>
    {children}
  </View>
);

const styles = StyleSheet.create({
  mapContainer: {
    height: 320,
    backgroundColor: '#0F172A',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapHeader: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    padding: 8,
    borderRadius: 8,
  },
  mapLabel: {
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: '700',
  },
  coords: {
    color: COLORS.textMuted,
    fontSize: 10,
  },
  crosshair: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  crossText: {
    color: COLORS.primary,
    fontSize: 32,
    fontWeight: '300',
  },
});
