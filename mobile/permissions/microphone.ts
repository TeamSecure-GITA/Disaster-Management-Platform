import { Audio } from 'expo-av';

export const MicrophonePermission = {
  async request(): Promise<boolean> {
    const { status } = await Audio.requestPermissionsAsync();
    return status === 'granted';
  }
};
