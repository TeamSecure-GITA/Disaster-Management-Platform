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
 *   or  – Odia
 *   as  – Assamese
 *   bn  – Bengali
 *   mni – Manipuri / Meitei
 *   lus – Mizo (Lushai)
 *   kha – Khasi (Meghalaya)
 *   nag – Nagamese (Nagaland Creole)
 *   ne  – Nepali (Sikkim / parts of Meghalaya)
 *   grt – Garo (Meghalaya)
 *
 * NOTE: Templates marked "// [PLACEHOLDER – native-speaker review needed]"
 * are machine-derived approximations and MUST be reviewed by a fluent
 * speaker before production use.
 */

"use strict";

// ---------------------------------------------------------------------------
// Static template catalogue
// Each entry: { [lang]: { titleFn(ctx), messageFn(ctx), instructionsFn(ctx) } }
// ctx = { alertType, severity, district, riskScore, rain24h, rain72h }
// ---------------------------------------------------------------------------

// Helper: capitalise first letter
function _cap(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : ""; }

// ---------------------------------------------------------------------------
// Escalation message templates – for alertEscalationService
// ctx = { title, message, fromRole, toRole, slaMinutes }
// ---------------------------------------------------------------------------
const ESCALATION_TEMPLATES = {
  en: {
    escalatedTitle: (c) => `[ESCALATED] ${c.title}`,
    escalatedMsg:   (c) =>
      `No acknowledgement from ${c.fromRole.toUpperCase()} within ${c.slaMinutes} min. Escalated to ${c.toRole.toUpperCase()}.\n\n${c.message}`,
  },
  hi: {
    escalatedTitle: (c) => `[बढ़ाया गया] ${c.title}`,
    escalatedMsg:   (c) =>
      `${c.slaMinutes} मिनट के भीतर ${c.fromRole.toUpperCase()} से कोई पावती नहीं मिली। ${c.toRole.toUpperCase()} को भेजा गया।\n\n${c.message}`,
  },
  or: {
    escalatedTitle: (c) => `[ଉନ୍ନୀତ] ${c.title}`,
    escalatedMsg:   (c) =>
      `${c.slaMinutes} ମିନିଟ ମଧ୍ୟରେ ${c.fromRole.toUpperCase()}ରୁ ସ୍ୱୀକୃତି ମିଳିଲା ନାହିଁ। ${c.toRole.toUpperCase()}କୁ ଉନ୍ନୀତ।\n\n${c.message}`,
  },
  as: {
    escalatedTitle: (c) => `[উন্নীত] ${c.title}`,
    escalatedMsg:   (c) =>
      `${c.slaMinutes} মিনিটৰ ভিতৰত ${c.fromRole.toUpperCase()}ৰ পৰা কোনো স্বীকৃতি পোৱা নগ'ল। ${c.toRole.toUpperCase()}লৈ উন্নীত।\n\n${c.message}`,
  },
  bn: {
    escalatedTitle: (c) => `[এস্কেলেটেড] ${c.title}`,
    escalatedMsg:   (c) =>
      `${c.slaMinutes} মিনিটের মধ্যে ${c.fromRole.toUpperCase()} থেকে কোনো স্বীকৃতি পাওয়া যায়নি। ${c.toRole.toUpperCase()}-এ এস্কেলেট করা হয়েছে।\n\n${c.message}`,
  },
  mni: { // [PLACEHOLDER – native-speaker review needed]
    escalatedTitle: (c) => `[Escalated] ${c.title}`,
    escalatedMsg:   (c) =>
      `${c.slaMinutes} minute nung ${c.fromRole.toUpperCase()} gi acknowledge toubara. ${c.toRole.toUpperCase()}-da escalate tounai.\n\n${c.message}`,
  },
  lus: { // [PLACEHOLDER – native-speaker review needed]
    escalatedTitle: (c) => `[Chhuahsan] ${c.title}`,
    escalatedMsg:   (c) =>
      `${c.fromRole.toUpperCase()} hnenah ${c.slaMinutes} min chhung acknowledge nei lo. ${c.toRole.toUpperCase()} hnenah thawn a ni.\n\n${c.message}`,
  },
  kha: {
    escalatedTitle: (c) => `[Escalated] ${c.title}`,
    escalatedMsg:   (c) =>
      `Katto acknowledge noh ${c.fromRole.toUpperCase()} ha ${c.slaMinutes} min. Escalate sha ${c.toRole.toUpperCase()}.\n\n${c.message}`,
  },
  nag: { // [PLACEHOLDER – native-speaker review needed]
    escalatedTitle: (c) => `[Barra pathabo] ${c.title}`,
    escalatedMsg:   (c) =>
      `${c.fromRole.toUpperCase()} theke ${c.slaMinutes} min bhitore kono jawab nai. ${c.toRole.toUpperCase()}-ke pathano hoise.\n\n${c.message}`,
  },
  ne: {
    escalatedTitle: (c) => `[उठाइएको] ${c.title}`,
    escalatedMsg:   (c) =>
      `${c.slaMinutes} मिनेटभित्र ${c.fromRole.toUpperCase()} बाट कुनै स्वीकृति छैन। ${c.toRole.toUpperCase()}मा उठाइयो।\n\n${c.message}`,
  },
  grt: { // [PLACEHOLDER – native-speaker review needed]
    escalatedTitle: (c) => `[Ong·chikan] ${c.title}`,
    escalatedMsg:   (c) =>
      `${c.slaMinutes} minute ong·de ${c.fromRole.toUpperCase()} begen acknowledge man·a. ${c.toRole.toUpperCase()}-ko pathabo.\n\n${c.message}`,
  },
};

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
  or: {
    title: (c) =>
      `⚠️ ଭୂସ୍ଖଳନ ଆଶଙ୍କା ${c.severity.toUpperCase()} – ${c.district}`,
    message: (c) =>
      `${c.district} ନିକଟ ଭୂସ୍ଖଳନ ଆଶଙ୍କା ${c.severity.toUpperCase()} (ସ୍କୋର ${c.riskScore}/100) ଚିହ୍ନଟ ହୋଇଛି। ଗତ 24 ଘଣ୍ଟାରେ ବର୍ଷା: ${c.rain24h} ମି.ମି.। 72 ଘଣ୍ଟାର ସଞ୍ଚିତ ବର୍ଷା: ${c.rain72h} ମି.ମି.।`,
    instructions: () => [
      "ନିର୍ଦ୍ଦେଶ ମିଳିଲେ ତୁରନ୍ତ ଢ଼ାଲ ଅଞ୍ଚଳ ଛାଡ଼ନ୍ତୁ।",
      "ନଦୀ ନିକଟ ସ଼ଡ଼କ ଓ ପୋଲ ଏଡ଼ାନ୍ତୁ।",
      "ଅଲ ଇଣ୍ଡିଆ ରେଡ଼ିଓ ଶୁଣନ୍ତୁ।",
      "ଜିଲ୍ଲା ଜରୁରୀ ହେଲ୍ପଲାଇନ: 1077।",
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
  mni: { // [PLACEHOLDER – native-speaker review needed]
    title: (c) =>
      `⚠️ Landslide anishuba ${c.severity.toUpperCase()} – ${c.district}`,
    message: (c) =>
      `${c.district} lakpada landslide anishuba ${c.severity.toUpperCase()} (score ${c.riskScore}/100) thengnanai. 24 chana rain: ${c.rain24h} mm. 72 chana: ${c.rain72h} mm.`,
    instructions: () => [
      "Ningthou thambal oirakle mateng slope yi leibak chatlaga yumna.",
      "Makhol khongchat ama turel sinai pakhangba.",
      "All India Radio kangba.",
      "District emergency helpline: 1077.",
    ],
  },
  lus: { // [PLACEHOLDER – native-speaker review needed]
    title: (c) =>
      `⚠️ Leilung Tlan Harsatna ${c.severity.toUpperCase()} – ${c.district}`,
    message: (c) =>
      `${c.district} chhanchhuahna leilung tlan harsatna ${c.severity.toUpperCase()} (score ${c.riskScore}/100) hmu tawh. Rain 24h: ${c.rain24h} mm. 72h: ${c.rain72h} mm.`,
    instructions: () => [
      "Thupui dawn chuan chawl hnai lamah chhuak ang che.",
      "Tuikhur hnai lam leh khawih atang huat rawh.",
      "All India Radio ziak ang che.",
      "District emergency helpline: 1077.",
    ],
  },
  nag: { // [PLACEHOLDER – native-speaker review needed]
    title: (c) =>
      `⚠️ Bhumi Khisibo Risk ${c.severity.toUpperCase()} – ${c.district}`,
    message: (c) =>
      `${c.district} laage bhumi khisibo risk ${c.severity.toUpperCase()} (score ${c.riskScore}/100) paisa. 24 ghanta rain: ${c.rain24h} mm. 72 ghanta: ${c.rain72h} mm.`,
    instructions: () => [
      "Aadesher pore dheere phere bhumi chhado.",
      "Nodi laage rasta aru pul atka.",
      "All India Radio suno.",
      "District emergency helpline: 1077.",
    ],
  },
  grt: { // [PLACEHOLDER – native-speaker review needed]
    title: (c) =>
      `⚠️ Mite Khisa Risk ${c.severity.toUpperCase()} – ${c.district}`,
    message: (c) =>
      `${c.district} lakka mite khisa risk ${c.severity.toUpperCase()} (score ${c.riskScore}/100) gipil·a. 24 sora rain: ${c.rain24h} mm. 72 sora: ${c.rain72h} mm.`,
    instructions: () => [
      "Ong·de man·a agana mite-ko chhik·a.",
      "Dik·gre rasta aro pul-ko cha·a.",
      "All India Radio gimin·a.",
      "District emergency helpline: 1077.",
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
  or: {
    title: (c) => `⚠️ ${_cap(c.alertType)} ସତର୍କତା ${c.severity.toUpperCase()} – ${c.district}`,
    message: (c) =>
      `${c.district}ରେ ${c.alertType} ସ୍ତର ${c.severity} ସତର୍କତା ଜାରି ହୋଇଛି। ସ୍ଥାନୀୟ ପ୍ରଶାସନ ନିର୍ଦ୍ଦେଶ ଅନୁସରଣ କରନ୍ତୁ।`,
    instructions: () => ["ସ୍ଥାନୀୟ ଅଧିକାରୀଙ୍କ ନିର୍ଦ୍ଦେଶ ପାଳନ କରନ୍ତୁ।", "ଜିଲ୍ଲା ଜରୁରୀ ହେଲ୍ପଲାଇନ: 1077।"],
  },
  kha: {
    title: (c) => `⚠️ ${_cap(c.alertType)} Alert ${c.severity.toUpperCase()} – ${c.district}`,
    message: (c) =>
      `${c.district} da ${c.alertType} alert ${c.severity} da jingmut.`,
    instructions: () => ["Sngewbha ia ki bynta jong ki shynrang.", "Helpline: 1077."],
  },
  mni: { // [PLACEHOLDER – native-speaker review needed]
    title: (c) => `⚠️ ${_cap(c.alertType)} Alert ${c.severity.toUpperCase()} – ${c.district}`,
    message: (c) =>
      `${c.district}-da ${c.alertType} alert ${c.severity} otoknai. Thounarang thambal panba.`,
    instructions: () => ["Thounarang ningba awang panba.", "Helpline: 1077."],
  },
  lus: { // [PLACEHOLDER – native-speaker review needed]
    title: (c) => `⚠️ ${_cap(c.alertType)} Harsatna ${c.severity.toUpperCase()} – ${c.district}`,
    message: (c) =>
      `${c.district}-ah ${c.alertType} harsatna ${c.severity} ban puan a ni.`,
    instructions: () => ["Khua leh tui hruai te thu ziak ang che.", "Helpline: 1077."],
  },
  nag: { // [PLACEHOLDER – native-speaker review needed]
    title: (c) => `⚠️ ${_cap(c.alertType)} Alert ${c.severity.toUpperCase()} – ${c.district}`,
    message: (c) =>
      `${c.district}-t ${c.alertType} alert ${c.severity} dibo hoise. Local authority-ke follow koro.`,
    instructions: () => ["Local authority-ke follow koro.", "Helpline: 1077."],
  },
  grt: { // [PLACEHOLDER – native-speaker review needed]
    title: (c) => `⚠️ ${_cap(c.alertType)} Alert ${c.severity.toUpperCase()} – ${c.district}`,
    message: (c) =>
      `${c.district}-ko ${c.alertType} alert ${c.severity} dibo. Local authority-ko manasen·a.`,
    instructions: () => ["Local authority-ko manasen·a.", "Helpline: 1077."],
  },
};

const SUPPORTED_LANGS = ["en", "hi", "or", "as", "bn", "mni", "lus", "kha", "nag", "ne", "grt"];


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

/**
 * Build a localised escalation title and message for a specific recipient.
 * Used by alertEscalationService to avoid hardcoded English escalation text.
 *
 * @param {string} preferredLang   – e.g. "as"
 * @param {{ title: string, message: string }} originalContent – resolved alert content
 * @param {string} fromRole        – role that failed to acknowledge
 * @param {string} toRole          – next escalation tier
 * @param {number} slaMinutes      – original SLA window
 * @returns {{ escalatedTitle: string, escalatedMsg: string }}
 */
function buildEscalationMessage(preferredLang = "en", originalContent = {}, fromRole, toRole, slaMinutes) {
  const tpl = ESCALATION_TEMPLATES[preferredLang] || ESCALATION_TEMPLATES["en"];
  const ctx = {
    title: originalContent.title || "",
    message: originalContent.message || "",
    fromRole: fromRole || "unknown",
    toRole: toRole || "unknown",
    slaMinutes: slaMinutes || 0,
  };
  return {
    escalatedTitle: tpl.escalatedTitle(ctx),
    escalatedMsg:   tpl.escalatedMsg(ctx),
  };
}

module.exports = { buildLocalizedContent, resolveForRecipient, buildEscalationMessage, SUPPORTED_LANGS };
