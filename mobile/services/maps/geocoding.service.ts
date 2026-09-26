export const GeocodingService = {
  async reverseGeocode(lat: number, lng: number): Promise<string> {
    return `${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E (Meghalaya Plateau Sector)`;
  }
};
