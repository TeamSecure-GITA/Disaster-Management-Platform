import React, { useState, useEffect, useCallback, useRef } from "react";

// ─────────────────────────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────────────────────────
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
const REFRESH_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
const NEW_BADGE_HOURS = 6;

const LANGUAGES = [
  { code: "en", label: "English", flag: "🇬🇧", subtitle: "Google News · Reuters · AP" },
  { code: "hi", label: "हिंदी", flag: "🇮🇳", subtitle: "Google समाचार" },
  { code: "or", label: "ଓଡ଼ିଆ", flag: "🏳️", subtitle: "ପ୍ରମେୟ · ସମ୍ବାଦ" },
];

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────
function isNew(publishedAt) {
  if (!publishedAt) return false;
  const diff = Date.now() - new Date(publishedAt).getTime();
  return diff < NEW_BADGE_HOURS * 60 * 60 * 1000;
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHrs = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 2) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHrs < 24) return `${diffHrs}h ago`;
  if (diffDays === 1) return "Yesterday";
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function truncate(str, maxLen) {
  if (!str) return "";
  return str.length > maxLen ? str.slice(0, maxLen) + "…" : str;
}

// Source color badges
const SOURCE_COLORS = {
  "Google News": "#4285F4",
  "Google News Hindi": "#34A853",
  Prameya: "#E91E63",
  Sambad: "#FF5722",
};

function getSourceColor(source) {
  return SOURCE_COLORS[source] || "#6366f1";
}

// ─────────────────────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div style={styles.card}>
      <div style={{ ...styles.cardImg, background: "linear-gradient(90deg,#1e293b 25%,#334155 50%,#1e293b 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" }} />
      <div style={styles.cardBody}>
        <div style={{ height: 12, width: "40%", borderRadius: 6, background: "#1e293b", marginBottom: 10 }} />
        <div style={{ height: 16, width: "90%", borderRadius: 6, background: "#1e293b", marginBottom: 8 }} />
        <div style={{ height: 16, width: "70%", borderRadius: 6, background: "#1e293b", marginBottom: 14 }} />
        <div style={{ height: 12, width: "55%", borderRadius: 6, background: "#1e293b" }} />
      </div>
    </div>
  );
}

function ArticleCard({ article }) {
  const [imgError, setImgError] = useState(false);
  const fresh = isNew(article.publishedAt);

  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      style={styles.cardLink}
      title={article.title}
    >
      <article style={styles.card}>
        {/* Thumbnail */}
        <div style={styles.cardImgWrap}>
          {article.imageUrl && !imgError ? (
            <img
              src={article.imageUrl}
              alt={article.title}
              style={styles.cardImg}
              onError={() => setImgError(true)}
              loading="lazy"
            />
          ) : (
            <div style={styles.cardImgFallback}>
              <span style={{ fontSize: "2.5rem" }}>🌍</span>
            </div>
          )}
          {fresh && <span style={styles.newBadge}>🔴 NEW</span>}
        </div>

        {/* Body */}
        <div style={styles.cardBody}>
          {/* Source + date row */}
          <div style={styles.cardMeta}>
            <span
              style={{
                ...styles.sourceBadge,
                backgroundColor: getSourceColor(article.source) + "22",
                color: getSourceColor(article.source),
                borderColor: getSourceColor(article.source) + "55",
              }}
            >
              {article.source}
            </span>
            <span style={styles.cardDate}>{formatDate(article.publishedAt)}</span>
          </div>

          {/* Title */}
          <h3 style={styles.cardTitle}>{truncate(article.title, 110)}</h3>

          {/* Description */}
          {article.description && (
            <p style={styles.cardDesc}>{truncate(article.description, 160)}</p>
          )}

          {/* Read More */}
          <span style={styles.readMore}>
            Read full article →
          </span>
        </div>
      </article>
    </a>
  );
}

