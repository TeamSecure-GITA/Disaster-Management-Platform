export const Validation = {
  isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  },
  isValidPhone(phone: string): boolean {
    return /^\+?[0-9]{10,14}$/.test(phone.replace(/[\s-]/g, ''));
  },
  isValidPassword(password: string): boolean {
    return password.length >= 8;
  },
  isValidCoordinates(lat: number, lng: number): boolean {
    return !isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
  }
};
