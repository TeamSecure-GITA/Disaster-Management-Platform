import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';

export const SourceCitation: React.FC<{ source: string }> = ({ source }) => (
  <Text style={styles.citation}>Ground Source: {source}</Text>
);

const styles = StyleSheet.create({
  citation: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontStyle: 'italic',
    marginTop: 4,
  },
});
