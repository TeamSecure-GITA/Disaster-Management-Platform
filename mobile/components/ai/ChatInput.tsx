import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';

export const ChatInput: React.FC<{ onSend: (text: string) => void; isThinking?: boolean }> = ({ onSend, isThinking }) => {
  const [text, setText] = useState('');

  const handleSend = () => {
    if (!text.trim() || isThinking) return;
    onSend(text.trim());
    setText('');
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Ask emergency instructions, safe routes..."
        placeholderTextColor={COLORS.textMuted}
        value={text}
        onChangeText={setText}
      />
      <TouchableOpacity onPress={handleSend} style={styles.sendBtn}>
        <Text style={styles.sendText}>➤</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  input: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 14,
    paddingHorizontal: 8,
  },
  sendBtn: {
    backgroundColor: COLORS.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendText: {
    color: '#090D16',
    fontWeight: '900',
  },
});
