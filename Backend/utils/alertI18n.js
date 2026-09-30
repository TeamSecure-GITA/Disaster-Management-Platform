/**
 * alertI18n.js – Send-time language selection for alert content.
 *
 * Strategy:
 *  1. Build the base alert in English.
 *  2. Generate translated variants for every supported NER language.
 *  3. At dispatch time, pick the variant matching the recipient's preferredLanguage.
 *
 * Supported languages:
 *   en  – English (default)
 *   hi  – Hindi
 *   as  – Assamese
 *   bn  – Bengali
 *   ne  – Nepali (Sikkim / parts of Meghalaya)
 *   kha – Khasi (Meghalaya)
 */

// ---------------------------------------------------------------------------
// Static template catalogue
// Each entry: { [lang]: { titleFn(ctx), messageFn(ctx), instructionsFn(ctx) } }
// ctx = { alertType, severity, district, riskScore, rain24h, rain72h }
// ---------------------------------------------------------------------------

const LANDSLIDE_TEMPLATES = {
  en: {
    title: (c) =>
      `⚠️ Landslide Risk ${c.severity.toUpperCase()} – ${c.district}`,
    message: (c) =>
      `A landslide risk of ${c.severity.toUpperCase()} (score ${c.riskScore}/100) has been detected near ${c.district}. Rainfall in the last 24 h: ${c.rain24h} mm. 72-h accumulation: ${c.rain72h} mm.`,
    instructions: () => [
      "Evacuate steep-slope areas immediately if ordered.",
      "Avoid roads and bridges near rivers.",
      "Listen to All India Radio / Doordarshan for updates.",
      "Contact district emergency helpline: 1077.",
    ],
  },
  hi: {
    title: (c) =>
      `⚠️ भूस्खलन जोखिम ${c.severity.toUpperCase()} – ${c.district}`,
    message: (c) =>
      `${c.district} के निकट भूस्खलन जोखिम ${c.severity.toUpperCase()} (स्कोर ${c.riskScore}/100) का पता चला है। पिछले 24 घंटों में वर्षा: ${c.rain24h} मिमी। 72 घंटे की संचयी वर्षा: ${c.rain72h} मिमी।`,
    instructions: () => [
      "आदेश मिलने पर तुरंत खड़ी ढलान वाले क्षेत्रों को खाली करें।",
      "नदियों के पास सड़कों और पुलों से बचें।",
      "अपडेट के लिए ऑल इंडिया रेडियो सुनें।",
      "जिला आपातकालीन हेल्पलाइन: 1077।",
    ],
  },
  as: {
    title: (c) =>
      `⚠️ ভূমিস্খলনৰ আশংকা ${c.severity.toUpperCase()} – ${c.district}`,
    message: (c) =>
      `${c.district}ৰ ওচৰত ভূমিস্খলনৰ আশংকা ${c.severity.toUpperCase()} (স্কোৰ ${c.riskScore}/100) ধৰা পৰিছে। শেষ ২৪ ঘণ্টাত বৃষ্টিপাত: ${c.rain24h} মি.মি.। ৭২ ঘণ্টাৰ সঞ্চিত বৃষ্টিপাত: ${c.rain72h} মি.মি.।`,
    instructions: () => [
      "নিৰ্দেশ পালে তীব্ৰ ঢাল থকা এলেকা তৎক্ষণাৎ খালী কৰক।",
      "নদীৰ ওচৰৰ পথ আৰু দলংৰ পৰা বিৰত থাকক।",
      "অল ইণ্ডিয়া ৰেডিঅ' শুনক।",
      "জিলা জৰুৰীকালীন হেল্পলাইন: 1077।",
    ],
  },
  bn: {
    title: (c) =>
      `⚠️ ভূমিধস ঝুঁকি ${c.severity.toUpperCase()} – ${c.district}`,
    message: (c) =>
      `${c.district} এর কাছে ভূমিধসের ঝুঁকি ${c.severity.toUpperCase()} (স্কোর ${c.riskScore}/100) সনাক্ত হয়েছে। গত ২৪ ঘণ্টায় বৃষ্টিপাত: ${c.rain24h} মিমি। ৭২ ঘণ্টার বৃষ্টি: ${c.rain72h} মিমি।`,
    instructions: () => [
      "নির্দেশ পেলে খাড়া ঢালু এলাকা তাৎক্ষণিকভাবে খালি করুন।",
      "নদীর কাছে রাস্তা ও সেতু এড়িয়ে চলুন।",
      "আকাশবাণী শুনুন।",
      "জেলা জরুরি হেল্পলাইন: 1077।",
    ],
  },
  ne: {
    title: (c) =>
      `⚠️ पहिरो जोखिम ${c.severity.toUpperCase()} – ${c.district}`,
    message: (c) =>
      `${c.district} नजिकै पहिरोको जोखिम ${c.severity.toUpperCase()} (स्कोर ${c.riskScore}/100) पत्ता लागेको छ। पछिल्लो २४ घण्टामा वर्षा: ${c.rain24h} मिमी। ७२ घण्टाको संचित वर्षा: ${c.rain72h} मिमी।`,
    instructions: () => [
      "आदेश भएमा तुरुन्तै ठाडो भिरालो क्षेत्र खाली गर्नुस्।",
      "नदी नजिकका सडक र पुलबाट टाढा बस्नुस्।",
      "अखिल भारत रेडियो सुन्नुस्।",
      "जिल्ला आपत्कालीन हेल्पलाइन: 1077।",
    ],
  },
  kha: {
    title: (c) =>
      `⚠️ Saiñ Landslide ${c.severity.toUpperCase()} – ${c.district}`,
    message: (c) =>
      `Katto landslide risk ${c.severity.toUpperCase()} (score ${c.riskScore}/100) da ${c.district}. Jingwoh 24 snem: ${c.rain24h} mm. 72 snem: ${c.rain72h} mm.`,
    instructions: () => [
      "Mih ha shnong bad maw da ngi pynmih.",
      "Shim ha ïew bad ïing na maw.",
      "Sngewbha AIR.",
      "Helpline jingim: 1077.",
    ],
  },
};

