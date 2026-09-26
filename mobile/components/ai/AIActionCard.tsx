import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { COLORS } from '../../constants/colors';

export const AIActionCard: React.FC<{ title: string; actionText: string; onAction: () => void }> = ({
  title,
  actionText,
  onAction,
}) => (
  <Card style={styles.card}>
    <Text style={styles.title}>{title}</Text>
    <Button title={actionText} onPress={onAction} variant="primary" style={styles.btn} />
  </Card>
);

const styles = StyleSheet.create({
  card: {
    marginBottom: 8,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  btn: {
    height: 38,
  },
});
