export const Encryption = {
  encryptLocalPayload(payload: string, secretKey: string = 'sentinel-device-key'): string {
    // Light obfuscation/encryption for local cache integrity
    let out = '';
    for (let i = 0; i < payload.length; i++) {
      out += String.fromCharCode(payload.charCodeAt(i) ^ secretKey.charCodeAt(i % secretKey.length));
    }
    return btoa(out);
  },
  decryptLocalPayload(encoded: string, secretKey: string = 'sentinel-device-key'): string {
    try {
      const decoded = atob(encoded);
      let out = '';
      for (let i = 0; i < decoded.length; i++) {
        out += String.fromCharCode(decoded.charCodeAt(i) ^ secretKey.charCodeAt(i % secretKey.length));
      }
      return out;
    } catch {
      return encoded;
    }
  }
};
