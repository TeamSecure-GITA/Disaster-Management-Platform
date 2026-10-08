import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '../../constants/colors';
import { ROUTES } from '../../constants/routes';
import { ConnectionStatus } from '../common/ConnectionStatus';
import { Drawer } from './Drawer';

interface HeaderProps {
  title: string;
  showBack?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ title, showBack = false }) => {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <View style={styles.header}>
        <View style={styles.left}>
          {showBack ? (
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Text style={styles.backText}>‹</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => setMenuOpen(true)} style={styles.menuBtn}>
              <Text style={styles.menuIcon}>☰</Text>
            </TouchableOpacity>
          )}
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
        </View>
        <View style={styles.right}>
          <ConnectionStatus />
          <TouchableOpacity
            onPress={() => router.push(ROUTES.MAIN.FEATURES.INDEX as any)}
            style={styles.hubBtn}
            accessibilityLabel="Open all platform features"
          >
            <Text style={styles.hubText}>⚡ Hub</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Modal
        visible={menuOpen}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setMenuOpen(false)}
      >
        <View style={{ flex: 1, backgroundColor: COLORS.surface }}>
          <View style={styles.modalCloseBar}>
            <TouchableOpacity onPress={() => setMenuOpen(false)} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕ CLOSE NAVIGATION</Text>
            </TouchableOpacity>
          </View>
          <Drawer onClose={() => setMenuOpen(false)} />
        </View>
      </Modal>
    </>
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
    flex: 1,
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
  menuBtn: {
    marginRight: 10,
    padding: 6,
    borderRadius: 6,
    backgroundColor: COLORS.surface,
  },
  menuIcon: {
    color: COLORS.primary,
    fontSize: 18,
    fontWeight: '800',
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '700',
    flexShrink: 1,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  hubBtn: {
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  hubText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '800',
  },
  modalCloseBar: {
    backgroundColor: COLORS.background,
    paddingTop: 48,
    paddingHorizontal: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  closeBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: COLORS.emergency,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  closeBtnText: {
    color: COLORS.emergency,
    fontSize: 11,
    fontWeight: '800',
  },
});
