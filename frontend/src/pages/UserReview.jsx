import React, { useState, useEffect } from "react";
import { saveUserReview, getUserReviews } from "../utils/adminAuth";
import { getOfflineSession } from "../utils/offlineStorage";

const CATEGORIES = [
  "General Feedback",
  "Alert System",
  "Rescue Operations",
  "Shelter Finder",
  "Family Safety",
  "Evacuation Planner",
  "AI Assistant / Chatbot",
  "Map & Navigation",
  "Damage Assessment",
  "Notifications",
  "Platform Performance",
  "Bug Report",
];

const STAR_LABELS = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"];

function StarRating({ rating, onRate, readonly = false }) {
  const [hovered, setHovered] = useState(0);

  return (
    <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          onClick={() => !readonly && onRate(star)}
          onMouseEnter={() => !readonly && setHovered(star)}
          onMouseLeave={() => !readonly && setHovered(0)}
          style={{
            fontSize: readonly ? "1.1rem" : "1.6rem",
            cursor: readonly ? "default" : "pointer",
            color: star <= (hovered || rating) ? "#f59e0b" : "#334155",
            transition: "color 0.15s, transform 0.1s",
            transform: !readonly && star === hovered ? "scale(1.2)" : "scale(1)",
            display: "inline-block",
            userSelect: "none",
          }}
        >
          ★
        </span>
      ))}
      {!readonly && (hovered || rating) > 0 && (
        <span style={{ fontSize: "0.82rem", color: "#fbbf24", fontWeight: "600", marginLeft: "4px" }}>
          {STAR_LABELS[hovered || rating]}
        </span>
      )}
    </div>
  );
}

