import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';
import { Button } from '../common/Button';

interface SOSCountdownProps {
  secondsRemaining: number;
  onCancel: () => void;
}

export const SOSCountdown: React.FC<SOSCountdownProps> = ({ secondsRemaining, onCancel }) => {
  return (
    <View style={styles.overlay}>
      <Text style={styles.warningTitle}>BROADCASTING EMERGENCY SOS</Text>
      <View style={styles.timerCircle}>
        <Text style={styles.timerText}>{secondsRemaining}</Text>
      </View>
      <Text style={styles.explainer}>Disaster Dispatch & GPS Beacon activating in {secondsRemaining}s</Text>
      <Button title="CANCEL IMMEDIATE SOS" onPress={onCancel} variant="outline" style={styles.cancelBtn} />
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  warningTitle: {
    color: COLORS.emergency,
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 20,
  },
  timerCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: COLORS.emergency,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  timerText: {
    fontSize: 54,
    fontWeight: '900',
    color: '#FFF',
  },
  explainer: {
    color: COLORS.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  cancelBtn: {
    width: '100%',
    borderColor: COLORS.emergency,
  },
});
