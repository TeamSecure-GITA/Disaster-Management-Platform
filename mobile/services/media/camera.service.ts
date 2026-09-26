import * as ImagePicker from 'expo-image-picker';

export const CameraService = {
  async takePhoto(): Promise<string | null> {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) return null;
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      return result.assets[0].uri;
    }
    return null;
  }
};
