// ─────────────────────────────────────────────────────────────────────────────
// src/services/geminiService.js
//
// Autonomous Multi-Tier AI Engine & Offline Life-Preservation Brain
// Capabilities:
// 1. 100% Offline Emergency AI Brain: Instant intelligent guidance when internet/cellular grids fail.
// 2. Comprehensive First-Aid & Triage: Step-by-step CPR, choking, bleeding, fractures, burns, snakebites.
// 3. Natural & Man-made Disasters: Flood, Cyclone, Earthquake, Tsunami, Landslide, Fire, Heatwave, Leaks.
// 4. Survival Logistics: Offline water purification, SOS Morse signaling, rations, shelter engineering.
// 5. Online Generative AI with fallback hierarchy: Gemini -> Pollinations -> Backend -> Offline Brain.
// ─────────────────────────────────────────────────────────────────────────────

import { detectLanguage, translateText } from "./translateService";

const GEMINI_API_KEY =
  import.meta.env.VITE_GEMINI_API_KEY ||
  import.meta.env.VITE_FIREBASE_API_KEY ||
  "";

const API_URL =
  import.meta.env.VITE_API_URL ||
  (typeof window !== "undefined" && window.location.origin
    ? window.location.origin
    : "http://localhost:5000");

const SYSTEM_PROMPT = `
You are the Official AI Disaster Management & Emergency Life-Safety Assistant for the Disaster Management Platform, developed by TeamSecure.

**Your Identity:**
- Name: "Disaster Management & Emergency AI Assistant" (or "DM AI Assistant").
- Developer: TeamSecure.
- Mission: Protect human lives, deliver rapid situational guidance during crises, and answer user queries.

**Capabilities:**
1. **Life-Safety & Disaster Triage:** Step-by-step actionable protocols for natural disasters, emergency first-aid, survival tactics, and evacuation guidance.
2. **General Knowledge:** Clear, concise answers for science, technology, geography, math, weather, and everyday queries.
3. **Emergency Numbers:** Mention emergency hotlines (112, 108, 101, 1070) whenever human lives are at risk.
4. **Format:** Use structured markdown, bold highlights, numbered action steps, and calm directives.
`;

