import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Header } from '../../../components/navigation/Header';
import { COLORS } from '../../../constants/colors';
import { openWebFeature } from '../../../utils/webPortal';

export default function FAQScreen() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How does Emergency SOS broadcast work without internet?',
      a: 'When offline, Disaster Sentinel switches automatically to LoRa P2P and Bluetooth Low Energy mesh routing, passing your GPS coordinates between nearby phones until reaching a connected emergency gateway.',
    },
    {
      q: 'Where do early warning alerts come from?',
      a: 'Alerts are directly ingested from verified official state feeds including IMD (India Meteorological Department), NDMA SACHET, and CWC (Central Water Commission) hydrological gauges.',
    },
    {
      q: 'How do I locate the closest safe shelter during flash floods?',
      a: 'Navigate to Safe Shelters from the Home screen or Hub. The list is automatically sorted by straight-line and road driving distance from your live GPS location with verified capacity meters.',
    },
    {
      q: 'What is the Digital QR Rescue ID used for?',
      a: 'It provides first responders with your critical blood group, emergency contact phone numbers and known medical conditions even if you are unconscious or your phone is out of battery.',
    },
    {
      q: 'How does the LoRa hardware mesh integrate with my phone?',
      a: 'Compatible LoRa transceivers connect via USB-OTG or Bluetooth serial to relay encrypted long-range distress packets over 10-15 kilometers without cellular coverage.',
    },
  ];

  return (
    <View style={styles.container}>
      <Header title="Help & SOP Protocols (FAQ)" showBack />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heroBox}>
          <Text style={styles.heroTitle}>❓ CRISIS PROTOCOLS & PLATFORM GUIDE</Text>
          <Text style={styles.heroSub}>
            Standard Operating Procedures (SOP), offline survival guidance and common questions for responders & citizens.
          </Text>
        </View>

        <Text style={styles.sectionHeader}>FREQUENTLY ASKED QUESTIONS</Text>

        {faqs.map((f, idx) => (
          <TouchableOpacity
            key={idx}
            style={styles.card}
            onPress={() => setExpandedIndex(expandedIndex === idx ? null : idx)}
          >
            <View style={styles.questionRow}>
              <Text style={styles.questionText}>{f.q}</Text>
              <Text style={styles.expandIcon}>{expandedIndex === idx ? '▲' : '▼'}</Text>
            </View>
            {expandedIndex === idx && (
              <Text style={styles.answerText}>{f.a}</Text>
            )}
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={styles.webBtn} onPress={() => openWebFeature('/faq')}>
          <Text style={styles.webBtnText}>Open Full SOP Manual & Help Center on Web ↗</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16 },
  heroBox: { backgroundColor: 'rgba(100, 116, 139, 0.15)', borderWidth: 1, borderColor: '#64748b', borderRadius: 10, padding: 14, marginBottom: 16 },
  heroTitle: { color: '#94a3b8', fontSize: 12, fontWeight: '800', marginBottom: 4 },
  heroSub: { color: COLORS.textSecondary, fontSize: 12, lineHeight: 17 },
  sectionHeader: { color: COLORS.textMuted, fontSize: 11, fontWeight: '800', letterSpacing: 1, marginBottom: 10 },
  card: { backgroundColor: COLORS.surface, padding: 14, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border, marginBottom: 10 },
  questionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  questionText: { color: COLORS.textPrimary, fontSize: 13, fontWeight: '700', flex: 1, marginRight: 8 },
  expandIcon: { color: COLORS.primary, fontSize: 11 },
  answerText: { color: COLORS.textSecondary, fontSize: 12, lineHeight: 18, marginTop: 10, borderTopWidth: 1, borderTopColor: COLORS.borderLight, paddingTop: 8 },
  webBtn: { padding: 12, borderRadius: 8, borderWidth: 1, borderColor: COLORS.primary, alignItems: 'center', marginTop: 14 },
  webBtnText: { color: COLORS.primary, fontWeight: '700', fontSize: 12 },
});
