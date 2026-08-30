import React, { useState, useRef } from "react";
import {
  Users,
  UserPlus,
  X,
  MessageSquare,
  ArrowUp,
  CheckCircle2
} from "lucide-react";

const STORAGE_KEY = "user_profile_data_v2";

const DEFAULT_PROFILE = {
  username: "gene.rodrig",
  firstName: "Gene",
  lastName: "Rodriguez",
  nickname: "Gene.r",
  displayName: "Gene",
  role: "Subscriber",
  email: "gene.rodrig@gmail.com",
  whatsapp: "@gene-rod",
  website: "gene-roding.webflow.io",
  telegram: "@gene-rod",
  bio: "Albert Einstein was a German mathematician and physicist who developed the special and general theories of relativity. In 1921, he won the Nobel Prize for physics for his explanation of the photoelectric effect. In the following decade.",
  photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
};

// Social SVG Icons
const FacebookIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);

const XTwitterIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4l16 16m0-16L4 20"/>
  </svg>
);

const InstagramIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);

const PinterestIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="4" x2="12" y2="20" />
    <circle cx="12" cy="10" r="6" />
  </svg>
);

export default function Profile() {
  const [activeNav, setActiveNav] = useState("all-users");
  const [profile, setProfile] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? { ...DEFAULT_PROFILE, ...JSON.parse(saved) } : DEFAULT_PROFILE;
    } catch {
      return DEFAULT_PROFILE;
    }
  });

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [language, setLanguage] = useState("English Language");

  const fileInputRef = useRef(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setProfile((prev) => ({ ...prev, photoUrl: imageUrl }));
      showToast("Photo updated successfully!");
    }
  };

  const handleRemovePhoto = () => {
    setProfile((prev) => ({
      ...prev,
      photoUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=600&q=80",
    }));
    showToast("Photo removed.");
  };

  const handleSaveProfile = (e) => {
    if (e) e.preventDefault();
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
      showToast("Profile saved successfully!");
    } catch {
      alert("Storage quota exceeded. Could not save profile.");
    }
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    if (!oldPassword || !newPassword) {
      alert("Please enter both old and new passwords.");
      return;
    }
    setOldPassword("");
    setNewPassword("");
    showToast("Password updated successfully!");
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div style={styles.container}>
      {/* Toast Notification */}
      {toastMessage && (
        <div style={styles.toast}>
          <CheckCircle2 size={18} color="#10b981" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── Main Card ── */}
      <div style={styles.card}>
        {/* ── Top Header Navigation ── */}
        <div style={styles.topHeader}>
          {/* Left: Icon & Title */}
          <div style={styles.headerLeft}>
            <div style={styles.userIconWrap}>
              <Users size={18} color="#475569" />
            </div>
            <span style={styles.headerTitle}>Users</span>
          </div>

          {/* Center: Tabs */}
          <div style={styles.tabsWrap}>
            <button
              type="button"
              onClick={() => setActiveNav("all-users")}
              style={{
                ...styles.tabBtn,
                ...(activeNav === "all-users" ? styles.tabBtnActive : styles.tabBtnInactive),
              }}
            >
              All Users
            </button>
            <button
              type="button"
              onClick={() => setActiveNav("settings")}
              style={{
                ...styles.tabBtn,
                ...(activeNav === "settings" ? styles.tabBtnActive : styles.tabBtnInactive),
              }}
            >
              Settings
            </button>
          </div>

          {/* Right: Add New User */}
          <button
            type="button"
            onClick={() => showToast("Add User dialog ready.")}
            style={styles.addUserBtn}
          >
            <UserPlus size={16} />
            <span>Add New User</span>
          </button>
        </div>

        {/* ── Content Grid: 2 Columns ── */}
        <div style={styles.contentGrid}>
          {/* ════════ LEFT COLUMN: Account Management ════════ */}
          <div style={styles.leftCol}>
            <h3 style={styles.sectionHeading}>Account Management</h3>

            {/* Photo Card */}
            <div style={styles.photoContainer}>
              <img
                src={profile.photoUrl}
                alt={profile.displayName || "User avatar"}
                style={styles.photoImg}
              />
              <button
                type="button"
                onClick={handleRemovePhoto}
                title="Remove photo"
                style={styles.photoCloseBtn}
              >
                <X size={15} color="#ffffff" />
              </button>
            </div>

            {/* Upload Button */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handlePhotoUpload}
              accept="image/*"
              style={{ display: "none" }}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              style={styles.uploadBtn}
            >
              Upload Photo
            </button>

            {/* Password Section */}
            <form onSubmit={handleChangePassword} style={{ marginTop: "24px" }}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Old Password</label>
                <input
                  type="password"
                  placeholder="*******"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  style={styles.input}
                />
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>New Password</label>
                <input
                  type="password"
                  placeholder="********"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={styles.input}
                />
              </div>

              <button type="submit" style={styles.outlineActionBtn}>
                Change Password
              </button>
            </form>
          </div>

          {/* ════════ RIGHT COLUMN: Profile Information ════════ */}
          <div style={styles.rightCol}>
            <form onSubmit={handleSaveProfile}>
              {/* Profile Information Group */}
              <h3 style={styles.sectionHeading}>Profile Information</h3>

              <div style={styles.twoColGrid}>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Username</label>
                  <input
                    type="text"
                    name="username"
                    value={profile.username}
                    onChange={handleChange}
                    style={styles.input}
                  />
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={profile.firstName}
                    onChange={handleChange}
                    style={styles.input}
                  />
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Nickname</label>
                  <input
                    type="text"
                    name="nickname"
                    value={profile.nickname}
                    onChange={handleChange}
                    style={styles.input}
                  />
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Role</label>
                  <select
                    name="role"
                    value={profile.role}
                    onChange={handleChange}
                    style={styles.select}
                  >
                    <option value="Subscriber">Subscriber</option>
                    <option value="Administrator">Administrator</option>
                    <option value="First Responder">First Responder</option>
                    <option value="Volunteer">Volunteer</option>
                    <option value="Officer">Emergency Officer</option>
                  </select>
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={profile.lastName}
                    onChange={handleChange}
                    style={styles.input}
                  />
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Display Name Publicly as</label>
                  <input
                    type="text"
                    name="displayName"
                    value={profile.displayName}
                    onChange={handleChange}
                    style={styles.input}
                  />
                </div>
              </div>

              {/* Contact Info Group */}
              <h3 style={{ ...styles.sectionHeading, marginTop: "28px" }}>Contact Info</h3>

              <div style={styles.twoColGrid}>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Email (required)</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={profile.email}
                    onChange={handleChange}
                    style={styles.input}
                  />
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>WhatsApp</label>
                  <input
                    type="text"
                    name="whatsapp"
                    value={profile.whatsapp}
                    onChange={handleChange}
                    style={styles.input}
                  />
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Website</label>
                  <input
                    type="text"
                    name="website"
                    value={profile.website}
                    onChange={handleChange}
                    style={styles.input}
                  />
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Telegram</label>
                  <input
                    type="text"
                    name="telegram"
                    value={profile.telegram}
                    onChange={handleChange}
                    style={styles.input}
                  />
                </div>
              </div>

              {/* About the User Group */}
              <h3 style={{ ...styles.sectionHeading, marginTop: "28px" }}>About the User</h3>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Biographical Info</label>
                <textarea
                  name="bio"
                  rows={4}
                  value={profile.bio}
                  onChange={handleChange}
                  style={styles.textarea}
                />
              </div>

              {/* Save Changes Button */}
              <div style={{ marginTop: "24px", display: "flex", justifyContent: "flex-end" }}>
                <button type="submit" style={styles.saveBtn}>
                  Save Profile Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* ── Footer Bar ── */}
      <div style={styles.footer}>
        {/* Social Icons */}
        <div style={styles.socialGroup}>
          <button
            type="button"
            style={styles.iconCircleBtn}
            onClick={() => window.open("https://facebook.com", "_blank")}
            title="Facebook"
          >
            <FacebookIcon />
          </button>
          <button
            type="button"
            style={styles.iconCircleBtn}
            onClick={() => window.open("https://x.com", "_blank")}
            title="X / Twitter"
          >
            <XTwitterIcon />
          </button>
          <button
            type="button"
            style={styles.iconCircleBtn}
            onClick={() => window.open("https://instagram.com", "_blank")}
            title="Instagram"
          >
            <InstagramIcon />
          </button>
          <button
            type="button"
            style={styles.iconCircleBtn}
            onClick={() => window.open("https://pinterest.com", "_blank")}
            title="Pinterest"
          >
            <PinterestIcon />
          </button>
        </div>

        {/* Language Selector */}
        <div style={styles.langSelectorWrap}>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            style={styles.langSelect}
          >
            <option value="English Language">English Language</option>
            <option value="Hindi Language">Hindi Language (हिन्दी)</option>
            <option value="Odia Language">Odia Language (ଓଡ଼ିଆ)</option>
            <option value="Spanish Language">Spanish Language</option>
          </select>
        </div>

        {/* Right Tools: Chat & Scroll Top */}
        <div style={styles.actionTools}>
          <button
            type="button"
            style={styles.iconCircleBtn}
            onClick={() => showToast("Chat Assistant ready.")}
            title="Support Chat"
          >
            <MessageSquare size={14} color="#64748b" />
          </button>
          <button
            type="button"
            style={styles.iconCircleBtn}
            onClick={scrollToTop}
            title="Back to Top"
          >
            <ArrowUp size={14} color="#64748b" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Styles (Matching the clean, minimalist white card UI) ─────────────
