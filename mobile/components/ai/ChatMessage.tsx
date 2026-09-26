import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ChatMessageItem } from '../../types/ai';
import { COLORS } from '../../constants/colors';

export const ChatMessage: React.FC<{ message: ChatMessageItem }> = ({ message }) => {
  const isUser = message.role === 'user';
  return (
    <View style={[styles.bubble, isUser ? styles.userBubble : styles.botBubble]}>
      <Text style={styles.role}>{isUser ? 'YOU' : 'AI SENTINEL ASSISTANT'}</Text>
      <Text style={styles.content}>{message.content}</Text>
      {message.isOfflineExpertResponse && (
        <Text style={styles.offlineTag}>⚡ Verified Offline Disaster Knowledgebase</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  bubble: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    maxWidth: '85%',
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  botBubble: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  role: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  content: {
    color: COLORS.textPrimary,
    fontSize: 14,
    lineHeight: 20,
  },
  offlineTag: {
    color: COLORS.warning,
    fontSize: 10,
    fontWeight: '700',
    marginTop: 6,
  },
});
