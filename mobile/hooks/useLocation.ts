import { useState, useEffect } from 'react';
import { GeoCoordinates } from '../types/location';
import { LocationService } from '../services/location/location.service';

export function useLocation() {
  const [location, setLocation] = useState<GeoCoordinates>({ latitude: 25.27, longitude: 91.73, altitude: 1430 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    LocationService.getCurrentPosition().then((pos) => {
      setLocation(pos);
      setLoading(false);
    });
  }, []);

  return { location, loading };
}
