// ─────────────────────────────────────────────────────────────────────────────
// src/i18n/LanguageContext.jsx
//
// Global language context for the entire platform.
// Provides: { lang, setLang, t } where t is the resolved translation object.
// Persists language choice to localStorage (same key as Settings page).
// ─────────────────────────────────────────────────────────────────────────────
import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { translations } from "./translations";

const SETTINGS_STORAGE_KEY = "user_preferences_21";

// Map display names (used in Settings select) to locale codes
const DISPLAY_NAME_TO_CODE = {
  English: "en",
  Hindi: "hi",
  Odia: "or",
  Bengali: "bn",
  Assamese: "as",
  Manipuri: "mni",
  Mizo: "lus",
  Bodo: "brx",
  Khasi: "kha",
  Nagamese: "nag",
  Nepali: "ne",
  Spanish: "es",
  Garo: "grt",
  Santali: "sat",
};

const CODE_TO_DISPLAY = Object.fromEntries(
  Object.entries(DISPLAY_NAME_TO_CODE).map(([name, code]) => [code, name])
);

const LanguageContext = createContext({
  lang: "en",
  langDisplayName: "English",
  setLang: () => {},
  setLangByDisplayName: () => {},
  t: translations.en,
  availableLanguages: DISPLAY_NAME_TO_CODE,
});

/**
 * Read the persisted language from user_preferences_21.
 * Returns the locale code (e.g., "en", "hi").
 */
function getPersistedLangCode() {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const langValue = parsed?.language || "English";
      // Could be a display name ("Hindi") or already a code ("hi")
      return DISPLAY_NAME_TO_CODE[langValue] || langValue;
    }
  } catch {}
  return "en";
}

/**
 * Save the language to user_preferences_21 localStorage key.
 */
function persistLang(displayName) {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    const settings = raw ? JSON.parse(raw) : {};
    settings.language = displayName;
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch {}
}

export function LanguageProvider({ children }) {
  const [langCode, setLangCode] = useState(getPersistedLangCode);

  // Resolved translation with English fallback
  const t = useMemo(() => {
    const base = translations.en;
    const target = translations[langCode];
    if (!target || langCode === "en") return base;
    // Merge: target overrides base, so missing keys fall back to English
    return { ...base, ...target };
  }, [langCode]);

  const langDisplayName = CODE_TO_DISPLAY[langCode] || "English";

  // Set language by locale code (e.g., "hi")
  const setLang = (code) => {
    setLangCode(code);
    const displayName = CODE_TO_DISPLAY[code] || "English";
    persistLang(displayName);
  };

  // Set language by display name (e.g., "Hindi") — used by Settings page select
  const setLangByDisplayName = (displayName) => {
    const code = DISPLAY_NAME_TO_CODE[displayName] || "en";
    setLangCode(code);
    persistLang(displayName);
  };

  // Listen for localStorage changes from other tabs / Settings page
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === SETTINGS_STORAGE_KEY) {
        setLangCode(getPersistedLangCode());
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  return (
    <LanguageContext.Provider
      value={{
        lang: langCode,
        langDisplayName,
        setLang,
        setLangByDisplayName,
        t,
        availableLanguages: DISPLAY_NAME_TO_CODE,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

/**
 * Hook to access the language context from any component.
 */
export function useLanguage() {
  return useContext(LanguageContext);
}

export { DISPLAY_NAME_TO_CODE, CODE_TO_DISPLAY };