export default function UserReview() {
  const [currentUser, setCurrentUser] = useState(null);
  const [form, setForm] = useState({
    rating: 0,
    category: "General Feedback",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [myReviews, setMyReviews] = useState([]);
  const [activeTab, setActiveTab] = useState("submit"); // "submit" | "history"

  useEffect(() => {
    getOfflineSession().then((session) => {
      if (session) setCurrentUser(session);
    });

    // Load this user's past reviews
    const all = getUserReviews();
    setMyReviews(all);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (form.rating === 0) {
      setError("Please select a star rating before submitting.");
      return;
    }
    if (!form.message.trim() || form.message.trim().length < 10) {
      setError("Please write at least 10 characters in your review message.");
      return;
    }

    const result = saveUserReview({
      name: currentUser?.name || "Anonymous",
      email: currentUser?.email || "",
      rating: form.rating,
      category: form.category,
      message: form.message.trim(),
    });

    if (result.success) {
      setSubmitted(true);
      setMyReviews(getUserReviews());
      setForm({ rating: 0, category: "General Feedback", message: "" });
    }
  };

  const avgRating =
    myReviews.length > 0
      ? (myReviews.reduce((s, r) => s + r.rating, 0) / myReviews.length).toFixed(1)
      : null;

  return (
    <div
      style={{
        padding: "24px 28px",
        minHeight: "100vh",
        backgroundColor: "#020617",
        color: "#f8fafc",
        fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif",
      }}
    >
      {/* ── HEADER ── */}
      <div
        style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 60%, #0f2850 100%)",
          border: "1.5px solid #3b82f6",
          borderRadius: "18px",
          padding: "28px 32px",
          marginBottom: "28px",
          boxShadow: "0 10px 40px rgba(59, 130, 246, 0.18)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "rgba(59, 130, 246, 0.18)",
              border: "1px solid rgba(59, 130, 246, 0.5)",
              padding: "4px 14px",
              borderRadius: "999px",
              fontSize: "0.78rem",
              color: "#93c5fd",
              fontWeight: "700",
              marginBottom: "10px",
              letterSpacing: "0.04em",
            }}
          >
            ⭐ PLATFORM FEEDBACK PORTAL
          </div>
          <h1
            style={{
              margin: "0 0 6px 0",
              fontSize: "1.85rem",
              fontWeight: "800",
              color: "#f1f5f9",
              letterSpacing: "-0.02em",
            }}
          >
            📝 Submit Your Platform Review
          </h1>
          <p style={{ margin: 0, color: "#94a3b8", fontSize: "0.92rem", lineHeight: "1.5" }}>
            Your feedback helps improve the Disaster Management Platform for all responders and citizens.
            <br />
            Reviews are sent directly to the Administrator for review.
          </p>
        </div>

        {avgRating && (
          <div
            style={{
              textAlign: "center",
              background: "rgba(245, 158, 11, 0.1)",
              border: "1px solid rgba(245, 158, 11, 0.3)",
              borderRadius: "14px",
              padding: "14px 22px",
              minWidth: "120px",
            }}
          >
            <div style={{ fontSize: "2.2rem", fontWeight: "900", color: "#f59e0b" }}>{avgRating}</div>
            <div style={{ fontSize: "0.75rem", color: "#fde68a", fontWeight: "600" }}>Avg. Rating</div>
            <div style={{ fontSize: "0.7rem", color: "#94a3b8", marginTop: "2px" }}>
              {myReviews.length} review{myReviews.length !== 1 ? "s" : ""}
            </div>
          </div>
        )}
      </div>

      {/* ── TABS ── */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          borderBottom: "1px solid #1e293b",
          paddingBottom: "12px",
          marginBottom: "24px",
        }}
      >
        {[
          { id: "submit", label: "✍️ Write a Review" },
          { id: "history", label: `📋 Review History (${myReviews.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setSubmitted(false);
            }}
            style={{
              padding: "10px 20px",
              borderRadius: "8px",
              border: "none",
              backgroundColor: activeTab === tab.id ? "#2563eb" : "rgba(30, 41, 59, 0.7)",
              color: activeTab === tab.id ? "#fff" : "#94a3b8",
              fontWeight: activeTab === tab.id ? "700" : "500",
              fontSize: "0.9rem",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── TAB 1: SUBMIT REVIEW ── */}
      {activeTab === "submit" && (
        <div style={{ maxWidth: "700px" }}>
          {submitted ? (
            /* ── SUCCESS STATE ── */
            <div
              style={{
                background: "linear-gradient(135deg, rgba(16,185,129,0.12), rgba(5,150,105,0.08))",
                border: "1.5px solid #10b981",
                borderRadius: "18px",
                padding: "48px 36px",
                textAlign: "center",
                boxShadow: "0 0 30px rgba(16, 185, 129, 0.12)",
              }}
            >
              <div style={{ fontSize: "4rem", marginBottom: "16px", animation: "pulse 1.5s infinite" }}>
                ✅
              </div>
              <h2 style={{ color: "#34d399", fontWeight: "800", fontSize: "1.5rem", margin: "0 0 10px 0" }}>
                Review Submitted Successfully!
              </h2>
              <p style={{ color: "#a7f3d0", fontSize: "0.95rem", lineHeight: "1.6", margin: "0 0 24px 0" }}>
                Thank you for your feedback! The Administrator has been notified and will review your submission shortly.
              </p>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  backgroundColor: "rgba(16, 185, 129, 0.15)",
                  border: "1px solid rgba(16, 185, 129, 0.4)",
                  borderRadius: "999px",
                  padding: "6px 16px",
                  fontSize: "0.82rem",
                  color: "#6ee7b7",
                  marginBottom: "24px",
                }}
              >
                🔔 Administrator Notified
              </div>
              <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
                <button
                  onClick={() => setSubmitted(false)}
                  style={{
                    padding: "11px 22px",
                    backgroundColor: "#2563eb",
                    color: "#fff",
                    border: "none",
                    borderRadius: "9px",
                    fontWeight: "700",
                    fontSize: "0.9rem",
                    cursor: "pointer",
                  }}
                >
                  ✍️ Submit Another Review
                </button>
                <button
                  onClick={() => setActiveTab("history")}
                  style={{
                    padding: "11px 22px",
                    backgroundColor: "rgba(30, 41, 59, 0.8)",
                    color: "#94a3b8",
                    border: "1px solid #334155",
                    borderRadius: "9px",
                    fontWeight: "600",
                    fontSize: "0.9rem",
                    cursor: "pointer",
                  }}
                >
                  📋 View My Reviews
                </button>
              </div>
            </div>
          ) : (
            /* ── REVIEW FORM ── */
            <div
              style={{
                backgroundColor: "rgba(15, 23, 42, 0.9)",
                border: "1px solid #1e293b",
                borderRadius: "18px",
                padding: "28px 32px",
                boxShadow: "0 8px 30px rgba(0,0,0,0.3)",
              }}
            >
              <h2 style={{ margin: "0 0 6px 0", fontSize: "1.2rem", fontWeight: "700", color: "#f1f5f9" }}>
                Share Your Experience
              </h2>
              <p style={{ margin: "0 0 24px 0", fontSize: "0.83rem", color: "#64748b" }}>
                Submitting as:{" "}
                <strong style={{ color: "#38bdf8" }}>
                  {currentUser?.name || "Anonymous"}{" "}
                  {currentUser?.email ? `(${currentUser.email})` : ""}
                </strong>
              </p>

              {error && (
                <div
                  style={{
                    backgroundColor: "rgba(239, 68, 68, 0.12)",
                    border: "1px solid rgba(239, 68, 68, 0.4)",
                    borderRadius: "8px",
                    padding: "10px 14px",
                    marginBottom: "18px",
                    color: "#fca5a5",
                    fontSize: "0.87rem",
                  }}
                >
                  ⚠️ {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* STAR RATING */}
                <div style={{ marginBottom: "22px" }}>
                  <label
                    style={{
                      fontSize: "0.84rem",
                      color: "#cbd5e1",
                      display: "block",
                      marginBottom: "10px",
                      fontWeight: "600",
                    }}
                  >
                    Overall Rating <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <StarRating
                    rating={form.rating}
                    onRate={(r) => setForm((f) => ({ ...f, rating: r }))}
                  />
                  {form.rating === 0 && (
                    <p style={{ fontSize: "0.77rem", color: "#64748b", marginTop: "6px" }}>
                      Click a star to rate
                    </p>
                  )}
                </div>

                {/* CATEGORY */}
                <div style={{ marginBottom: "18px" }}>
                  <label
                    style={{
                      fontSize: "0.84rem",
                      color: "#cbd5e1",
                      display: "block",
                      marginBottom: "6px",
                      fontWeight: "600",
                    }}
                  >
                    Review Category
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                    style={{
                      width: "100%",
                      padding: "11px 14px",
                      backgroundColor: "#0f172a",
                      border: "1px solid #334155",
                      borderRadius: "9px",
                      color: "#f1f5f9",
                      fontSize: "0.9rem",
                      appearance: "none",
                      backgroundImage:
                        "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%2394a3b8' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E\")",
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "right 14px center",
                    }}
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* MESSAGE */}
                <div style={{ marginBottom: "24px" }}>
                  <label
                    style={{
                      fontSize: "0.84rem",
                      color: "#cbd5e1",
                      display: "block",
                      marginBottom: "6px",
                      fontWeight: "600",
                    }}
                  >
                    Your Review <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <textarea
                    value={form.message}
                    onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                    placeholder="Share your detailed experience with this platform section. What worked well? What could be improved?"
                    rows={5}
                    maxLength={1000}
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      backgroundColor: "#0f172a",
                      border: "1px solid #334155",
                      borderRadius: "9px",
                      color: "#f1f5f9",
                      fontSize: "0.9rem",
                      resize: "vertical",
                      lineHeight: "1.6",
                      boxSizing: "border-box",
                      fontFamily: "inherit",
                    }}
                  />
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "0.75rem",
                      color: "#475569",
                      marginTop: "4px",
                    }}
                  >
                    <span>Minimum 10 characters</span>
                    <span
                      style={{
                        color: form.message.length > 900 ? "#ef4444" : "#475569",
                      }}
                    >
                      {form.message.length}/1000
                    </span>
                  </div>
                </div>

                {/* ADMIN NOTIFICATION NOTICE */}
                <div
                  style={{
                    backgroundColor: "rgba(99, 102, 241, 0.08)",
                    border: "1px solid rgba(99, 102, 241, 0.3)",
                    borderRadius: "8px",
                    padding: "10px 14px",
                    marginBottom: "20px",
                    fontSize: "0.8rem",
                    color: "#a5b4fc",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <span style={{ fontSize: "1rem" }}>🔔</span>
                  <span>
                    Your review will be sent directly to the Administrator and will appear in the{" "}
                    <strong style={{ color: "#c7d2fe" }}>Administrator Hub → Reviews</strong> section.
                  </span>
                </div>

                <button
                  type="submit"
                  style={{
                    width: "100%",
                    padding: "13px",
                    borderRadius: "10px",
                    background: "linear-gradient(135deg, #2563eb, #4f46e5)",
                    color: "#fff",
                    fontWeight: "700",
                    fontSize: "1rem",
                    border: "none",
                    cursor: "pointer",
                    boxShadow: "0 4px 16px rgba(37, 99, 235, 0.4)",
                    transition: "opacity 0.2s",
                    letterSpacing: "0.01em",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.88")}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                >
                  ⭐ Submit Review &amp; Notify Administrator →
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 2: REVIEW HISTORY ── */}
      {activeTab === "history" && (
        <div>
          {myReviews.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "60px 24px",
                color: "#475569",
              }}
            >
              <div style={{ fontSize: "3rem", marginBottom: "12px" }}>📝</div>
              <p style={{ fontSize: "1rem", fontWeight: "600" }}>No reviews submitted yet.</p>
              <p style={{ fontSize: "0.85rem" }}>Be the first to share your feedback!</p>
              <button
                onClick={() => setActiveTab("submit")}
                style={{
                  marginTop: "16px",
                  padding: "10px 22px",
                  backgroundColor: "#2563eb",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  fontWeight: "700",
                  cursor: "pointer",
                  fontSize: "0.9rem",
                }}
              >
                ✍️ Write Your First Review
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px", maxWidth: "800px" }}>
              {myReviews.map((review) => (
                <div
                  key={review.id}
                  style={{
                    backgroundColor: "rgba(15, 23, 42, 0.85)",
                    border: `1px solid ${review.readByAdmin ? "#1e293b" : "rgba(59, 130, 246, 0.4)"}`,
                    borderRadius: "14px",
                    padding: "18px 20px",
                    position: "relative",
                    transition: "border-color 0.2s",
                  }}
                >
                  {/* Unread badge */}
                  {!review.readByAdmin && (
                    <span
                      style={{
                        position: "absolute",
                        top: "14px",
                        right: "14px",
                        backgroundColor: "rgba(59, 130, 246, 0.2)",
                        border: "1px solid rgba(59, 130, 246, 0.5)",
                        color: "#93c5fd",
                        fontSize: "0.68rem",
                        fontWeight: "700",
                        padding: "2px 8px",
                        borderRadius: "999px",
                      }}
                    >
                      Pending Admin Review
                    </span>
                  )}
                  {review.readByAdmin && (
                    <span
                      style={{
                        position: "absolute",
                        top: "14px",
                        right: "14px",
                        backgroundColor: "rgba(16, 185, 129, 0.1)",
                        border: "1px solid rgba(16, 185, 129, 0.3)",
                        color: "#6ee7b7",
                        fontSize: "0.68rem",
                        fontWeight: "700",
                        padding: "2px 8px",
                        borderRadius: "999px",
                      }}
                    >
                      ✓ Seen by Admin
                    </span>
                  )}

                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px", flexWrap: "wrap" }}>
                    <StarRating rating={review.rating} readonly />
                    <span
                      style={{
                        backgroundColor: "rgba(99, 102, 241, 0.18)",
                        color: "#a5b4fc",
                        fontSize: "0.72rem",
                        fontWeight: "700",
                        padding: "2px 8px",
                        borderRadius: "4px",
                        border: "1px solid rgba(99, 102, 241, 0.3)",
                      }}
                    >
                      {review.category}
                    </span>
                  </div>

                  <p
                    style={{
                      margin: "0 0 10px 0",
                      color: "#cbd5e1",
                      fontSize: "0.88rem",
                      lineHeight: "1.6",
                      fontStyle: "italic",
                    }}
                  >
                    "{review.message}"
                  </p>

                  <div style={{ fontSize: "0.75rem", color: "#475569", display: "flex", gap: "16px", flexWrap: "wrap" }}>
                    <span>
                      👤 <strong style={{ color: "#64748b" }}>{review.name}</strong>
                    </span>
                    <span>
                      🕐{" "}
                      {new Date(review.submittedAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <span style={{ color: "#334155" }}>ID: {review.id}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
