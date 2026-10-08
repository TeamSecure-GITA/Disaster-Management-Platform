import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Header } from '../../../components/navigation/Header';
import { COLORS } from '../../../constants/colors';
import { openWebFeature } from '../../../utils/webPortal';

export default function DamageAssessmentScreen() {
  const [sector, setSector] = useState('Guwahati Metro Zone 2');
  const [damageType, setDamageType] = useState('Road Block / Landslide');
  const [severity, setSeverity] = useState('Severe (Level 4)');
  const [details, setDetails] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    setSubmitted(true);
    Alert.alert('Assessment Logged', 'Damage assessment successfully transmitted to Central Response HQ.');
  };

  return (
    <View style={styles.container}>
      <Header title="Damage & Resource Rapid Triage" showBack />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.kpiRow}>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiVal}>148</Text>
            <Text style={styles.kpiLbl}>Surveys Filed</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={[styles.kpiVal, { color: COLORS.warning }]}>32</Text>
            <Text style={styles.kpiLbl}>Critical Roads</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={[styles.kpiVal, { color: COLORS.emergency }]}>12</Text>
            <Text style={styles.kpiLbl}>Bridges Down</Text>
          </View>
        </View>

        <Text style={styles.sectionHeader}>LOG RAPID FIELD SURVEY</Text>

        <View style={styles.card}>
          <Text style={styles.inputLabel}>Impacted Sector / Location</Text>
          <TextInput
            style={styles.input}
            value={sector}
            onChangeText={setSector}
            placeholder="e.g. Hill Highway NH-27 Km 42"
            placeholderTextColor={COLORS.textMuted}
          />

          <Text style={styles.inputLabel}>Infrastructure Hazard Type</Text>
          <View style={styles.chipsRow}>
            {['Road Block / Landslide', 'Bridge Collapse', 'Power Grid Failure', 'Water Contamination'].map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.chip, damageType === t && styles.chipActive]}
                onPress={() => setDamageType(t)}
              >
                <Text style={[styles.chipText, damageType === t && styles.chipTextActive]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.inputLabel}>Severity Grade</Text>
          <View style={styles.chipsRow}>
            {['Moderate (Level 2)', 'Substantial (Level 3)', 'Severe (Level 4)', 'Catastrophic (Level 5)'].map((s) => (
              <TouchableOpacity
                key={s}
                style={[styles.chip, severity === s && styles.chipActiveEmergency]}
                onPress={() => setSeverity(s)}
              >
                <Text style={[styles.chipText, severity === s && styles.chipTextActive]}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.inputLabel}>Observations & Resource Requests</Text>
          <TextInput
            style={[styles.input, { height: 70, textAlignVertical: 'top' }]}
            multiline
            value={details}
            onChangeText={setDetails}
            placeholder="Specify heavy earthmover requirements, medical needs, or stranded citizen count..."
            placeholderTextColor={COLORS.textMuted}
          />

          <TouchableOpacity style={styles.actionBtn} onPress={handleSubmit}>
            <Text style={styles.actionBtnText}>SUBMIT FIELD DAMAGE REPORT</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.webBtn} onPress={() => openWebFeature('/damage-assessment')}>
          <Text style={styles.webBtnText}>Open Advanced GIS Assessment Console on Web ↗</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16 },
  kpiRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  kpiCard: { flex: 1, backgroundColor: COLORS.surface, padding: 12, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center' },
  kpiVal: { fontSize: 20, fontWeight: '800', color: COLORS.primary },
  kpiLbl: { fontSize: 10, color: COLORS.textMuted, marginTop: 4, fontWeight: '600' },
  sectionHeader: { color: COLORS.textMuted, fontSize: 11, fontWeight: '800', letterSpacing: 1, marginBottom: 8 },
  card: { backgroundColor: COLORS.surface, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, marginBottom: 16 },
  inputLabel: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '700', marginBottom: 6, marginTop: 8 },
  input: { backgroundColor: COLORS.surfaceLight, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, color: COLORS.textPrimary, borderWidth: 1, borderColor: COLORS.borderLight, fontSize: 13 },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 6 },
  chip: { backgroundColor: COLORS.surfaceLight, paddingVertical: 6, paddingHorizontal: 10, borderRadius: 6, borderWidth: 1, borderColor: COLORS.border },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipActiveEmergency: { backgroundColor: COLORS.emergency, borderColor: COLORS.emergency },
  chipText: { fontSize: 11, color: COLORS.textSecondary, fontWeight: '600' },
  chipTextActive: { color: COLORS.textInverse, fontWeight: '800' },
  actionBtn: { backgroundColor: COLORS.emergency, paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginTop: 14 },
  actionBtnText: { color: '#FFF', fontWeight: '800', fontSize: 13 },
  webBtn: { padding: 12, borderRadius: 8, borderWidth: 1, borderColor: COLORS.primary, alignItems: 'center', marginTop: 8 },
  webBtnText: { color: COLORS.primary, fontWeight: '700', fontSize: 12 },
});
