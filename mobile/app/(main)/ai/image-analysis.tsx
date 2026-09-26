import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Header } from '../../../components/navigation/Header';
import { ImageUpload } from '../../../components/ai/ImageUpload';
import { CameraService } from '../../../services/media/camera.service';
import { COLORS } from '../../../constants/colors';

export default function ImageAnalysisScreen() {
  const [result, setResult] = useState<string | null>(null);

  const handlePick = async () => {
    const uri = await CameraService.takePhoto();
    if (uri) {
      setResult('Structural damage classified: MODERATE (Debris density 35%, roof intact)');
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Aerial & Drone Damage Analysis" showBack />
      <View style={styles.content}>
        <ImageUpload onPickImage={handlePick} />
        {result && <Text style={styles.resText}>Analysis: {result}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16 },
  resText: { color: COLORS.primary, marginTop: 16, fontSize: 14, fontWeight: '700' },
});
