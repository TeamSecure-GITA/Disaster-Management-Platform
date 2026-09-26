import { CameraService } from '../services/media/camera.service';

export function useCamera() {
  const takePhoto = CameraService.takePhoto;
  return { takePhoto };
}
