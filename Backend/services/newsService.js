const RSSParser = require("rss-parser");
const NewsArticle = require("../models/NewsArticle");

const parser = new RSSParser({
  timeout: 15000,
  headers: {
    "User-Agent":
      "Mozilla/5.0 (compatible; DisasterManagementBot/1.0; +https://disaster-platform.in)",
    Accept: "application/rss+xml, application/xml, text/xml, */*",
  },
  customFields: {
    item: [
      ["media:content", "mediaContent"],
      ["media:thumbnail", "mediaThumbnail"],
      ["enclosure", "enclosure"],
    ],
  },
});

// RSS feed sources
const RSS_SOURCES = [
  {
    url: "https://news.google.com/rss/search?q=disaster+flood+cyclone+earthquake+climate+change+India&hl=en-IN&gl=IN&ceid=IN:en",
    source: "Google News",
    language: "en",
    isGoogle: true,
  },
  {
    url: "https://news.google.com/rss/search?q=%E0%A4%86%E0%A4%AA%E0%A4%A6%E0%A4%BE+%E0%A4%AC%E0%A4%BE%E0%A4%A2%E0%A4%BC+%E0%A4%9A%E0%A4%95%E0%A5%8D%E0%A4%B0%E0%A4%B5%E0%A4%BE%E0%A4%A4+%E0%A4%AD%E0%A5%82%E0%A4%95%E0%A4%82%E0%A4%AA+%E0%A4%9C%E0%A4%B2%E0%A4%B5%E0%A4%BE%E0%A4%AF%E0%A5%81+%E0%A4%AA%E0%A4%B0%E0%A4%BF%E0%A4%B5%E0%A4%B0%E0%A5%8D%E0%A4%A4%E0%A4%A8&hl=hi-IN&gl=IN&ceid=IN:hi",
    source: "Google News Hindi",
    language: "hi",
    isGoogle: true,
  },
  {
    url: "https://prameya.com/feed/",
    source: "Prameya",
    language: "or",
    isGoogle: false,
  },
  {
    url: "https://sambad.in/feed/",
    source: "Sambad",
    language: "or",
    isGoogle: false,
  },
];

// Keywords for filtering relevant articles (multilingual)
const DISASTER_KEYWORDS = [
  // English
  "flood", "cyclone", "earthquake", "disaster", "climate", "storm", "tsunami",
  "drought", "landslide", "heatwave", "wildfire", "hurricane", "tornado",
  "rescue", "relief", "evacuation", "emergency", "calamity", "crisis",
  // Hindi
  "बाढ़", "चक्रवात", "भूकंप", "आपदा", "जलवायु", "तूफान", "सुनामी",
  "सूखा", "भूस्खलन", "गर्मी", "जंगल की आग", "राहत", "बचाव",
  // Odia
  "ବନ୍ୟା", "ବାତ୍ୟା", "ଭୂକମ୍ପ", "ଆପଦ", "ଜଳବାୟୁ", "ଝଡ", "ସୁନାମି",
  "ଅନାବୃଷ୍ଟି", "ଭୂସ୍ଖଳନ", "ଉଷ୍ଣ", "ଉଦ୍ଧାର", "ତ୍ରାଣ",
];

/**
 * Extract image URL from an RSS item
 */
function extractImage(item) {
  // media:content or media:thumbnail
  if (item.mediaContent && item.mediaContent["$"] && item.mediaContent["$"].url) {
    return item.mediaContent["$"].url;
  }
  if (item.mediaThumbnail && item.mediaThumbnail["$"] && item.mediaThumbnail["$"].url) {
    return item.mediaThumbnail["$"].url;
  }
  // enclosure (audio/image)
  if (item.enclosure && item.enclosure.url && item.enclosure.type && item.enclosure.type.startsWith("image")) {
    return item.enclosure.url;
  }
  // Try to find first image in content/description via regex
  const html = item["content:encoded"] || item.content || item.summary || item.description || "";
  const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (match) return match[1];
  return null;
}

/**
 * Check if article is related to disaster/climate
 */
function isRelevant(title, description, language, isGoogle) {
  // Google News is already filtered by our search query, so all articles are relevant
  if (isGoogle) return true;
  // For Odia newspapers, filter by keywords
  const text = `${title} ${description}`.toLowerCase();
  return DISASTER_KEYWORDS.some((kw) => text.includes(kw.toLowerCase()));
}

/**
 * Fetch RSS from a single source and return formatted articles
 */
async function fetchSource(source) {
  const articles = [];
  try {
    const feed = await parser.parseURL(source.url);
    for (const item of feed.items || []) {
      const title = (item.title || "").trim();
      const url = (item.link || item.guid || "").trim();
      if (!title || !url) continue;

      const description = (item.contentSnippet || item.summary || item.description || "")
        .replace(/<[^>]+>/g, "")
        .trim()
        .slice(0, 400);

      const pubDate = item.isoDate
        ? new Date(item.isoDate)
        : item.pubDate
        ? new Date(item.pubDate)
        : new Date();

      if (isNaN(pubDate.getTime())) continue;

      const imageUrl = extractImage(item);

      if (!isRelevant(title, description, source.language, source.isGoogle)) continue;

      articles.push({
        title,
        description,
        url,
        imageUrl,
        source: source.source,
        language: source.language,
        publishedAt: pubDate,
        fetchedAt: new Date(),
        keywords: [],
      });
    }
    console.log(`[NewsService] ✅ ${source.source}: ${articles.length} relevant articles`);
  } catch (err) {
    console.error(`[NewsService] ❌ Failed to fetch ${source.source}: ${err.message}`);
  }
  return articles;
}

/**
 * Fetch all RSS sources and upsert into MongoDB
 */
async function fetchAndStoreAll() {
  console.log("[NewsService] Starting news fetch from all sources...");
  const allSources = await Promise.allSettled(RSS_SOURCES.map(fetchSource));

  let totalSaved = 0;
  let totalSkipped = 0;

  for (const result of allSources) {
    if (result.status !== "fulfilled") continue;
    const articles = result.value;

    for (const article of articles) {
      try {
        await NewsArticle.findOneAndUpdate(
          { url: article.url },
          { $setOnInsert: article },
          { upsert: true, new: false }
        );
        totalSaved++;
      } catch (err) {
        if (err.code === 11000) {
          totalSkipped++; // Duplicate URL — expected
        } else {
          console.error(`[NewsService] DB error: ${err.message}`);
        }
      }
    }
  }

  console.log(
    `[NewsService] ✅ Done. New: ${totalSaved - totalSkipped}, Duplicates skipped: ${totalSkipped}`
  );
  return { saved: totalSaved, skipped: totalSkipped };
}

module.exports = { fetchAndStoreAll, DISASTER_KEYWORDS };