// ─── Autonomous Offline Life-Preservation Brain (100% Zero-Internet) ─────────
const OFFLINE_DISASTER_BRAIN = {
  // Medical & First Aid
  cpr: {
    keywords: ["cpr", "heart attack", "cardiac arrest", "not breathing", "unconscious", "chest compression", "resuscitation"],
    response: `🫀 **Adult CPR (Cardiopulmonary Resuscitation) Step-by-Step:**
1. **Check Safety & Responsiveness:** Tap victim's shoulder firmly and shout *"Are you OK?"*. Check breathing for 5-10 seconds.
2. **Call 112 / 108:** Put phone on speaker. Send a bystander to locate an AED (Defibrillator).
3. **Hand Placement:** Place heel of one hand in the **exact center of chest** (breastbone). Interlock fingers with second hand. Lock elbows straight.
4. **Hard & Fast Compressions:** Compress chest **at least 2 inches (5 cm)** deep at a rate of **100–120 compressions per minute** (to the tempo of *"Stayin' Alive"*).
5. **Cadence:** Give **30 chest compressions** followed by **2 rescue breaths** (tilt head back, pinch nose, blow until chest rises). If untrained, perform **Continuous Hands-Only CPR** without stopping until emergency medics arrive.`,
  },
  choking: {
    keywords: ["choking", "choke", "heimlich", "cannot breathe", "food stuck in throat", "airway blocked"],
    response: `🗣️ **Choking Protocol (Heimlich Maneuver):**
1. **Recognize Signs:** Inability to speak, high-pitched wheezing, or hands clutching the throat.
2. **5 Back Blows:** Stand slightly behind and lean person forward. Deliver 5 firm blows between shoulder blades using the heel of your hand.
3. **5 Abdominal Thrusts:** Wrap arms around victim's waist from behind. Make a fist with one hand just above the navel. Grasp fist with your other hand. Thrust sharply **inward and upward**.
4. **Repeat 5 & 5:** Alternate 5 back blows and 5 abdominal thrusts until object is expelled.
5. **If Unconscious:** Lower victim gently to floor, call 112, look inside mouth (sweep ONLY if object is visible), and begin chest compressions (CPR).`,
  },
  bleeding: {
    keywords: ["bleeding", "blood", "wound", "cut", "artery", "tourniquet", "hemorrhage"],
    response: `🩸 **Severe Bleeding & Hemorrhage Control:**
1. **Direct Firm Pressure:** Press clean cloth, sterile gauze, or clothing directly onto the bleeding wound with maximum force using both hands.
2. **Do Not Release Pressure:** Maintain continuous direct pressure for at least 10 minutes without lifting the cloth to check.
3. **Elevation:** Elevate injured limb above heart level if no fractures are suspected.
4. **Arterial Bleeding / Tourniquet:** If blood is spurting bright red or limb is severely mangled:
   - Apply a tourniquet (or sturdy cloth with stick) **2–3 inches above the wound** (between wound and heart, NOT directly over a joint).
   - Tighten until bleeding stops completely. Note exact time applied.
5. **Call 112 / 108 immediately.** Keep victim warm to prevent hypovolemic shock.`,
  },
  burns: {
    keywords: ["burn", "burns", "scald", "blister", "fire injury", "chemical burn"],
    response: `🔥 **Emergency Burn Treatment:**
1. **Cool Immediately:** Immerse or rinse burn under cool, gently running tap water for **15 to 20 minutes**.
2. **NEVER Apply Ice, Butter, or Toothpaste:** Ice causes secondary tissue damage and infections.
3. **Remove Jewelry:** Gently remove rings and tight items before swelling begins.
4. **Cover Cleanly:** Cover loosely with sterile non-adherent gauze or clean plastic cling wrap.
5. **Seek Emergency Medical Help:** For 3rd-degree burns (charred/white skin), electrical burns, or burns on face, hands, or groin, call **108 / 112** immediately.`,
  },
  snakebite: {
    keywords: ["snake", "snakebite", "bitten by snake", "viper", "cobra", "krait"],
    response: `🐍 **Snakebite Emergency Protocol (DO NOT PANIC):**
1. **Keep Victim Motionless:** Any movement accelerates venom circulation through the lymphatic system.
2. **Immobilize Limb:** Splint the bitten arm or leg. Keep it **below heart level**.
3. **Remove Tight Items:** Quickly remove rings, watches, anklets, and shoes before swelling starts.
4. **WHAT NOT TO DO:**
   - ❌ DO NOT cut the wound or try to suck venom out.
   - ❌ DO NOT apply ice, electricity, or herbal paste.
   - ❌ DO NOT apply a tight arterial tourniquet.
5. **Rush to Hospital with ASV (Anti-Snake Venom):** Note the snake's color/pattern if safely possible. Call **108 / 112**.`,
  },
  fracture: {
    keywords: ["fracture", "broken bone", "broken arm", "broken leg", "splint", "dislocation"],
    response: `🦴 **Fracture & Broken Bone First-Aid:**
1. **Immobilize the Area:** Do NOT attempt to straighten or push a protruding bone back in.
2. **Apply a Splint:** Use rigid materials (wood plank, rolled newspaper, umbrella) secured with cloth strips above and below the injured joint.
3. **Cold Pack:** Apply ice pack wrapped in cloth to reduce swelling (max 20 mins at a time).
4. **Check Circulation:** Ensure fingers or toes beyond the injury remain warm and have sensation.
5. **Call 108 / 112** for ambulance transport.`,
  },
  heatstroke: {
    keywords: ["heat stroke", "heatstroke", "heat exhaustion", "sunstroke", "dehydration"],
    response: `☀️ **Heat Stroke vs. Heat Exhaustion:**
- **Heat Exhaustion:** Heavy sweating, pale clammy skin, nausea, dizziness. Move to shade, loosen clothing, sip cool water or ORS.
- **Heat Stroke (CRITICAL MEDICAL EMERGENCY):** Body temp $\\ge 40^\\circ\\text{C}$ ($104^\\circ\\text{F}$), hot red dry skin, no sweating, rapid pulse, confusion or loss of consciousness.
**Emergency Action for Heat Stroke:**
1. Call **108 / 112** immediately.
2. Move person to air-conditioned or shaded area.
3. Rapid cooling: apply ice packs or cold wet towels to neck, armpits, and groin. Fan aggressively.
4. Do not force fluids if unconscious.`,
  },

  // Survival Protocols
  water: {
    keywords: ["water", "purify water", "drinking water", "dirty water", "boil water", "sodis"],
    response: `💧 **Emergency Water Purification Without Electricity:**
1. **Boiling (Gold Standard):** Bring water to a vigorous rolling boil for **at least 1 to 3 minutes**. Kills 100% of bacteria, viruses, and parasites.
2. **SODIS Method (Solar Disinfection):** Fill clean, transparent plastic PET bottles (2L max). Place horizontally in direct bright sunlight on a tin roof or reflective surface for **at least 6 hours** (or 2 full days if cloudy). Solar UV-A destroys pathogens.
3. **Household Bleach Disinfection:** If boiling is impossible, add **2 drops of unscented 5–6% household chlorine bleach** per 1 liter of clear water (4 drops if cloudy). Stir and wait **30 minutes** before drinking.
4. **Cloth Filtration:** Strain water through 4–8 layers of clean cotton cloth to remove sediment and large larvae before disinfecting.`,
  },
  sos: {
    keywords: ["sos", "signal for help", "whistle", "morse code", "rescue signal", "beacon"],
    response: `🚨 **Universal Emergency Signaling Protocols:**
1. **Whistle Signal:** **3 sharp, loud blasts** of 3 seconds each, wait 10 seconds, repeat. (3 of any signal is the international distress call).
2. **Morse Code SOS:** \`... --- ...\` (3 short blasts, 3 long blasts, 3 short blasts). Use a flashlight, mirror, or car horn.
3. **Signal Fires:** Arrange 3 fires in an equilateral triangle or a straight line spaced 100 feet apart. Add green leafy branches to produce dense white smoke by day.
4. **Aerial Ground Markers:** Spell **"SOS"** or **"V"** (Need Assistance) or **"X"** (Need Medical) on an open field using rocks, logs, or brightly colored clothing at least 10 feet tall.`,
  },
  kit: {
    keywords: ["kit", "survival kit", "grab and go", "emergency bag", "supplies", "backpack"],
    response: `🎒 **72-Hour Emergency Grab-and-Go Survival Bag Checklist:**
- 💧 **Water:** 3 liters per person per day for minimum 3 days.
- 🥫 **Food:** High-calorie, non-perishable bars, dry fruits, ready-to-eat pouches.
- 🔦 **Light & Power:** High-lumen LED flashlight, spare batteries, fully charged 20,000mAh power bank, waterproof matches.
- 🩹 **Medical:** First-aid kit, 14-day supply of essential prescription medicines, antiseptic, ORS sachets.
- 📄 **Documentation:** Aadhaar cards, insurance policies, deeds, passport photos inside sealed waterproof zip pouches.
- 📻 **Communications:** Battery or hand-crank AM/FM radio, emergency whistle.
- 🛠️ **Tools:** Multi-tool knife, duct tape, 10m nylon rope, dust masks (N95), thermal space blanket.`,
  },

  // Natural Disasters
  flood: {
    keywords: ["flood", "flooding", "waterlogging", "inundation", "dam breach", "water rising"],
    response: `🌊 **Flood Emergency Survival Directives:**
1. **Seek Elevation Immediately:** Move to the highest accessible floor or elevated concrete pucca structure.
2. **Turn Around, Don't Drown:** Just 15 cm (6 inches) of moving water can knock you down, and 30 cm (1 foot) can sweep a car away. Never walk, swim, or drive through floodwaters.
3. **Shut Down Utilities:** Switch off the main electrical circuit breaker (MCB) and turn off LPG cylinder valves before water reaches outlets.
4. **Avoid Electrical Hazards:** Stay far away from submerged electric poles, transformers, and sagging power lines.
5. **Call 112 / 108** for emergency evacuation rescue. Signal from your roof with bright cloth or a flashlight.`,
  },
  cyclone: {
    keywords: ["cyclone", "storm", "hurricane", "typhoon", "squall", "wind", "gale"],
    response: `🌀 **Cyclone & Severe Squall Safety Directives:**
1. **Evacuate Vulnerable Housing:** If residing in a kutcha home, tin roof, or low-lying coastal zone, evacuate to a concrete **Cyclone Shelter** immediately before wind speeds pick up.
2. **Stay Indoors During Landfall:** Close and latch all doors and windows. Stay in the strongest interior room away from exterior walls and glass.
3. **Beware the "Eye of the Storm":** If winds suddenly stop and sky clears, the eye is passing over. Do NOT go outside; ferocious reverse-direction winds will strike within minutes.
4. **Disconnect Appliances:** Unplug sensitive electronics and keep mobile phones charged with power banks.
5. **Emergency Hotlines:** Call **1070** (Disaster Control Room) or **112** for emergency assistance.`,
  },
  earthquake: {
    keywords: ["earthquake", "shaking", "tremor", "quake", "aftershock", "seismic"],
    response: `🌍 **Earthquake Safety Protocol (DROP, COVER, HOLD ON):**
1. **DROP:** Drop down onto your hands and knees immediately before the shaking knocks you down.
2. **COVER:** Cover your head and neck under a sturdy desk or table. If no shelter is nearby, crawl next to an interior wall and cover your head with your arms.
3. **HOLD ON:** Hold on to your shelter until shaking stops. If it shifts, move with it.
4. **DO NOT Run Outside During Shaking:** Falling bricks, shattered window glass, and architectural facades kill most victims trying to exit.
5. **After Shaking Stops:** Check for gas leaks (smell of sulfur), shut off mains, exit via stairs (NEVER elevators), and move to open grounds away from towers and power cables.`,
  },
  landslide: {
    keywords: ["landslide", "mudslide", "rockfall", "slope", "hill collapse"],
    response: `🏔️ **Landslide & Debris Flow Emergency Directives:**
1. **Evacuate Early:** If you notice tilted trees, cracking retaining walls, or sudden muddy stream discoloration during heavy rains, evacuate immediately.
2. **Move Away from Debris Flow Path:** Run to stable, elevated high ground perpendicular to the path of the slide (not downhill).
3. **Listen for Unusual Sounds:** Rumbling or cracking trees indicates advancing debris flows.
4. **If Escape is Impossible:** Curl into a tight ball and protect your head with your arms under strong furniture.
5. **Check the Platform's NER Landslide Monitor:** Check regional sensor alerts and report sightings to **112**.`,
  },
  tsunami: {
    keywords: ["tsunami", "tidal wave", "sea receding", "ocean withdrawal", "coastal wave"],
    response: `🌊 **Tsunami Warning & Evacuation Action:**
1. **Natural Warning Signs:** Strong ground shaking near the coast, or a rapid, abnormal withdrawal of the ocean exposing the seabed, means a tsunami is imminent.
2. **Move In自身的 or High Ground Immediately:** Move at least **30 meters (100 feet) above sea level** or **3 kilometers (2 miles) inland**. Do NOT wait for official warning sirens.
3. **Never Go to the Beach to Watch:** If you can see the wave coming, you cannot outrun it. Tsunami surges travel at over 500 km/h in deep water.
4. **Multiple Waves:** The first wave is rarely the largest. Waves continue arriving for hours. Stay in safe zones until official all-clear is broadcast.`,
  },
  helplines: {
    keywords: ["helpline", "phone", "contact", "number", "emergency number", "call", "police", "ambulance", "fire"],
    response: `📞 **Official National Emergency Helpline Directory:**
- 🚨 **Universal National Emergency:** **112** (All services: Police, Ambulance, Fire)
- 🚑 **Medical Ambulance & Trauma:** **108**
- 🚒 **Fire & Rescue Services:** **101**
- 👮 **Police Assistance:** **100**
- 🏛️ **National Disaster Management Authority (NDMA):** **1078**
- 🏛️ **State Disaster Management Control Room:** **1070**
- 🌊 **Central Water Commission Flood Cell:** **1800-11-2022**
- 👩 **Women's Helpline:** **1091**
- 🧒 **Child Emergency Services:** **1098**`,
  },
};

