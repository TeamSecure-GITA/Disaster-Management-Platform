import { Camera } from 'expo-camera';

export const CameraPermission = {
  async request(): Promise<boolean> {
    const { status } = await Camera.requestCameraPermissionsAsync();
    return status === 'granted';
  }
};
