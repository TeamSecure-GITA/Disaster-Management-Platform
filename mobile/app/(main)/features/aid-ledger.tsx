import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Header } from '../../../components/navigation/Header';
import { COLORS } from '../../../constants/colors';
import { openWebFeature } from '../../../utils/webPortal';

export default function AidLedgerScreen() {
  const blocks = [
    { block: '#89412', hash: '0x7f9a...3b21', item: '4,000 Rice Bags (50kg)', recipient: 'Sonapur Camp', verified: 'By SDRF Officer ID #41' },
    { block: '#89411', hash: '0x12c4...aa09', item: '1,500 Water Purification Tablets', recipient: 'Jalukbari Relief Post', verified: 'By Red Cross Node' },
    { block: '#89410', hash: '0x99dd...e871', item: '250 Emergency Medical Kits', recipient: 'GMC Hospital Trauma Ward', verified: 'By Civil Surgeon Office' },
    { block: '#89409', hash: '0x44ae...01f2', item: '600 Waterproof Tarpaulin Sheets', recipient: 'Deepor Beel Cluster', verified: 'By Community Head' },
  ];

  return (
    <View style={styles.container}>
      <Header title="Aid Distribution Ledger" showBack />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heroBox}>
          <Text style={styles.heroTitle}>📦 IMMUTABLE RELIEF LEDGER</Text>
          <Text style={styles.heroSub}>
            Cryptographically sealed distribution tracking preventing aid diversion, hoarding and unauthorized displacement.
          </Text>
        </View>

        <Text style={styles.sectionHeader}>VERIFIED BLOCKCHAIN DISBURSEMENTS</Text>

        {blocks.map((b) => (
          <View key={b.block} style={styles.blockCard}>
            <View style={styles.blockTop}>
              <Text style={styles.blockNum}>{b.block}</Text>
              <Text style={styles.blockHash}>{b.hash}</Text>
            </View>
            <Text style={styles.blockItem}>{b.item}</Text>
            <Text style={styles.blockRecip}>Recipient: <Text style={{ color: COLORS.textPrimary }}>{b.recipient}</Text></Text>
            <Text style={styles.blockVerif}>✓ {b.verified}</Text>
          </View>
        ))}

        <TouchableOpacity style={styles.webBtn} onPress={() => openWebFeature('/aid-ledger')}>
          <Text style={styles.webBtnText}>Open Blockchain Block Explorer on Web ↗</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16 },
  heroBox: { backgroundColor: 'rgba(6, 182, 212, 0.12)', borderWidth: 1, borderColor: '#06b6d4', borderRadius: 10, padding: 14, marginBottom: 16 },
  heroTitle: { color: '#06b6d4', fontSize: 12, fontWeight: '800', marginBottom: 4 },
  heroSub: { color: COLORS.textSecondary, fontSize: 12, lineHeight: 17 },
  sectionHeader: { color: COLORS.textMuted, fontSize: 11, fontWeight: '800', letterSpacing: 1, marginBottom: 10 },
  blockCard: { backgroundColor: COLORS.surface, padding: 14, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border, marginBottom: 10 },
  blockTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  blockNum: { color: COLORS.primary, fontSize: 12, fontWeight: '800', fontFamily: 'monospace' },
  blockHash: { color: COLORS.textMuted, fontSize: 11, fontFamily: 'monospace' },
  blockItem: { color: COLORS.textPrimary, fontSize: 13, fontWeight: '700', marginBottom: 4 },
  blockRecip: { color: COLORS.textSecondary, fontSize: 11, marginBottom: 4 },
  blockVerif: { color: COLORS.success, fontSize: 11, fontWeight: '700' },
  webBtn: { padding: 12, borderRadius: 8, borderWidth: 1, borderColor: COLORS.primary, alignItems: 'center', marginTop: 14 },
  webBtnText: { color: COLORS.primary, fontWeight: '700', fontSize: 12 },
});
