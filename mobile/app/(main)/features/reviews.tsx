import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Header } from '../../../components/navigation/Header';
import { COLORS } from '../../../constants/colors';
import { openWebFeature } from '../../../utils/webPortal';

export default function ReviewsScreen() {
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState('');
  const [reviews, setReviews] = useState([
    { id: '1', user: 'Capt. R. Sharma (SDRF Field Lead)', rating: 5, date: '2 days ago', text: 'The offline mesh routing and instant QR triage saved critical hours during the Sonapur bypass landslide evacuation.' },
    { id: '2', user: 'Dr. A. Baruah (Civil Hospital Guwahati)', rating: 5, date: '5 days ago', text: 'Real-time casualty triage and blood group identification via QR Rescue ID worked seamlessly during night triage.' },
    { id: '3', user: 'Pranab D. (Community Volunteer)', rating: 4, date: '1 week ago', text: 'Offline maps loaded reliably even when 4G network was completely down. Outstanding life-saving tool.' },
  ]);

  const handleSubmit = () => {
    if (!feedback.trim()) return;
    const newRev = {
      id: Date.now().toString(),
      user: 'Verified Field Responder',
      rating,
      date: 'Just now',
      text: feedback.trim(),
    };
    setReviews([newRev, ...reviews]);
    setFeedback('');
    Alert.alert('Feedback Recorded', 'Thank you for your operational feedback and field reliability report.');
  };

  return (
    <View style={styles.container}>
      <Header title="Operational Community Feedback" showBack />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heroBox}>
          <Text style={styles.heroTitle}>⭐ FIELD RELIABILITY REVIEWS</Text>
          <Text style={styles.heroSub}>
            Direct feedback from emergency responders, NDRF/SDRF commanders, doctors and evacuated citizens.
          </Text>
        </View>

        <Text style={styles.sectionHeader}>SUBMIT FIELD REPORT / REVIEW</Text>
        <View style={styles.card}>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((s) => (
              <TouchableOpacity key={s} onPress={() => setRating(s)}>
                <Text style={[styles.starIcon, s <= rating && styles.starActive]}>★</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TextInput
            style={[styles.input, { height: 70, textAlignVertical: 'top' }]}
            multiline
            placeholder="Share your experience during emergency operations..."
            placeholderTextColor={COLORS.textMuted}
            value={feedback}
            onChangeText={setFeedback}
          />
          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
            <Text style={styles.submitBtnText}>SUBMIT FIELD REVIEW</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionHeader}>RECENT COMMUNITY FIELD REVIEWS</Text>
        {reviews.map((r) => (
          <View key={r.id} style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
              <Text style={styles.reviewUser}>{r.user}</Text>
              <Text style={styles.reviewDate}>{r.date}</Text>
            </View>
            <View style={styles.reviewStars}>
              {'★'.repeat(r.rating)}
              <Text style={{ color: COLORS.textMuted }}>{'☆'.repeat(5 - r.rating)}</Text>
            </View>
            <Text style={styles.reviewText}>{r.text}</Text>
          </View>
        ))}

        <TouchableOpacity style={styles.webBtn} onPress={() => openWebFeature('/reviews')}>
          <Text style={styles.webBtnText}>Open Community Review Portal on Web ↗</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16 },
  heroBox: { backgroundColor: 'rgba(255, 184, 0, 0.12)', borderWidth: 1, borderColor: COLORS.warning, borderRadius: 10, padding: 14, marginBottom: 16 },
  heroTitle: { color: COLORS.warning, fontSize: 12, fontWeight: '800', marginBottom: 4 },
  heroSub: { color: COLORS.textSecondary, fontSize: 12, lineHeight: 17 },
  sectionHeader: { color: COLORS.textMuted, fontSize: 11, fontWeight: '800', letterSpacing: 1, marginBottom: 10 },
  card: { backgroundColor: COLORS.surface, padding: 14, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border, marginBottom: 16 },
  starsRow: { flexDirection: 'row', gap: 6, marginBottom: 10 },
  starIcon: { fontSize: 24, color: COLORS.borderLight },
  starActive: { color: COLORS.warning },
  input: { backgroundColor: COLORS.surfaceLight, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, color: COLORS.textPrimary, borderWidth: 1, borderColor: COLORS.borderLight, fontSize: 13 },
  submitBtn: { backgroundColor: COLORS.primary, paddingVertical: 10, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  submitBtnText: { color: COLORS.textInverse, fontWeight: '800', fontSize: 12 },
  reviewCard: { backgroundColor: COLORS.surface, padding: 14, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border, marginBottom: 10 },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  reviewUser: { color: COLORS.textPrimary, fontSize: 13, fontWeight: '700', flex: 1 },
  reviewDate: { color: COLORS.textMuted, fontSize: 10 },
  reviewStars: { color: COLORS.warning, fontSize: 12, marginBottom: 6 },
  reviewText: { color: COLORS.textSecondary, fontSize: 12, lineHeight: 16 },
  webBtn: { padding: 12, borderRadius: 8, borderWidth: 1, borderColor: COLORS.primary, alignItems: 'center', marginTop: 14 },
  webBtnText: { color: COLORS.primary, fontWeight: '700', fontSize: 12 },
});
