import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '../../constants/colors';
import { ConnectionStatus } from '../common/ConnectionStatus';

interface HeaderProps {
  title: string;
  showBack?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ title, showBack = false }) => {
  const router = useRouter();
  return (
    <View style={styles.header}>
      <View style={styles.left}>
        {showBack && (
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>‹</Text>
          </TouchableOpacity>
        )}
        <Text style={styles.title}>{title}</Text>
      </View>
      <ConnectionStatus />
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    marginRight: 10,
    padding: 4,
  },
  backText: {
    color: COLORS.primary,
    fontSize: 28,
    lineHeight: 28,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 17,
    fontWeight: '700',
  },
});
