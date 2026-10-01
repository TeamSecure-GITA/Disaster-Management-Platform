/**
 * smsTemplates.js
 *
 * DLT-compliant SMS templates for India (TRAI DLT, 2023).
 *
 * Rules:
 *  - Each template has a DLT_TEMPLATE_ID (registered with TRAI via your telecom operator).
 *  - Template body must match the registered wording EXACTLY – only variables (in {#var#}) differ.
 *  - Max 160 chars per single SMS; multi-part allowed for disaster alerts.
 *  - Sender ID (header): 6-char, DLT-registered (e.g. NERDMP – "NER Disaster Mgmt Platform").
 *
 * Languages supported: en, hi, as, bn, ne, or, mni, lus, nag, grt
 * (Khasi uses Latin script → en template is acceptable for now)
 * Templates marked [PLACEHOLDER] need native-speaker review before production.
 *
 * To register new templates:
 *   1. Login to your telecom operator's DLT portal (Vodafone Idea / Airtel / BSNL).
 *   2. Submit template text with category "Transactional" or "Service Implicit".
 *   3. Paste the approved Template ID into DLT_TEMPLATE_ID below.
 */

"use strict";

// ---------------------------------------------------------------------------
// Template catalogue
// Each entry exposes:
//   build(vars)  → string  – constructs the final SMS body
//   dltTemplateId          – registered template ID (placeholder until DLT approved)
//   maxLen                 – hard cap; warn if exceeded
// ---------------------------------------------------------------------------