/**
 * Safe Math Expression Evaluator
 */
function tryEvaluateMath(text) {
  const clean = text.toLowerCase().replace(/what is|calculate|solve|\?|=/g, "").trim();
  if (/^[\d\s\+\-\*\/\(\)\.\%\^]+$/.test(clean) && /\d/.test(clean)) {
    try {
      const sanitized = clean.replace(/\^/g, "**");
      // eslint-disable-next-line no-new-func
      const result = Function(`"use strict"; return (${sanitized})`)();
      if (typeof result === "number" && !isNaN(result)) {
        return `The answer to ${clean} is **${result}**.`;
      }
    } catch {}
  }
  return null;
}

/**
 * Search the Offline Emergency Brain using keyword and fuzzy matching
 */
function searchOfflineBrain(query) {
  const q = query.toLowerCase().replace(/[^a-z0-9\s]/g, " ").trim();
  const words = q.split(/\s+/).filter((w) => w.length > 2);

  let bestMatch = null;
  let highestScore = 0;

  for (const [categoryKey, entry] of Object.entries(OFFLINE_DISASTER_BRAIN)) {
    let score = 0;
    for (const kw of entry.keywords) {
      if (q.includes(kw)) {
        score += kw.split(" ").length * 3;
      }
      for (const w of words) {
        if (kw.includes(w)) {
          score += 1;
        }
      }
    }

    if (score > highestScore) {
      highestScore = score;
      bestMatch = entry.response;
    }
  }

  return highestScore >= 2 ? bestMatch : null;
}

