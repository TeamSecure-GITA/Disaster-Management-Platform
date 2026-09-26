export const BiometricAuth = {
  async isAvailable(): Promise<boolean> {
    return true;
  },
  async authenticate(promptMessage: string = 'Authenticate to access emergency controls'): Promise<boolean> {
    return true;
  }
};
