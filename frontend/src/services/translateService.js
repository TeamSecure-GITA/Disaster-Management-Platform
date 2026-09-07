// ─────────────────────────────────────────────────────────────────────────────
// src/services/translateService.js
//
// Language detection and translation service using Google Translate API.
// Used by the AI Chatbot and Voice Assistant to support multilingual input/output.
// ─────────────────────────────────────────────────────────────────────────────

const TRANSLATE_BASE = "https://translate.googleapis.com/translate_a/single";

/**
 * Detect the language of the given text.
 * Returns an ISO 639-1 language code (e.g., "hi", "bn", "as").
 * Falls back to "en" if detection fails.
 *
 * @param {string} text - Text to detect language of
 * @returns {Promise<string>} ISO language code
 */
export async function detectLanguage(text) {
  if (!text || !text.trim()) return "en";

  try {
    const params = new URLSearchParams({
      client: "gtx",
      sl: "auto",
      tl: "en",
      dt: "t",
      q: text.slice(0, 200), // Limit to 200 chars for detection
    });

    const res = await fetch(`${TRANSLATE_BASE}?${params}`);
    if (!res.ok) return "en";

    const data = await res.json();
    // The detected language is at data[2]
    const detected = data?.[2];
    return typeof detected === "string" && detected.length >= 2 ? detected : "en";
  } catch {
    return "en";
  }
}

/**
 * Translate text from one language to another.
 * Uses Google Translate's free endpoint.
 *
 * @param {string} text - Text to translate
 * @param {string} fromLang - Source language code (or "auto" for auto-detect)
 * @param {string} toLang - Target language code
 * @returns {Promise<string>} Translated text (or original text on failure)
 */
export async function translateText(text, fromLang = "auto", toLang = "en") {
  if (!text || !text.trim()) return text;
  if (fromLang === toLang) return text;

  try {
    const params = new URLSearchParams({
      client: "gtx",
      sl: fromLang,
      tl: toLang,
      dt: "t",
      q: text,
    });

    const res = await fetch(`${TRANSLATE_BASE}?${params}`);
    if (!res.ok) return text;

    const data = await res.json();
    // data[0] contains array of translated sentence arrays
    if (Array.isArray(data?.[0])) {
      const translated = data[0]
        .filter((part) => Array.isArray(part) && part[0])
        .map((part) => part[0])
        .join("");
      return translated || text;
    }
    return text;
  } catch {
    return text;
  }
}

/**
 * Translate user input to English for AI processing, then translate AI response
 * back to the user's language.
 *
 * @param {string} userInput - The raw user input in any language
 * @param {Function} aiProcessor - Async function that takes English text and returns English response
 * @returns {Promise<{ response: string, detectedLang: string, isTranslated: boolean }>}
 */
export async function processWithTranslation(userInput, aiProcessor) {
  // Detect language
  const detectedLang = await detectLanguage(userInput);
  const isEnglish = detectedLang === "en";

  let englishInput = userInput;
  let isTranslated = false;

  // Translate to English if not already English
  if (!isEnglish) {
    englishInput = await translateText(userInput, detectedLang, "en");
    isTranslated = true;
  }

  // Process with AI (in English)
  const englishResponse = await aiProcessor(englishInput);

  // Translate response back to user's language
  let finalResponse = englishResponse;
  if (!isEnglish) {
    finalResponse = await translateText(englishResponse, "en", detectedLang);
  }

  return {
    response: finalResponse,
    detectedLang,
    isTranslated,
  };
}

// Language display names for UI
export const LANGUAGE_NAMES = {
  en: "English",
  hi: "Hindi (हिन्दी)",
  or: "Odia (ଓଡ଼ିଆ)",
  bn: "Bengali (বাংলা)",
  as: "Assamese (অসমীয়া)",
  mni: "Manipuri (মৈতৈলোন্)",
  lus: "Mizo (Mizo ṭawng)",
  brx: "Bodo (बड़ो)",
  kha: "Khasi",
  nag: "Nagamese",
  ne: "Nepali (नेपाली)",
  es: "Spanish (Español)",
  grt: "Garo (Achik)",
  sat: "Santali (ᱥᱟᱱᱛᱟᱲᱤ)",
};