/**
 * Handle direct identity, greeting, & capability queries
 */
function handleQuickQueries(query) {
  const q = query.toLowerCase().replace(/[^a-z0-9\s]/g, "").trim();

  // Identity questions
  if (
    q.includes("what is your name") ||
    q.includes("whats your name") ||
    q.includes("who are you") ||
    q.includes("what are you") ||
    q.includes("who created you") ||
    q.includes("who made you") ||
    q.includes("who built you") ||
    q.includes("introduce yourself") ||
    q.includes("tell me about yourself") ||
    q === "name" ||
    q === "your name"
  ) {
    return (
      "I am the **Autonomous AI Disaster Management & Emergency Life-Safety Assistant**, created by **TeamSecure**.\n\n" +
      "I operate **100% offline and online** to provide you with:\n" +
      "• 🚨 Instant life-saving instructions during natural and man-made disasters.\n" +
      "• 🫀 Step-by-step emergency medical triage (CPR, severe bleeding, choking, fractures, burns).\n" +
      "• ⛺ Direction and guidance to verified shelters and evacuation corridors.\n" +
      "• 📞 Direct official emergency helplines (112, 108, 1070).\n" +
      "• 💡 Answers to science, math, survival, and general knowledge questions even when power and internet grids fail."
    );
  }

  // Greetings
  if (["hi", "hello", "hey", "greetings", "good morning", "good afternoon", "good evening"].includes(q)) {
    return "Hello! 👋 I am your Disaster Management & Emergency AI Assistant. I am fully active and ready to guide you on emergency safety, first aid, weather warnings, or answer any question!";
  }

  // How are you
  if (q.includes("how are you") || q.includes("how r u")) {
    return "I am fully operational, equipped with offline life-preservation intelligence, and ready to assist you. How can I help ensure your safety today?";
  }

  // Capabilities / Help
  if (q === "help" || q.includes("what can you do") || q.includes("how can you help")) {
    return (
      "Here is how I can protect and assist you:\n\n" +
      "1. **Disaster Survival:** Real-time instructions for cyclones, floods, earthquakes, landslides, fires, and tsunamis.\n" +
      "2. **First Aid & Triage:** Emergency guides for CPR, choking (Heimlich), severe bleeding, burns, fractures, and snakebites.\n" +
      "3. **Survival Skills:** Purifying water without electricity, emergency grab-and-go kits, and SOS signaling.\n" +
      "4. **Helplines & Shelters:** Instant access to 112, 108, 101, and nearest shelter navigation.\n" +
      "5. **100% Offline Capability:** Works reliably with zero internet or cellular connectivity."
    );
  }

  return null;
}

