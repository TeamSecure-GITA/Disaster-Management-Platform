import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Header } from '../../../components/navigation/Header';
import { ChatWindow } from '../../../components/ai/ChatWindow';
import { ChatInput } from '../../../components/ai/ChatInput';
import { useAIChat } from '../../../hooks/useAIChat';
import { COLORS } from '../../../constants/colors';

export default function AIChatScreen() {
  const { messages, sendMessage, isThinking } = useAIChat();

  return (
    <View style={styles.container}>
      <Header title="AI Emergency Copilot" />
      <View style={styles.inner}>
        <ChatWindow messages={messages} />
        <ChatInput onSend={sendMessage} isThinking={isThinking} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  inner: { flex: 1, padding: 16 },
});