const styles = {
  container: {
    minHeight: "100%",
    padding: "20px 24px 40px 24px",
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    boxSizing: "border-box",
  },
  toast: {
    position: "fixed",
    top: "24px",
    right: "24px",
    zIndex: 9999,
    backgroundColor: "#ffffff",
    color: "#0f172a",
    padding: "12px 20px",
    borderRadius: "12px",
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.15)",
    border: "1px solid #e2e8f0",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontWeight: "600",
    fontSize: "0.9rem",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
    padding: "24px 32px 36px 32px",
    color: "#1e293b",
  },
  topHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: "20px",
    borderBottom: "1px solid #f1f5f9",
    marginBottom: "24px",
    flexWrap: "wrap",
    gap: "14px",
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  userIconWrap: {
    width: "32px",
    height: "32px",
    borderRadius: "8px",
    backgroundColor: "#f1f5f9",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: "1.1rem",
    fontWeight: "700",
    color: "#0f172a",
  },
  tabsWrap: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    padding: "3px",
    borderRadius: "10px",
    border: "1px solid #e2e8f0",
  },
  tabBtn: {
    padding: "6px 16px",
    borderRadius: "8px",
    fontSize: "0.85rem",
    fontWeight: "600",
    border: "none",
    cursor: "pointer",
    transition: "all 0.15s ease",
  },
  tabBtnActive: {
    backgroundColor: "#ffffff",
    color: "#0f172a",
    boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
  },
  tabBtnInactive: {
    backgroundColor: "transparent",
    color: "#64748b",
  },
  addUserBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    backgroundColor: "#1d4ed8",
    color: "#ffffff",
    border: "none",
    borderRadius: "10px",
    padding: "9px 18px",
    fontWeight: "600",
    fontSize: "0.88rem",
    cursor: "pointer",
    boxShadow: "0 2px 6px rgba(29, 78, 216, 0.2)",
  },
  contentGrid: {
    display: "grid",
    gridTemplateColumns: "300px 1fr",
    gap: "36px",
  },
  leftCol: {
    display: "flex",
    flexDirection: "column",
  },
  rightCol: {
    display: "flex",
    flexDirection: "column",
  },
  sectionHeading: {
    fontSize: "0.95rem",
    fontWeight: "700",
    color: "#334155",
    margin: "0 0 16px 0",
  },
  photoContainer: {
    position: "relative",
    width: "100%",
    height: "260px",
    borderRadius: "14px",
    overflow: "hidden",
    backgroundColor: "#f8fafc",
    border: "1px solid #e2e8f0",
  },
  photoImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },
  photoCloseBtn: {
    position: "absolute",
    top: "12px",
    right: "12px",
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    backgroundColor: "rgba(15, 23, 42, 0.5)",
    backdropFilter: "blur(4px)",
    border: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },
  uploadBtn: {
    marginTop: "14px",
    width: "100%",
    padding: "10px 16px",
    backgroundColor: "#ffffff",
    color: "#334155",
    border: "1px solid #cbd5e1",
    borderRadius: "10px",
    fontWeight: "600",
    fontSize: "0.88rem",
    cursor: "pointer",
    boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
  },
  outlineActionBtn: {
    marginTop: "8px",
    width: "100%",
    padding: "10px 16px",
    backgroundColor: "#ffffff",
    color: "#334155",
    border: "1px solid #cbd5e1",
    borderRadius: "10px",
    fontWeight: "600",
    fontSize: "0.88rem",
    cursor: "pointer",
  },
  twoColGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px 20px",
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    marginBottom: "12px",
  },
  label: {
    fontSize: "0.82rem",
    fontWeight: "600",
    color: "#475569",
  },
  input: {
    width: "100%",
    padding: "10px 14px",
    backgroundColor: "#ffffff",
    border: "1px solid #cbd5e1",
    borderRadius: "10px",
    color: "#0f172a",
    fontSize: "0.88rem",
    outline: "none",
    boxSizing: "border-box",
  },
  select: {
    width: "100%",
    padding: "10px 14px",
    backgroundColor: "#ffffff",
    border: "1px solid #cbd5e1",
    borderRadius: "10px",
    color: "#0f172a",
    fontSize: "0.88rem",
    outline: "none",
    boxSizing: "border-box",
    cursor: "pointer",
  },
  textarea: {
    width: "100%",
    padding: "12px 14px",
    backgroundColor: "#ffffff",
    border: "1px solid #cbd5e1",
    borderRadius: "10px",
    color: "#0f172a",
    fontSize: "0.88rem",
    lineHeight: "1.5",
    outline: "none",
    resize: "vertical",
    boxSizing: "border-box",
  },
  saveBtn: {
    padding: "11px 24px",
    backgroundColor: "#1d4ed8",
    color: "#ffffff",
    border: "none",
    borderRadius: "10px",
    fontWeight: "600",
    fontSize: "0.9rem",
    cursor: "pointer",
    boxShadow: "0 2px 6px rgba(29, 78, 216, 0.2)",
  },
  footer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: "24px",
    padding: "0 10px",
    flexWrap: "wrap",
    gap: "14px",
  },
  socialGroup: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  iconCircleBtn: {
    width: "34px",
    height: "34px",
    borderRadius: "50%",
    backgroundColor: "#ffffff",
    border: "1px solid #e2e8f0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
  },
  langSelectorWrap: {
    display: "flex",
    alignItems: "center",
  },
  langSelect: {
    padding: "6px 16px",
    backgroundColor: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "999px",
    fontSize: "0.82rem",
    fontWeight: "600",
    color: "#475569",
    outline: "none",
    cursor: "pointer",
  },
  actionTools: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
};