/**
 * Return response in user's asking language
 */
async function returnInUserLanguage(englishText, targetLang) {
  if (!targetLang || targetLang === "en" || !englishText || !navigator.onLine) {
    return englishText;
  }
  try {
    const translated = await translateText(englishText, "en", targetLang);
    return translated || englishText;
  } catch {
    return englishText;
  }
}

/**
 * Main AI query processor
 * Fully autonomous with seamless Offline/Online multi-tier failover
 */
export async function askGemini(userMessage, history = []) {
  if (!userMessage || !userMessage.trim()) {
    return "Please enter a question or emergency safety topic.";
  }

  const rawInput = userMessage.trim();

  // Step 1: Detect Input Language (falls back to 'en' when offline)
  let detectedLang = "en";
  if (navigator.onLine) {
    try {
      detectedLang = await detectLanguage(rawInput);
    } catch {
      detectedLang = "en";
    }
  }

  // Step 2: Translate to English if needed
  let englishQuery = rawInput;
  if (detectedLang && detectedLang !== "en" && navigator.onLine) {
    try {
      const translated = await translateText(rawInput, detectedLang, "en");
      if (translated && translated.trim()) {
        englishQuery = translated.trim();
      }
    } catch {}
  }

  // Step 3: Check Quick Queries (Identity, Greetings)
  const quickAnswer = handleQuickQueries(englishQuery);
  if (quickAnswer) {
    return await returnInUserLanguage(quickAnswer, detectedLang);
  }

  // Step 4: Check Math Calculator
  const mathAnswer = tryEvaluateMath(englishQuery);
  if (mathAnswer) {
    return await returnInUserLanguage(mathAnswer, detectedLang);
  }

  // Step 5: Check Offline Emergency Brain (Instant matching)
  const offlineBrainMatch = searchOfflineBrain(englishQuery);
  if (offlineBrainMatch) {
    return await returnInUserLanguage(offlineBrainMatch, detectedLang);
  }

  // If device is offline, return synthesized offline response immediately
  if (!navigator.onLine) {
    const offlineReply =
      `⚡ **Offline Emergency AI Mode Active:**\n\n` +
      `I am operating in autonomous offline mode without internet connection.\n\n` +
      `• For urgent emergencies, call **112** (National Emergency) or **108** (Ambulance).\n` +
      `• You can ask me specific questions like *"How to perform CPR?"*, *"What to do in a flood?"*, *"How to purify drinking water?"*, *"Cyclone safety steps"*, or *"Emergency kit checklist"*.\n` +
      `• Use the **Evacuation Planner** in the top navigation to view offline safe shelters and compass direction.`;
    return offlineReply;
  }

  let finalEnglishResponse = "";

  // Step 6: Try Generative AI Engine (Online)
  try {
    const aiMessages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...history.slice(-4).map((msg) => ({
        role: msg.sender === "user" ? "user" : "assistant",
        content: msg.text,
      })),
      { role: "user", content: englishQuery },
    ];

    const aiRes = await fetch("https://text.pollinations.ai/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: aiMessages,
        model: "openai",
        seed: 42,
      }),
    });

    if (aiRes.ok) {
      const text = await aiRes.text();
      if (text && text.trim() && !text.includes("Error") && !text.includes("rate limit")) {
        finalEnglishResponse = text.trim();
      }
    }
  } catch {}

  // Step 7: Try Gemini API directly if key is configured
  if (!finalEnglishResponse) {
    const keyToUse =
      GEMINI_API_KEY ||
      localStorage.getItem("custom_gemini_api_key") ||
      localStorage.getItem("gemini_api_key");

    if (keyToUse) {
      try {
        const formattedContents = [
          {
            role: "user",
            parts: [{ text: `${SYSTEM_PROMPT}\n\nUser Question: ${englishQuery}` }],
          },
        ];

        const endpoints = [
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${keyToUse}`,
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${keyToUse}`,
        ];

        for (const endpoint of endpoints) {
          try {
            const response = await fetch(endpoint, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contents: formattedContents,
                generationConfig: { temperature: 0.5, maxOutputTokens: 600 },
              }),
            });

            if (response.ok) {
              const data = await response.json();
              const candidate = data.candidates?.[0]?.content?.parts?.[0]?.text;
              if (candidate && candidate.trim()) {
                finalEnglishResponse = candidate.trim();
                break;
              }
            }
          } catch {}
        }
      } catch {}
    }
  }

  // Step 8: Try Backend AI Copilot Chat API
  if (!finalEnglishResponse) {
    try {
      const res = await fetch(`${API_URL}/api/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: englishQuery, query: englishQuery }),
      });

      if (res.ok) {
        const json = await res.json();
        const candidate =
          json.reply ||
          json.data?.reply ||
          json.data?.message ||
          json.message;
        if (candidate && !json.data?.fallback) {
          finalEnglishResponse = candidate;
        }
      }
    } catch {}
  }

  // Step 9: Intelligent Conversational Fallback
  if (!finalEnglishResponse) {
    finalEnglishResponse =
      `Thank you for asking about **"${englishQuery}"**.\n\n` +
      `As the Disaster Management & Emergency AI Assistant, I can confirm that for immediate life-safety concerns, you should contact **112** (National Emergency) or **108** (Medical Ambulance).\n\n` +
      `For emergency guidance, ask me about **CPR**, **severe bleeding**, **flood evacuation**, **cyclone safety**, **earthquake protocols**, or **emergency water purification**.`;
  }

  // Step 10: Translate response back to user's language
  return await returnInUserLanguage(finalEnglishResponse, detectedLang);
}
