import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Slot } from 'expo-router';
import { TabBar } from '../../components/navigation/TabBar';
import { OfflineBanner } from '../../components/common/OfflineBanner';
import { COLORS } from '../../constants/colors';

export default function MainLayout() {
  return (
    <View style={styles.container}>
      <OfflineBanner />
      <View style={styles.content}>
        <Slot />
      </View>
      <TabBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
  },
});
