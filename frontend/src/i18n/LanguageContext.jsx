// ─────────────────────────────────────────────────────────────────────────────
// src/i18n/LanguageContext.jsx
//
// Global language context for the entire platform.
// Provides: { lang, langDisplayName, setLang, setLangByDisplayName, t }
// Features:
// 1. Full dictionary translations across all supported languages (including all North-Eastern India languages).
// 2. Full-Page Vernacular Translation Engine: instantly converts the entire DOM across all pages and features.
// 3. Auto-sync with localStorage across tabs and settings.
// ─────────────────────────────────────────────────────────────────────────────
import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
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

/**
 * Full-page DOM translation engine:
 * Sets translation cookies and connects with Google Translate engine
 * so every page, component, table, card, and button is translated.
 */
function applyFullPageTranslation(targetCode) {
  try {
    const host = window.location.hostname;
    if (targetCode === "en") {
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${host};`;
      const select = document.querySelector(".goog-te-combo");
      if (select) {
        select.value = "en";
        select.dispatchEvent(new Event("change"));
      }
      return;
    }

    // Set cookie for automatic full-page translation
    document.cookie = `googtrans=/en/${targetCode}; path=/;`;
    document.cookie = `googtrans=/en/${targetCode}; path=/; domain=${host};`;

    // Ensure hidden Google Translate element exists
    if (!document.getElementById("google_translate_element")) {
      const container = document.createElement("div");
      container.id = "google_translate_element";
      container.style.display = "none";
      document.body.appendChild(container);
    }

    // Load Google Translate script if not loaded
    if (!document.getElementById("google-translate-script")) {
      window.googleTranslateElementInit = function () {
        try {
          new window.google.translate.TranslateElement(
            {
              pageLanguage: "en",
              autoDisplay: false,
              layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
            },
            "google_translate_element"
          );
          setTimeout(() => {
            const select = document.querySelector(".goog-te-combo");
            if (select) {
              select.value = targetCode;
              select.dispatchEvent(new Event("change"));
            }
          }, 400);
        } catch {}
      };

      const script = document.createElement("script");
      script.id = "google-translate-script";
      script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);
    } else {
      // Script already loaded, trigger combo
      const select = document.querySelector(".goog-te-combo");
      if (select) {
        select.value = targetCode;
        select.dispatchEvent(new Event("change"));
      }
    }
  } catch (e) {
    console.warn("[i18n] Full-page translation engine notice:", e);
  }
}

export function LanguageProvider({ children }) {
  const [langCode, setLangCode] = useState(getPersistedLangCode);

  // Resolved translation with English fallback
  const t = useMemo(() => {
    const base = translations.en;
    const target = translations[langCode];
    if (!target || langCode === "en") return base;
    return { ...base, ...target };
  }, [langCode]);

  const langDisplayName = CODE_TO_DISPLAY[langCode] || "English";

  // Set language by locale code (e.g., "hi")
  const setLang = useCallback((code) => {
    setLangCode(code);
    const displayName = CODE_TO_DISPLAY[code] || "English";
    persistLang(displayName);
    applyFullPageTranslation(code);
  }, []);

  // Set language by display name (e.g., "Odia")
  const setLangByDisplayName = useCallback((displayName) => {
    const code = DISPLAY_NAME_TO_CODE[displayName] || "en";
    setLangCode(code);
    persistLang(displayName);
    applyFullPageTranslation(code);
  }, []);

  // Sync on initial mount
  useEffect(() => {
    const initialCode = getPersistedLangCode();
    if (initialCode && initialCode !== "en") {
      applyFullPageTranslation(initialCode);
    }
  }, []);

  // Listen for localStorage changes from other tabs / Settings page
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === SETTINGS_STORAGE_KEY) {
        const newCode = getPersistedLangCode();
        setLangCode(newCode);
        applyFullPageTranslation(newCode);
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
