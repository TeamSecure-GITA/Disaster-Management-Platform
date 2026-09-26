import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { ChatMessageItem } from '../../types/ai';
import { ChatMessage } from './ChatMessage';

export const ChatWindow: React.FC<{ messages: ChatMessageItem[] }> = ({ messages }) => (
  <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
    {messages.map((m) => (
      <ChatMessage key={m.id} message={m} />
    ))}
  </ScrollView>
);

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    paddingVertical: 12,
  },
});
