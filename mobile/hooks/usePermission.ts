import { useState, useEffect } from 'react';
import { LocationPermission } from '../permissions/location';
import { NotificationPermission } from '../permissions/notifications';

export function usePermission() {
  const [hasLocation, setHasLocation] = useState(false);
  const [hasNotifications, setHasNotifications] = useState(false);

  useEffect(() => {
    LocationPermission.check().then(setHasLocation);
    NotificationPermission.check().then(setHasNotifications);
  }, []);

  return { hasLocation, hasNotifications };
}