// Generic hazard template (flood, cyclone, etc.)
const GENERIC_TEMPLATES = {
  en: {
    title: (c) => `⚠️ ${_cap(c.alertType)} Alert ${c.severity.toUpperCase()} – ${c.district}`,
    message: (c) =>
      `A ${c.alertType} alert of severity ${c.severity} has been issued for ${c.district}. Please follow instructions from local authorities.`,
    instructions: () => [
      "Follow evacuation orders from local authorities.",
      "Keep emergency contacts handy.",
      "Contact district emergency helpline: 1077.",
    ],
  },
  hi: {
    title: (c) => `⚠️ ${_cap(c.alertType)} अलर्ट ${c.severity.toUpperCase()} – ${c.district}`,
    message: (c) =>
      `${c.district} में ${c.alertType} का ${c.severity} स्तर का अलर्ट जारी किया गया है। स्थानीय अधिकारियों के निर्देशों का पालन करें।`,
    instructions: () => [
      "स्थानीय प्रशासन के निर्देशों का पालन करें।",
      "आपातकालीन संपर्क तैयार रखें।",
      "जिला आपातकालीन हेल्पलाइन: 1077।",
    ],
  },
  as: {
    title: (c) => `⚠️ ${_cap(c.alertType)} সতৰ্কতা ${c.severity.toUpperCase()} – ${c.district}`,
    message: (c) =>
      `${c.district}ত ${c.alertType}ৰ ${c.severity} মাত্ৰাৰ সতৰ্কতা জাৰি কৰা হৈছে।`,
    instructions: () => ["স্থানীয় কৰ্তৃপক্ষৰ নিৰ্দেশ পালন কৰক।", "জৰুৰীকালীন হেল্পলাইন: 1077।"],
  },
  bn: {
    title: (c) => `⚠️ ${_cap(c.alertType)} সতর্কতা ${c.severity.toUpperCase()} – ${c.district}`,
    message: (c) =>
      `${c.district}-এ ${c.alertType} সতর্কতা জারি হয়েছে (মাত্রা: ${c.severity})।`,
    instructions: () => ["স্থানীয় কর্তৃপক্ষের নির্দেশ অনুসরণ করুন।", "হেল্পলাইন: 1077।"],
  },
  ne: {
    title: (c) => `⚠️ ${_cap(c.alertType)} अलर्ट ${c.severity.toUpperCase()} – ${c.district}`,
    message: (c) =>
      `${c.district}मा ${c.alertType} को ${c.severity} स्तरको अलर्ट जारी गरिएको छ।`,
    instructions: () => ["स्थानीय अधिकारीको निर्देशन पालना गर्नुस्।", "हेल्पलाइन: 1077।"],
  },
  kha: {
    title: (c) => `⚠️ ${_cap(c.alertType)} Alert ${c.severity.toUpperCase()} – ${c.district}`,
    message: (c) =>
      `${c.district} da ${c.alertType} alert ${c.severity} da jingmut.`,
    instructions: () => ["Sngewbha ia ki bynta jong ki shynrang.", "Helpline: 1077."],
  },
};

const SUPPORTED_LANGS = ["en", "hi", "as", "bn", "ne", "kha"];

function _cap(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : "";
}

/**
 * Build a localizedContent array for all supported languages.
 * @param {Object} ctx
 * @param {string} ctx.alertType
 * @param {string} ctx.severity
 * @param {string} ctx.district
 * @param {number} [ctx.riskScore]
 * @param {number} [ctx.rain24h]
 * @param {number} [ctx.rain72h]
 * @returns {Array<{lang, title, message, instructions}>}
 */
function buildLocalizedContent(ctx) {
  const templates =
    ctx.alertType === "landslide" ? LANDSLIDE_TEMPLATES : GENERIC_TEMPLATES;

  return SUPPORTED_LANGS.map((lang) => {
    const t = templates[lang] || templates["en"];
    return {
      lang,
      title: t.title(ctx),
      message: t.message(ctx),
      instructions: t.instructions(ctx),
    };
  });
}

/**
 * Resolve the best localised variant for a recipient.
 * Falls back to English if the recipient's lang is not available.
 * @param {Array} localizedContent
 * @param {string} preferredLang  – e.g. "as"
 * @returns {{ title, message, instructions }}
 */
function resolveForRecipient(localizedContent = [], preferredLang = "en") {
  const found =
    localizedContent.find((c) => c.lang === preferredLang) ||
    localizedContent.find((c) => c.lang === "en");

  if (!found) {
    return { title: null, message: null, instructions: [] };
  }
  return { title: found.title, message: found.message, instructions: found.instructions };
}

module.exports = { buildLocalizedContent, resolveForRecipient, SUPPORTED_LANGS };
