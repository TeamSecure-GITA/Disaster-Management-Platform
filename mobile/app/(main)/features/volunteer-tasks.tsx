import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Header } from '../../../components/navigation/Header';
import { COLORS } from '../../../constants/colors';
import { openWebFeature } from '../../../utils/webPortal';

export default function VolunteerTasksScreen() {
  const [tasks, setTasks] = useState([
    { id: 'T1', title: 'Food Rations Packaging', loc: 'Dispur Stadium Camp', pts: '+50 XP', volunteers: '8 / 12 Joined', joined: false },
    { id: 'T2', title: 'Medical First Aid Triage Support', loc: 'GMC Hospital Relief Wing', pts: '+120 XP', volunteers: '4 / 6 Joined', joined: false },
    { id: 'T3', title: 'Sandbag Barrier Stacking', loc: 'Brahmaputra Embankment Km 3', pts: '+80 XP', volunteers: '18 / 20 Joined', joined: false },
    { id: 'T4', title: 'Elderly Citizen Evacuation Assistance', loc: 'Uzanbazar Ward 4', pts: '+100 XP', volunteers: '2 / 5 Joined', joined: false },
  ]);

  const handleJoin = (id: string) => {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, joined: !t.joined } : t)));
    Alert.alert('Volunteer Task Updated', 'Your responder status has been updated for this relief mission.');
  };

  return (
    <View style={styles.container}>
      <Header title="Volunteer Micro-Tasking Network" showBack />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heroBox}>
          <Text style={styles.heroTitle}>🤝 DECENTRALIZED CITIZEN MOBILIZATION</Text>
          <Text style={styles.heroSub}>
            Take on localized relief missions, earn verified field responder credentials, and support front-line disaster logistics.
          </Text>
        </View>

        <Text style={styles.sectionHeader}>OPEN RELIEF MISSIONS</Text>

        {tasks.map((t) => (
          <View key={t.id} style={styles.taskCard}>
            <View style={styles.taskHeader}>
              <Text style={styles.taskTitle}>{t.title}</Text>
              <Text style={styles.taskPts}>{t.pts}</Text>
            </View>
            <Text style={styles.taskLoc}>📍 {t.loc}</Text>
            <View style={styles.taskBottom}>
              <Text style={styles.taskVol}>👥 {t.volunteers}</Text>
              <TouchableOpacity
                style={[styles.joinBtn, t.joined && styles.joinedBtn]}
                onPress={() => handleJoin(t.id)}
              >
                <Text style={styles.joinText}>{t.joined ? 'ASSIGNED ✓' : 'ACCEPT TASK'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.webBtn} onPress={() => openWebFeature('/volunteer-tasks')}>
          <Text style={styles.webBtnText}>Open Volunteer Command Board on Web ↗</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16 },
  heroBox: { backgroundColor: 'rgba(0, 229, 153, 0.12)', borderWidth: 1, borderColor: COLORS.success, borderRadius: 10, padding: 14, marginBottom: 16 },
  heroTitle: { color: COLORS.success, fontSize: 12, fontWeight: '800', marginBottom: 4 },
  heroSub: { color: COLORS.textSecondary, fontSize: 12, lineHeight: 17 },
  sectionHeader: { color: COLORS.textMuted, fontSize: 11, fontWeight: '800', letterSpacing: 1, marginBottom: 10 },
  taskCard: { backgroundColor: COLORS.surface, padding: 14, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border, marginBottom: 10 },
  taskHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  taskTitle: { color: COLORS.textPrimary, fontSize: 13, fontWeight: '700', flex: 1 },
  taskPts: { color: COLORS.primary, fontSize: 11, fontWeight: '800' },
  taskLoc: { color: COLORS.textSecondary, fontSize: 11, marginBottom: 10 },
  taskBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  taskVol: { color: COLORS.textMuted, fontSize: 11 },
  joinBtn: { backgroundColor: COLORS.primary, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6 },
  joinedBtn: { backgroundColor: COLORS.success },
  joinText: { color: COLORS.textInverse, fontSize: 11, fontWeight: '800' },
  webBtn: { padding: 12, borderRadius: 8, borderWidth: 1, borderColor: COLORS.primary, alignItems: 'center', marginTop: 14 },
  webBtnText: { color: COLORS.primary, fontWeight: '700', fontSize: 12 },
});
