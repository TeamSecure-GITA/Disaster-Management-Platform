import React, { useState } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { Button } from '../common/Button';
import { COLORS } from '../../constants/colors';

export const IncidentForm: React.FC<{ onSubmit: (data: { title: string; desc: string }) => void }> = ({ onSubmit }) => {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');

  return (
    <View style={styles.form}>
      <TextInput
        style={styles.input}
        placeholder="Incident Title (e.g. Flash Flood Bridge Failure)"
        placeholderTextColor={COLORS.textMuted}
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Detailed damage and life hazard description..."
        placeholderTextColor={COLORS.textMuted}
        multiline
        numberOfLines={4}
        value={desc}
        onChangeText={setDesc}
      />
      <Button title="SUBMIT DISASTER REPORT" onPress={() => onSubmit({ title, desc })} variant="emergency" />
    </View>
  );
};

const styles = StyleSheet.create({
  form: {
    gap: 12,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 8,
    color: COLORS.textPrimary,
    padding: 12,
    fontSize: 14,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
});
