import * as ImagePicker from 'expo-image-picker';

export const ImageService = {
  async pickImage(): Promise<string | null> {
    const result = await ImagePicker.launchImageLibraryAsync({
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
