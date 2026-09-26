import { useState } from 'react';

export function useVoice() {
  const [isListening, setIsListening] = useState(false);
  const toggleListening = () => setIsListening((v) => !v);
  return { isListening, toggleListening };
}
