export const EMERGENCY_NUMBERS = [
  { service: 'National Emergency Helpline', number: '112', primary: true },
  { service: 'Medical Ambulance & Trauma', number: '108', primary: true },
  { service: 'State Disaster Management Authority (SDMA)', number: '1070', primary: true },
  { service: 'Fire & Rescue Service', number: '101', primary: false },
  { service: 'Police Control Room', number: '100', primary: false },
  { service: 'NDRF Disaster Operations Control', number: '1078', primary: false },
];

export const SOS_CONFIG = {
  COUNTDOWN_SECONDS: 3,
  TELEMETRY_INTERVAL_MS: 15000,
  AUTO_CANCEL_GRACE_PERIOD_MS: 5000,
  BATTERY_LOW_THRESHOLD_PCT: 15,
};
