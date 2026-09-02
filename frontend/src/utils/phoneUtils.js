// ─────────────────────────────────────────────────────────────────────────────
// src/utils/phoneUtils.js
//
// Phone number sanitization and WhatsApp SOS URL generator for Disaster Platform
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Clean and format a phone number to international E.164 digits without '+' or spaces.
 * Returns null if the number is an emergency short code (e.g., 1070, 112, 108) or invalid.
 */
export function cleanWhatsAppNumber(phone) {
  if (!phone) return null;
  const digits = String(phone).replace(/\D/g, "");

  // Short codes like 1070, 112, 108, 911070 are landline/hotline telephone codes, not WhatsApp users
  if (digits.length < 10 || digits === "911070" || digits === "1070" || digits === "112" || digits === "108") {
    return null;
  }

  // 10-digit Indian mobile number (e.g., 9876543210 -> 919876543210)
  if (digits.length === 10) {
    return `91${digits}`;
  }

  // Standard 11-13 digit international number (e.g., 919876543210)
  if (digits.length >= 11 && digits.length <= 15) {
    return digits;
  }

  return null;
}

/**
 * Get the active emergency WhatsApp number from user profile or localStorage.
 */
export function getStoredEmergencyWhatsAppNumber() {
  try {
    const profileJson = localStorage.getItem("user_profile_data_v2");
    if (profileJson) {
      const profile = JSON.parse(profileJson);
      const cleaned =
        cleanWhatsAppNumber(profile.whatsapp) ||
        cleanWhatsAppNumber(profile.emergencyContact) ||
        cleanWhatsAppNumber(profile.phone);
      if (cleaned) return cleaned;
    }
  } catch {}

  const fromStorage =
    cleanWhatsAppNumber(localStorage.getItem("sos_whatsapp_number")) ||
    cleanWhatsAppNumber(localStorage.getItem("user_phone")) ||
    cleanWhatsAppNumber(localStorage.getItem("emergency_contact_number"));

  return fromStorage || null;
}

/**
 * Generate a WhatsApp SOS link:
 * - If a registered mobile number exists -> opens direct chat with that number.
 * - If no mobile number is stored -> opens WhatsApp Share so the user can choose ANY contact/group without getting "number not on WhatsApp" error.
 */
export function getWhatsAppUrl(message, explicitPhone = null) {
  const phone = cleanWhatsAppNumber(explicitPhone) || getStoredEmergencyWhatsAppNumber();
  const encodedMsg = encodeURIComponent(message || "🚨 EMERGENCY SOS — I need immediate help!");

  if (phone) {
    return `https://wa.me/${phone}?text=${encodedMsg}`;
  }

  // Universal WhatsApp share link (works on WhatsApp Web & Mobile)
  return `https://wa.me/?text=${encodedMsg}`;
}

/**
 * Sync phone localStorage keys (user_phone, sos_whatsapp_number, emergency_contact_number)
 * from the stored user_profile_data_v2 profile.
 *
 * Call this on app startup and after any login to guarantee the SOS / WhatsApp
 * functions always use the number the user registered with.
 */
export function syncPhoneKeysFromProfile() {
  try {
    const profileJson = localStorage.getItem("user_profile_data_v2");
    if (!profileJson) return;

    const prof = JSON.parse(profileJson);
    const cleanPh =
      cleanWhatsAppNumber(prof.whatsapp) ||
      cleanWhatsAppNumber(prof.phone);
    const cleanEm =
      cleanWhatsAppNumber(prof.emergencyContact) || cleanPh;

    if (cleanPh) localStorage.setItem("user_phone", cleanPh);
    if (cleanEm) {
      localStorage.setItem("sos_whatsapp_number", cleanEm);
      localStorage.setItem("emergency_contact_number", cleanEm);
    }
  } catch {
    // silently ignore — storage may be unavailable in private mode
  }
}