function EmptyState({ lang }) {
  const msgs = {
    en: { title: "No articles yet", sub: "Climate & disaster news will appear here automatically." },
    hi: { title: "अभी कोई लेख नहीं", sub: "समाचार स्वचालित रूप से यहाँ दिखाई देगा।" },
    or: { title: "ଏବେ ଖବର ନାହିଁ", sub: "ଆବହାୱା ଓ ବିପର୍ଯ୍ୟୟ ଖବର ଏଠି ଦେଖାଯିବ।" },
  };
  const m = msgs[lang] || msgs.en;
  return (
    <div style={styles.emptyState}>
      <div style={{ fontSize: "4rem", marginBottom: 16 }}>📰</div>
      <h3 style={{ color: "#60a5fa", fontSize: "1.2rem", margin: "0 0 8px" }}>{m.title}</h3>
      <p style={{ color: "#64748b", fontSize: "0.9rem" }}>{m.sub}</p>
      <p style={{ color: "#475569", fontSize: "0.8rem", marginTop: 8 }}>
        Backend fetches news every 6 hours from trusted sources.
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────
export default function ClimateChronicle() {
  const [activeLang, setActiveLang] = useState("en");
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [lastFetched, setLastFetched] = useState(null);
  const [stats, setStats] = useState({});
  const intervalRef = useRef(null);

  // ── Fetch articles ─────────────────────────────────────────
  const fetchArticles = useCallback(
    async (lang, pg, silent = false) => {
      if (!silent) setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `${API_BASE}/api/news?lang=${lang}&page=${pg}&limit=20`
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (data.success) {
          setArticles(data.data || []);
          setTotalPages(data.totalPages || 1);
          setTotal(data.total || 0);
          setLastFetched(new Date());
        } else {
          throw new Error(data.message || "Unknown error");
        }
      } catch (err) {
        setError(`Failed to load news: ${err.message}`);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  // ── Fetch stats ────────────────────────────────────────────
  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/news/stats`);
      const data = await res.json();
      if (data.success) setStats(data.data || {});
    } catch {}
  }, []);

  // ── Manual refresh trigger ─────────────────────────────────
  const triggerRefresh = async () => {
    setRefreshing(true);
    try {
      await fetch(`${API_BASE}/api/news/refresh`, { method: "POST" });
      // Wait a moment for backend to start fetching, then reload
      setTimeout(() => fetchArticles(activeLang, page, true), 4000);
    } catch {
      setRefreshing(false);
    }
  };

  // ── Language change ────────────────────────────────────────
  useEffect(() => {
    setPage(1);
    setArticles([]);
    fetchArticles(activeLang, 1);
    fetchStats();
  }, [activeLang, fetchArticles, fetchStats]);

  // ── Page change ────────────────────────────────────────────
  useEffect(() => {
    fetchArticles(activeLang, page);
  }, [page, activeLang, fetchArticles]);

  // ── Auto-refresh every 5 minutes ──────────────────────────
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      fetchArticles(activeLang, page, true);
    }, REFRESH_INTERVAL_MS);
    return () => clearInterval(intervalRef.current);
  }, [activeLang, page, fetchArticles]);

  // ─────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────
  const activeLangInfo = LANGUAGES.find((l) => l.code === activeLang);

  return (
    <div style={styles.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        @keyframes shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.4; transform: scale(0.7); }
        }
        .cc-card-link:hover .cc-card { transform: translateY(-3px); box-shadow: 0 16px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(56,189,248,0.15); }
        .cc-lang-tab:hover { background: rgba(56,189,248,0.08) !important; }
        .cc-page-btn:hover:not(:disabled) { background: rgba(56,189,248,0.15) !important; }
        .cc-refresh-btn:hover:not(:disabled) { background: rgba(56,189,248,0.12) !important; }
        .cc-read-more { transition: color 0.2s, letter-spacing 0.2s; }
        a.cc-card-link:hover .cc-read-more { color: #38bdf8 !important; letter-spacing: 0.03em; }
      `}</style>

      {/* ── HEADER ── */}
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.headerIconWrap}>
            <span style={{ fontSize: "1.8rem" }}>📰</span>
          </div>
          <div>
            <h1 style={styles.heading}>Climate Chronicle</h1>
            <p style={styles.subheading}>
              Live disaster &amp; climate news · Auto-updated every 6 hours · 3 languages
            </p>
          </div>
        </div>

        <div style={styles.headerRight}>
          {/* Live dot */}
          <div style={styles.livePill}>
            <span style={styles.liveDot} />
            <span style={{ fontSize: "0.75rem", color: "#34d399", fontWeight: 600 }}>LIVE</span>
          </div>

          {/* Refresh button */}
          <button
            className="cc-refresh-btn"
            onClick={triggerRefresh}
            disabled={refreshing}
            title="Fetch latest news from sources"
            style={styles.refreshBtn}
          >
            <span style={{ display: "inline-block", animation: refreshing ? "spin 1s linear infinite" : "none" }}>
              🔄
            </span>
            {refreshing ? " Fetching…" : " Refresh"}
          </button>
        </div>
      </header>

      {/* Last fetched info */}
      {lastFetched && (
        <p style={styles.lastFetchedTxt}>
          Last updated: {lastFetched.toLocaleTimeString("en-IN")} · Auto-refreshes every 5 min
        </p>
      )}

      {/* ── LANGUAGE TABS ── */}
      <nav style={styles.tabBar} role="tablist" aria-label="Language selection">
        {LANGUAGES.map((lang) => {
          const isActive = lang.code === activeLang;
          const count = stats[lang.code]?.count;
          return (
            <button
              key={lang.code}
              role="tab"
              aria-selected={isActive}
              className="cc-lang-tab"
              onClick={() => { setActiveLang(lang.code); }}
              style={{
                ...styles.langTab,
                ...(isActive ? styles.langTabActive : {}),
              }}
            >
              <span style={{ fontSize: "1.2rem" }}>{lang.flag}</span>
              <span style={{ fontWeight: isActive ? 700 : 500 }}>{lang.label}</span>
              {count !== undefined && (
                <span style={styles.countBadge}>{count}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Source subtitle */}
      <p style={styles.sourceSubtitle}>
        📡 Sources: {activeLangInfo?.subtitle}
      </p>

      {/* ── ARTICLE GRID ── */}
      <section aria-label="News articles">
        {error && (
          <div style={styles.errorBox}>
            <span>⚠️ {error}</span>
            <button onClick={() => fetchArticles(activeLang, page)} style={styles.retryBtn}>
              Retry
            </button>
          </div>
        )}

        {loading && !error && (
          <div style={styles.grid}>
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {!loading && !error && articles.length === 0 && (
          <EmptyState lang={activeLang} />
        )}

        {!loading && !error && articles.length > 0 && (
          <>
            <p style={styles.totalCount}>
              Showing {articles.length} of {total} articles
            </p>
            <div style={styles.grid}>
              {articles.map((article, i) => (
                <a
                  key={article._id || article.url}
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cc-card-link"
                  style={styles.cardLink}
                >
                  <article
                    className="cc-card"
                    style={{
                      ...styles.card,
                      animation: `fadeSlideUp 0.4s ease ${Math.min(i * 0.05, 0.5)}s both`,
                    }}
                  >
                    {/* Thumbnail */}
                    <ArticleCardInner article={article} />
                  </article>
                </a>
              ))}
            </div>

            {/* ── PAGINATION ── */}
            {totalPages > 1 && (
              <div style={styles.pagination}>
                <button
                  className="cc-page-btn"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  style={styles.pageBtn}
                >
                  ← Previous
                </button>
                <span style={styles.pageInfo}>
                  Page {page} of {totalPages}
                </span>
                <button
                  className="cc-page-btn"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  style={styles.pageBtn}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}

// Inner card (used inside the <a> to avoid nesting <a> inside <a>)
function ArticleCardInner({ article }) {
  const [imgError, setImgError] = useState(false);
  const fresh = isNew(article.publishedAt);

  return (
    <>
      {/* Thumbnail */}
      <div style={styles.cardImgWrap}>
        {article.imageUrl && !imgError ? (
          <img
            src={article.imageUrl}
            alt={article.title}
            style={styles.cardImg}
            onError={() => setImgError(true)}
            loading="lazy"
          />
        ) : (
          <div style={styles.cardImgFallback}>
            <span style={{ fontSize: "2.5rem" }}>🌍</span>
          </div>
        )}
        {fresh && <span style={styles.newBadge}>🔴 NEW</span>}
      </div>

      {/* Body */}
      <div style={styles.cardBody}>
        <div style={styles.cardMeta}>
          <span
            style={{
              ...styles.sourceBadge,
              backgroundColor: getSourceColor(article.source) + "22",
              color: getSourceColor(article.source),
              borderColor: getSourceColor(article.source) + "55",
            }}
          >
            {article.source}
          </span>
          <span style={styles.cardDate}>{formatDate(article.publishedAt)}</span>
        </div>
        <h3 style={styles.cardTitle}>{truncate(article.title, 110)}</h3>
        {article.description && (
          <p style={styles.cardDesc}>{truncate(article.description, 160)}</p>
        )}
        <span className="cc-read-more" style={styles.readMore}>
          Read full article →
        </span>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────
const styles = {
  page: {
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "0 4px",
    color: "#f8fafc",
  },

  // Header
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: "16px",
    marginBottom: "6px",
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  headerIconWrap: {
    width: 56,
    height: 56,
    borderRadius: "14px",
    background: "linear-gradient(135deg, #1e3a5f, #0f2942)",
    border: "1px solid rgba(56,189,248,0.25)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  heading: {
    fontSize: "1.7rem",
    fontWeight: 800,
    margin: 0,
    background: "linear-gradient(135deg, #38bdf8, #818cf8)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    letterSpacing: "-0.02em",
  },
  subheading: {
    margin: "4px 0 0",
    fontSize: "0.8rem",
    color: "#64748b",
  },
  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  livePill: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    background: "rgba(52, 211, 153, 0.08)",
    border: "1px solid rgba(52,211,153,0.2)",
    padding: "5px 12px",
    borderRadius: "100px",
  },
  liveDot: {
    display: "inline-block",
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: "#34d399",
    animation: "pulse-dot 1.5s ease-in-out infinite",
  },
  refreshBtn: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "8px 16px",
    borderRadius: "8px",
    border: "1px solid rgba(56,189,248,0.2)",
    background: "rgba(56,189,248,0.06)",
    color: "#94a3b8",
    fontSize: "0.85rem",
    cursor: "pointer",
    transition: "background 0.2s",
  },
  lastFetchedTxt: {
    margin: "0 0 16px",
    fontSize: "0.75rem",
    color: "#475569",
  },

  // Language tabs
  tabBar: {
    display: "flex",
    gap: "8px",
    marginBottom: "6px",
    flexWrap: "wrap",
  },
  langTab: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 20px",
    borderRadius: "10px",
    border: "1px solid rgba(255,255,255,0.07)",
    background: "rgba(255,255,255,0.03)",
    color: "#94a3b8",
    fontSize: "0.9rem",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  langTabActive: {
    background: "linear-gradient(135deg, rgba(56,189,248,0.15), rgba(129,140,248,0.1))",
    border: "1px solid rgba(56,189,248,0.35)",
    color: "#38bdf8",
  },
  countBadge: {
    background: "rgba(56,189,248,0.15)",
    color: "#38bdf8",
    fontSize: "0.7rem",
    fontWeight: 700,
    padding: "2px 7px",
    borderRadius: "100px",
    marginLeft: "2px",
  },
  sourceSubtitle: {
    fontSize: "0.78rem",
    color: "#475569",
    margin: "0 0 20px",
  },

  // Grid
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "18px",
  },
  totalCount: {
    fontSize: "0.8rem",
    color: "#475569",
    margin: "0 0 14px",
  },

  // Card
  cardLink: {
    textDecoration: "none",
    display: "block",
  },
  card: {
    background: "linear-gradient(135deg, #0f172a, #111827)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: "14px",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    transition: "transform 0.25s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.25s",
    cursor: "pointer",
    height: "100%",
  },
  cardImgWrap: {
    position: "relative",
    width: "100%",
    paddingTop: "52%",
    overflow: "hidden",
    background: "#0f172a",
  },
  cardImg: {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
    transition: "transform 0.4s ease",
  },
  cardImgFallback: {
    position: "absolute",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #1e3a5f 0%, #0b1a2d 100%)",
  },
  newBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    background: "rgba(239,68,68,0.9)",
    color: "#fff",
    fontSize: "0.65rem",
    fontWeight: 700,
    padding: "3px 8px",
    borderRadius: "100px",
    letterSpacing: "0.05em",
    backdropFilter: "blur(4px)",
  },
  cardBody: {
    padding: "14px 16px 16px",
    display: "flex",
    flexDirection: "column",
    flex: 1,
  },
  cardMeta: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "10px",
    flexWrap: "wrap",
    gap: "6px",
  },
  sourceBadge: {
    fontSize: "0.68rem",
    fontWeight: 600,
    padding: "3px 9px",
    borderRadius: "100px",
    border: "1px solid",
    letterSpacing: "0.02em",
    textTransform: "uppercase",
  },
  cardDate: {
    fontSize: "0.72rem",
    color: "#475569",
  },
  cardTitle: {
    fontSize: "0.95rem",
    fontWeight: 700,
    color: "#e2e8f0",
    margin: "0 0 8px",
    lineHeight: 1.45,
  },
  cardDesc: {
    fontSize: "0.8rem",
    color: "#64748b",
    margin: "0 0 12px",
    lineHeight: 1.55,
    flex: 1,
  },
  readMore: {
    fontSize: "0.78rem",
    color: "#60a5fa",
    fontWeight: 600,
    marginTop: "auto",
  },

  // Pagination
  pagination: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "16px",
    marginTop: "32px",
    paddingBottom: "24px",
  },
  pageBtn: {
    padding: "9px 20px",
    borderRadius: "8px",
    border: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(255,255,255,0.04)",
    color: "#94a3b8",
    fontSize: "0.85rem",
    cursor: "pointer",
    transition: "background 0.2s",
  },
  pageInfo: {
    fontSize: "0.85rem",
    color: "#64748b",
  },

  // Error
  errorBox: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    background: "rgba(239,68,68,0.08)",
    border: "1px solid rgba(239,68,68,0.2)",
    borderRadius: "10px",
    padding: "14px 18px",
    marginBottom: "20px",
    color: "#f87171",
    fontSize: "0.875rem",
  },
  retryBtn: {
    padding: "6px 14px",
    background: "rgba(239,68,68,0.15)",
    border: "1px solid rgba(239,68,68,0.3)",
    borderRadius: "6px",
    color: "#f87171",
    fontSize: "0.8rem",
    cursor: "pointer",
    flexShrink: 0,
  },

  // Empty
  emptyState: {
    textAlign: "center",
    padding: "80px 20px",
    color: "#64748b",
  },
};