const TEMPLATES = {

  // ── Landslide CRITICAL ────────────────────────────────────────────────────
  landslide_critical_en: {
    dltTemplateId: process.env.DLT_TMPL_LANDSLIDE_CRITICAL_EN || "1234567890123456789",
    maxLen: 320,
    build: ({ district, riskScore, rain24h, helpline }) =>
      `ALERT: CRITICAL landslide risk (score ${riskScore}/100) near ${district}. ` +
      `Rainfall 24h: ${rain24h}mm. EVACUATE steep slopes NOW. ` +
      `Helpline: ${helpline || "1077"}. -NERDMP`,
  },

  landslide_critical_hi: {
    dltTemplateId: process.env.DLT_TMPL_LANDSLIDE_CRITICAL_HI || "1234567890123456780",
    maxLen: 320,
    build: ({ district, riskScore, rain24h, helpline }) =>
      `अलर्ट: ${district} में गंभीर भूस्खलन खतरा (स्कोर ${riskScore}/100). ` +
      `24घं. वर्षा: ${rain24h}मिमी. तुरंत खड़ी ढलानें खाली करें. ` +
      `हेल्पलाइन: ${helpline || "1077"}. -NERDMP`,
  },

  landslide_critical_as: {
    dltTemplateId: process.env.DLT_TMPL_LANDSLIDE_CRITICAL_AS || "1234567890123456781",
    maxLen: 320,
    build: ({ district, riskScore, rain24h, helpline }) =>
      `সতৰ্কতা: ${district}ত গুৰুতৰ ভূমিস্খলন বিপদ (স্কোৰ ${riskScore}/100). ` +
      `24ঘ. বৃষ্টি: ${rain24h}মি.মি. এতিয়াই ঢাল এলেকা এৰক. ` +
      `হেল্পলাইন: ${helpline || "1077"}. -NERDMP`,
  },

  landslide_critical_bn: {
    dltTemplateId: process.env.DLT_TMPL_LANDSLIDE_CRITICAL_BN || "1234567890123456782",
    maxLen: 320,
    build: ({ district, riskScore, rain24h, helpline }) =>
      `সতর্কতা: ${district}-এ গুরুতর ভূমিধস ঝুঁকি (স্কোর ${riskScore}/100). ` +
      `২৪ঘ. বৃষ্টি: ${rain24h}মিমি. এখনই খাড়া ঢাল খালি করুন. ` +
      `হেল্পলাইন: ${helpline || "1077"}. -NERDMP`,
  },

  landslide_critical_ne: {
    dltTemplateId: process.env.DLT_TMPL_LANDSLIDE_CRITICAL_NE || "1234567890123456783",
    maxLen: 320,
    build: ({ district, riskScore, rain24h, helpline }) =>
      `सतर्क: ${district}मा गम्भीर पहिरो जोखिम (स्कोर ${riskScore}/100). ` +
      `२४घ. वर्षा: ${rain24h}मिमि. तुरुन्त भिरालो छोड्नुस्. ` +
      `हेल्पलाइन: ${helpline || "1077"}. -NERDMP`,
  },

  // ── Landslide HIGH ────────────────────────────────────────────────────────
  landslide_high_en: {
    dltTemplateId: process.env.DLT_TMPL_LANDSLIDE_HIGH_EN || "1234567890123456784",
    maxLen: 320,
    build: ({ district, riskScore, rain24h, helpline }) =>
      `WARNING: HIGH landslide risk (score ${riskScore}/100) near ${district}. ` +
      `Rainfall 24h: ${rain24h}mm. Stay away from slopes & rivers. ` +
      `Helpline: ${helpline || "1077"}. -NERDMP`,
  },

  landslide_high_hi: {
    dltTemplateId: process.env.DLT_TMPL_LANDSLIDE_HIGH_HI || "1234567890123456785",
    maxLen: 320,
    build: ({ district, riskScore, rain24h, helpline }) =>
      `चेतावनी: ${district} में उच्च भूस्खलन खतरा (स्कोर ${riskScore}/100). ` +
      `24घं. वर्षा: ${rain24h}मिमी. ढलान और नदियों से दूर रहें. ` +
      `हेल्पलाइन: ${helpline || "1077"}. -NERDMP`,
  },

  landslide_high_as: {
    dltTemplateId: process.env.DLT_TMPL_LANDSLIDE_HIGH_AS || "1234567890123456786",
    maxLen: 320,
    build: ({ district, riskScore, rain24h, helpline }) =>
      `সতৰ্কতা: ${district}ত উচ্চ ভূমিস্খলন বিপদ (${riskScore}/100). ` +
      `24ঘ. বৃষ্টি: ${rain24h}মি.মি. ঢাল আৰু নদীৰ পৰা আঁতৰ থাকক. ` +
      `হেল্পলাইন: ${helpline || "1077"}. -NERDMP`,
  },

  landslide_high_bn: {
    dltTemplateId: process.env.DLT_TMPL_LANDSLIDE_HIGH_BN || "1234567890123456787",
    maxLen: 320,
    build: ({ district, riskScore, rain24h, helpline }) =>
      `সতর্কতা: ${district}-এ উচ্চ ভূমিধস ঝুঁকি (${riskScore}/100). ` +
      `২৪ঘ. বৃষ্টি: ${rain24h}মিমি. ঢাল ও নদী থেকে দূরে থাকুন. ` +
      `হেল্পলাইন: ${helpline || "1077"}. -NERDMP`,
  },

  landslide_high_ne: {
    dltTemplateId: process.env.DLT_TMPL_LANDSLIDE_HIGH_NE || "1234567890123456788",
    maxLen: 320,
    build: ({ district, riskScore, rain24h, helpline }) =>
      `चेतावनी: ${district}मा उच्च पहिरो जोखिम (${riskScore}/100). ` +
      `२४घ. वर्षा: ${rain24h}मिमि. ढाल र नदीबाट टाढा बस्नुस्. ` +
      `हेल्पलाइन: ${helpline || "1077"}. -NERDMP`,
  },

  // ── Odia (or) ──────────────────────────────────────────────────────────────
  landslide_critical_or: {
    dltTemplateId: process.env.DLT_TMPL_LANDSLIDE_CRITICAL_OR || "1234567890123456793",
    maxLen: 320,
    build: ({ district, riskScore, rain24h, helpline }) =>
      `ସତର୍କ: ${district}ରେ ଗୁରୁତ୍ୱ ଭୂସ୍ଖଳନ (ସ୍କୋର ${riskScore}/100). ` +
      `24ଘ. ବର୍ଷା: ${rain24h}ମି.ମି. ତୁରନ୍ତ ଢ଼ାଲ ଛାଡ଼ନ୍ତୁ. ` +
      `ହେଲ୍ପଲାଇନ: ${helpline || "1077"}. -NERDMP`,
  },
  landslide_high_or: {
    dltTemplateId: process.env.DLT_TMPL_LANDSLIDE_HIGH_OR || "1234567890123456794",
    maxLen: 320,
    build: ({ district, riskScore, rain24h, helpline }) =>
      `ସତର୍କ: ${district}ରେ ଉଚ୍ଚ ଭୂସ୍ଖଳନ (${riskScore}/100). ` +
      `24ଘ. ବର୍ଷା: ${rain24h}ମି.ମି. ଢ଼ାଲ ଓ ନଦୀରୁ ଦୂରେ ରୁହନ୍ତୁ. ` +
      `ହେଲ୍ପଲାଇନ: ${helpline || "1077"}. -NERDMP`,
  },

  // ── Manipuri/Meitei (mni) – [PLACEHOLDER] ─────────────────────────────────
  landslide_critical_mni: {
    dltTemplateId: process.env.DLT_TMPL_LANDSLIDE_CRITICAL_MNI || "1234567890123456795",
    maxLen: 320,
    build: ({ district, riskScore, rain24h, helpline }) =>
      `Alert: ${district} lakpada CRITICAL landslide (score ${riskScore}/100). ` +
      `24h rain: ${rain24h}mm. Slope-da haina yumna. ` +
      `Helpline: ${helpline || "1077"}. -NERDMP`,
  },
  landslide_high_mni: {
    dltTemplateId: process.env.DLT_TMPL_LANDSLIDE_HIGH_MNI || "1234567890123456796",
    maxLen: 320,
    build: ({ district, riskScore, rain24h, helpline }) =>
      `Warning: ${district} lakpada HIGH landslide (${riskScore}/100). ` +
      `24h rain: ${rain24h}mm. Slope ama turel sinai. ` +
      `Helpline: ${helpline || "1077"}. -NERDMP`,
  },

  // ── Mizo/Lushai (lus) – [PLACEHOLDER] ─────────────────────────────────────
  landslide_critical_lus: {
    dltTemplateId: process.env.DLT_TMPL_LANDSLIDE_CRITICAL_LUS || "1234567890123456797",
    maxLen: 320,
    build: ({ district, riskScore, rain24h, helpline }) =>
      `Harsatna: ${district} CRITICAL leilung tlan (score ${riskScore}/100). ` +
      `24h rain: ${rain24h}mm. Chawl hnai lamah chhuak ang che. ` +
      `Helpline: ${helpline || "1077"}. -NERDMP`,
  },
  landslide_high_lus: {
    dltTemplateId: process.env.DLT_TMPL_LANDSLIDE_HIGH_LUS || "1234567890123456798",
    maxLen: 320,
    build: ({ district, riskScore, rain24h, helpline }) =>
      `Huat rawh: ${district} HIGH leilung tlan (${riskScore}/100). ` +
      `24h rain: ${rain24h}mm. Chawl hnai lam leh tuikhur atang huat rawh. ` +
      `Helpline: ${helpline || "1077"}. -NERDMP`,
  },

  // ── Nagamese (nag) – [PLACEHOLDER] ────────────────────────────────────────
  landslide_critical_nag: {
    dltTemplateId: process.env.DLT_TMPL_LANDSLIDE_CRITICAL_NAG || "1234567890123456799",
    maxLen: 320,
    build: ({ district, riskScore, rain24h, helpline }) =>
      `Alert: ${district} laage CRITICAL bhumi khisibo (score ${riskScore}/100). ` +
      `24 ghanta rain: ${rain24h}mm. Ekhoni dheere phere chhado. ` +
      `Helpline: ${helpline || "1077"}. -NERDMP`,
  },
  landslide_high_nag: {
    dltTemplateId: process.env.DLT_TMPL_LANDSLIDE_HIGH_NAG || "1234567890123456800",
    maxLen: 320,
    build: ({ district, riskScore, rain24h, helpline }) =>
      `Khabar: ${district} laage HIGH bhumi khisibo (${riskScore}/100). ` +
      `24 ghanta rain: ${rain24h}mm. Dheere phere aru nodi atka. ` +
      `Helpline: ${helpline || "1077"}. -NERDMP`,
  },

  // ── Garo (grt) – [PLACEHOLDER] ────────────────────────────────────────────
  landslide_critical_grt: {
    dltTemplateId: process.env.DLT_TMPL_LANDSLIDE_CRITICAL_GRT || "1234567890123456801",
    maxLen: 320,
    build: ({ district, riskScore, rain24h, helpline }) =>
      `Alert: ${district} lakka CRITICAL mite khisa (score ${riskScore}/100). ` +
      `24 sora rain: ${rain24h}mm. Agana mite-ko chhik\u00b7a. ` +
      `Helpline: ${helpline || "1077"}. -NERDMP`,
  },
  landslide_high_grt: {
    dltTemplateId: process.env.DLT_TMPL_LANDSLIDE_HIGH_GRT || "1234567890123456802",
    maxLen: 320,
    build: ({ district, riskScore, rain24h, helpline }) =>
      `Khabar: ${district} lakka HIGH mite khisa (${riskScore}/100). ` +
      `24 sora rain: ${rain24h}mm. Dik\u00b7gre rasta aro pul-ko cha\u00b7a. ` +
      `Helpline: ${helpline || "1077"}. -NERDMP`,
  },

  // ── Generic disaster alert ────────────────────────────────────────────────
  generic_alert_en: {
    dltTemplateId: process.env.DLT_TMPL_GENERIC_EN || "1234567890123456789",
    maxLen: 320,
    build: ({ alertType, severity, district, helpline }) =>
      `ALERT: ${severity} ${alertType} alert for ${district}. ` +
      `Follow local authority orders. Helpline: ${helpline || "1077"}. -NERDMP`,
  },

  generic_alert_hi: {
    dltTemplateId: process.env.DLT_TMPL_GENERIC_HI || "1234567890123456790",
    maxLen: 320,
    build: ({ alertType, severity, district, helpline }) =>
      `अलर्ट: ${district} में ${severity} ${alertType} चेतावनी. ` +
      `स्थानीय प्रशासन के निर्देश पालें. हेल्पलाइन: ${helpline || "1077"}. -NERDMP`,
  },

  // ── Opt-in confirmation ───────────────────────────────────────────────────
  optin_confirmation_en: {
    dltTemplateId: process.env.DLT_TMPL_OPTIN_EN || "1234567890123456791",
    maxLen: 160,
    build: ({ name }) =>
      `${name || "User"}, you are now subscribed to NER Disaster Alert SMS. ` +
      `Reply STOP to opt out. Helpline: 1077. -NERDMP`,
  },

  // ── Opt-out confirmation ──────────────────────────────────────────────────
  optout_confirmation_en: {
    dltTemplateId: process.env.DLT_TMPL_OPTOUT_EN || "1234567890123456792",
    maxLen: 160,
    build: ({ name }) =>
      `${name || "User"}, you have unsubscribed from NER Disaster Alert SMS. ` +
      `Reply START to re-subscribe. -NERDMP`,
  },
};

