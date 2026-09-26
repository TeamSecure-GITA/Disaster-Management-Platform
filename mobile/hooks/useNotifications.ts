import { useEffect } from 'react';
import { NotificationPermission } from '../permissions/notifications';

export function useNotifications() {
  useEffect(() => {
    NotificationPermission.request();
  }, []);
}
