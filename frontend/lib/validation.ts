/**
 * Lightweight schema & input validation helpers
 */

export function validateCoordinates(lat: number, lng: number): boolean {
  return (
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
}

export function validateSOSPayload(payload: {
  lat?: number;
  lng?: number;
  contact?: string;
  emergencyType?: string;
}): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (payload.lat === undefined || payload.lng === undefined) {
    errors.push('Geographical coordinates are required for emergency dispatch.');
  } else if (!validateCoordinates(payload.lat, payload.lng)) {
    errors.push('Provided geographical coordinates are out of bounds.');
  }

  if (!payload.emergencyType || payload.emergencyType.trim().length === 0) {
    errors.push('Emergency type must be specified.');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