/**
 * Get a template by key.  Falls back to generic_alert_en if not found.
 * @param {string} key  e.g. "landslide_critical_hi"
 * @returns template object
 */
function getTemplate(key) {
  return TEMPLATES[key] || TEMPLATES["generic_alert_en"];
}

/**
 * Build an SMS body for a landslide or generic alert using the correct language template.
 * @param {Object} opts
 * @param {string} opts.alertType    "landslide" | "flood" | etc.
 * @param {string} opts.severity     "CRITICAL" | "HIGH" | "MODERATE"
 * @param {string} opts.lang         "en" | "hi" | "as" | "bn" | "ne"
 * @param {Object} opts.vars         Template variables
 * @returns {{ body: string, dltTemplateId: string }}
 */
function buildSmsBody({ alertType = "generic", severity = "HIGH", lang = "en", vars = {} }) {
  const ALL_LANGS = ["en", "hi", "as", "bn", "ne", "or", "mni", "lus", "nag", "grt"];
  const normLang = ALL_LANGS.includes(lang) ? lang : "en";
  const normSeverity = severity.toLowerCase();

  let key;
  if (alertType === "landslide" && ["critical", "high"].includes(normSeverity)) {
    key = `landslide_${normSeverity}_${normLang}`;
  } else {
    key = `generic_alert_${normLang}`;
  }

  const tmpl = getTemplate(key);
  const body = tmpl.build(vars);

  // Warn if over DLT character limit
  if (body.length > tmpl.maxLen) {
    console.warn(`[SMS Templates] Template "${key}" exceeded maxLen (${body.length}/${tmpl.maxLen})`);
  }

  return { body, dltTemplateId: tmpl.dltTemplateId };
}

module.exports = { getTemplate, buildSmsBody, TEMPLATES };
