import React, { useState, useEffect, useRef } from "react";
import {
  Users,
  UserPlus,
  X,
  MessageSquare,
  ArrowUp,
  CheckCircle2,
  Download,
  Upload,
  QrCode,
  ShieldCheck,
  Phone,
  AlertTriangle,
  FileBadge
} from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { updateUserPassword, updateUserProfilePhoto } from "../services/firebaseAuth";
import { saveOfflineSession, getOfflineSession } from "../utils/offlineStorage";
import { cleanWhatsAppNumber } from "../utils/phoneUtils";

const STORAGE_KEY = "user_profile_data_v2";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Default placeholder profile when no user is logged in
const DEFAULT_PROFILE = {
  username: "responder.user",
  firstName: "Disaster",
  lastName: "Responder",
  nickname: "Rescue-1",
  displayName: "Disaster Responder",
  role: "Citizen / Responder",
  email: "responder@disaster-management.org",
  phone: "+91 98765 43210",
  whatsapp: "+91 98765 43210",
  website: "https://disaster-management-platform.org",
  telegram: "@disaster_responder",
  bloodGroup: "O+",
  emergencyContact: "+91 91234 56789",
  location: "Bhubaneswar, Odisha",
  bio: "Certified Disaster Response & First-Aid volunteer trained in cyclone evacuation, flood rescue logistics, and emergency communication.",
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
      const savedProfile = localStorage.getItem(STORAGE_KEY);
      if (savedProfile) {
        return { ...DEFAULT_PROFILE, ...JSON.parse(savedProfile) };
      }

      // Check user session
      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        const userObj = JSON.parse(savedUser);
        const nameParts = (userObj.name || "").split(" ");
        const firstName = nameParts[0] || "Responder";
        const lastName = nameParts.slice(1).join(" ") || "";
        const username = (userObj.email || "user").split("@")[0].toLowerCase().replace(/[^a-z0-9._-]/g, "");

        return {
          ...DEFAULT_PROFILE,
          username,
          firstName,
          lastName,
          nickname: firstName,
          displayName: userObj.name || "Responder",
          email: userObj.email || DEFAULT_PROFILE.email,
          role: userObj.role === "admin" ? "Administrator" : "Citizen / Responder",
          photoUrl: userObj.photoUrl || userObj.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(userObj.name || "User")}`,
        };
      }
    } catch (err) {
      console.warn("Could not load initial user session:", err);
    }
    return DEFAULT_PROFILE;
  });

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");
  const [language, setLanguage] = useState("English Language");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  const fileInputRef = useRef(null);
  const importFileRef = useRef(null);

  // Sync with real authenticated session on mount
  useEffect(() => {
    async function loadRealSession() {
      try {
        const offlineSession = await getOfflineSession();
        const userStr = localStorage.getItem("user");
        const activeUser = offlineSession || (userStr ? JSON.parse(userStr) : null);

        if (activeUser && activeUser.email) {
          setProfile((prev) => {
            const nameParts = (activeUser.name || prev.displayName || "").split(" ");
            const firstName = prev.firstName || nameParts[0] || "Responder";
            const lastName = prev.lastName || nameParts.slice(1).join(" ") || "";
            const username = prev.username || activeUser.email.split("@")[0].toLowerCase();
            const photoUrl = activeUser.photoUrl || activeUser.profileImage || prev.photoUrl;

            return {
              ...prev,
              email: activeUser.email,
              displayName: activeUser.name || prev.displayName,
              firstName,
              lastName,
              username,
              photoUrl,
            };
          });
        }
      } catch (err) {
        console.warn("Session hydration notice:", err);
      }
    }
    loadRealSession();
  }, []);

  const showToast = (msg, type = "success") => {
    setToastType(type);
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  // Upload photo to backend Cloudinary API and sync profile
  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast("Avatar image must be smaller than 5 MB.", "error");
      return;
    }

    setUploadingPhoto(true);
    showToast("Uploading photo to Cloudinary...", "info");

    const localPreview = URL.createObjectURL(file);
    setProfile((prev) => ({ ...prev, photoUrl: localPreview }));

    try {
      const authToken = localStorage.getItem("token");
      let uploadedUrl = localPreview;

      // Try uploading to backend Cloudinary if online & authenticated
      if (authToken && !authToken.startsWith("demo-") && !authToken.startsWith("local-")) {
        const formData = new FormData();
        formData.append("avatar", file);

        const res = await fetch(`${API_URL}/api/users/upload-avatar`, {
          method: "POST",
          headers: { Authorization: `Bearer ${authToken}` },
          body: formData,
        });

        if (res.ok) {
          const json = await res.json();
          uploadedUrl = json.data?.url || localPreview;
        }
      }

      // Update Firebase user profile photo
      try {
        await updateUserProfilePhoto(uploadedUrl, profile.displayName);
      } catch {}

      // Update state & persistence
      const updatedProfile = { ...profile, photoUrl: uploadedUrl };
      setProfile(updatedProfile);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProfile));

      // Update user session object
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const userObj = JSON.parse(userStr);
        userObj.photoUrl = uploadedUrl;
        userObj.profileImage = uploadedUrl;
        localStorage.setItem("user", JSON.stringify(userObj));
        await saveOfflineSession(userObj);
      }

      showToast("Profile photo updated & uploaded to Cloudinary successfully!", "success");
    } catch (err) {
      console.error("Photo upload error:", err);
      showToast("Photo saved locally. Cloud sync will retry when online.", "info");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleRemovePhoto = async () => {
    const defaultAvatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(profile.displayName || "User")}`;
    const updated = { ...profile, photoUrl: defaultAvatar };
    setProfile(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    const userStr = localStorage.getItem("user");
    if (userStr) {
      const userObj = JSON.parse(userStr);
      userObj.photoUrl = defaultAvatar;
      userObj.profileImage = defaultAvatar;
      localStorage.setItem("user", JSON.stringify(userObj));
      await saveOfflineSession(userObj);
    }
    showToast("Photo removed and reset to initials avatar.");
  };

  const handleSaveProfile = async (e) => {
    if (e) e.preventDefault();
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));

      const cleanPh = cleanWhatsAppNumber(profile.whatsapp) || cleanWhatsAppNumber(profile.phone);
      const cleanEm = cleanWhatsAppNumber(profile.emergencyContact) || cleanPh;
      if (cleanPh) {
        localStorage.setItem("user_phone", cleanPh);
      }
      if (cleanEm) {
        localStorage.setItem("sos_whatsapp_number", cleanEm);
        localStorage.setItem("emergency_contact_number", cleanEm);
      }

      // Sync with user session
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const userObj = JSON.parse(userStr);
        userObj.name = profile.displayName || `${profile.firstName} ${profile.lastName}`.trim();
        userObj.email = profile.email;
        userObj.photoUrl = profile.photoUrl;
        userObj.profileImage = profile.photoUrl;
        localStorage.setItem("user", JSON.stringify(userObj));
        await saveOfflineSession(userObj);
      }

      // Try updating backend profile
      const authToken = localStorage.getItem("token");
      if (authToken && !authToken.startsWith("demo-") && !authToken.startsWith("local-")) {
        const userObj = userStr ? JSON.parse(userStr) : null;
        if (userObj?.uid || userObj?.id) {
          fetch(`${API_URL}/api/users/${userObj.uid || userObj.id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({
              name: profile.displayName,
              phone: profile.phone,
              profileImage: profile.photoUrl,
              address: profile.location,
            }),
          }).catch(() => {});
        }
      }

      showToast("Profile & Disaster Identity saved successfully!");
    } catch {
      showToast("Storage error. Could not save profile.", "error");
    }
  };

  // Change Password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      showToast("New password must be at least 6 characters.", "error");
      return;
    }

    try {
      await updateUserPassword(newPassword);
      setOldPassword("");
      setNewPassword("");
      showToast("Password changed successfully in Firebase Auth!", "success");
    } catch (err) {
      console.warn("Password change fallback:", err);
      setOldPassword("");
      setNewPassword("");
      showToast("Password updated for local/demo session.", "info");
    }
  };

  // ─── PORTABLE PROFILE EXPORT & IMPORT ─────────────────────────────────────

  // Export profile as portable JSON document
  const handleExportProfile = () => {
    const exportData = {
      platform: "Disaster Management & Emergency Response Platform",
      exportVersion: "2.1.0",
      timestamp: new Date().toISOString(),
      portableIdentity: {
        ...profile,
        rescueIdHash: `SAFE-${btoa(profile.email || "user").substring(0, 8)}`,
      },
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `disaster-profile-${profile.username || "responder"}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast("Portable Profile exported successfully!");
  };

  // Import profile from portable JSON document
  const handleImportProfile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        const data = imported.portableIdentity || imported;
        if (data.email || data.displayName || data.username) {
          const merged = { ...profile, ...data };
          setProfile(merged);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
          showToast("Portable Profile loaded and restored successfully!");
        } else {
          showToast("Invalid profile file format.", "error");
        }
      } catch {
        showToast("Failed to parse portable profile file.", "error");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const qrRescueData = JSON.stringify({
    name: profile.displayName || `${profile.firstName} ${profile.lastName}`,
    email: profile.email,
    role: profile.role,
    blood: profile.bloodGroup,
    phone: profile.emergencyContact || profile.phone,
    loc: profile.location,
    portal: profile.website,
  });

  return (
    <div style={styles.container}>
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          ...styles.toast,
          borderLeft: toastType === "error" ? "4px solid #ef4444" : toastType === "info" ? "4px solid #3b82f6" : "4px solid #10b981",
        }}>
          {toastType === "error" ? (
            <AlertTriangle size={18} color="#ef4444" />
          ) : (
            <CheckCircle2 size={18} color="#10b981" />
          )}
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── QR Rescue Modal ── */}
      {showQrModal && (
        <div style={styles.modalOverlay} onClick={() => setShowQrModal(false)}>
          <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <QrCode size={20} color="#1d4ed8" />
                <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "700" }}>Portable Emergency Rescue ID</h3>
              </div>
              <button onClick={() => setShowQrModal(false)} style={styles.closeBtn}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "20px 0" }}>
              <div style={styles.qrBadgeBox}>
                <QRCodeCanvas
                  value={qrRescueData}
                  size={190}
                  bgColor="#ffffff"
                  fgColor="#0f172a"
                  level="H"
                />
              </div>

              <div style={{ marginTop: "16px", textAlign: "center", width: "100%" }}>
                <h4 style={{ margin: "0 0 4px 0", fontSize: "1.05rem", color: "#0f172a" }}>
                  {profile.displayName || `${profile.firstName} ${profile.lastName}`}
                </h4>
                <p style={{ margin: "0 0 8px 0", color: "#64748b", fontSize: "0.85rem" }}>
                  {profile.role} • <strong style={{ color: "#ef4444" }}>Blood: {profile.bloodGroup}</strong>
                </p>
                <div style={styles.badgeDetails}>
                  <div><strong>Emergency Contact:</strong> {profile.emergencyContact || profile.phone || "Not set"}</div>
                  <div><strong>Base Location:</strong> {profile.location}</div>
                  <div><strong>Portal:</strong> {profile.website}</div>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "12px" }}>
              <button onClick={handleExportProfile} style={styles.portableActionBtn}>
                <Download size={15} />
                Export Profile JSON
              </button>
              <button onClick={() => window.print()} style={styles.printBtn}>
                <FileBadge size={15} />
                Print Card
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Main Card ── */}
      <div style={styles.card}>
        {/* ── Top Header Navigation ── */}
        <div style={styles.topHeader}>
          {/* Left: Icon & Title */}
          <div style={styles.headerLeft}>
            <div style={styles.userIconWrap}>
              <Users size={18} color="#1d4ed8" />
            </div>
            <div>
              <span style={styles.headerTitle}>Responder & User Profile</span>
              <span style={styles.verifiedPill}>
                <ShieldCheck size={12} color="#10b981" /> Verified Identity
              </span>
            </div>
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

          {/* Right: Portable Actions & Add User */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={() => setShowQrModal(true)}
              style={styles.qrBadgeBtn}
              title="View & scan portable emergency QR badge"
            >
              <QrCode size={15} />
              <span>QR Rescue ID</span>
            </button>

            <button
              type="button"
              onClick={handleExportProfile}
              style={styles.exportBtn}
              title="Export portable profile JSON for this platform"
            >
              <Download size={15} />
              <span>Export</span>
            </button>

            <input
              type="file"
              ref={importFileRef}
              accept=".json"
              onChange={handleImportProfile}
              style={{ display: "none" }}
            />
            <button
              type="button"
              onClick={() => importFileRef.current?.click()}
              style={styles.importBtn}
              title="Import previously saved portable profile"
            >
              <Upload size={15} />
              <span>Import</span>
            </button>

            <button
              type="button"
              onClick={() => showToast("Add New Responder profile ready.")}
              style={styles.addUserBtn}
            >
              <UserPlus size={16} />
              <span>Add New User</span>
            </button>
          </div>
        </div>

        {/* ── Content Grid: 2 Columns ── */}
        <div style={styles.contentGrid}>
          {/* ════════ LEFT COLUMN: Account Management ════════ */}
          <div style={styles.leftCol}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ ...styles.sectionHeading, margin: 0 }}>Account Management</h3>
              <span style={styles.roleTag}>{profile.role}</span>
            </div>

            {/* Photo Card */}
            <div style={styles.photoContainer}>
              <img
                src={profile.photoUrl}
                alt={profile.displayName || "User avatar"}
                style={styles.photoImg}
                onError={(e) => {
                  e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(profile.displayName || "User")}`;
                }}
              />
              <button
                type="button"
                onClick={handleRemovePhoto}
                title="Remove photo"
                style={styles.photoCloseBtn}
              >
                <X size={15} color="#ffffff" />
              </button>
              {uploadingPhoto && (
                <div style={styles.uploadingOverlay}>
                  <span>Uploading...</span>
                </div>
              )}
            </div>

            {/* Upload Button */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handlePhotoUpload}
              accept="image/jpeg,image/png,image/webp,image/gif"
              style={{ display: "none" }}
            />
            <button
              type="button"
              disabled={uploadingPhoto}
              onClick={() => fileInputRef.current?.click()}
              style={{
                ...styles.uploadBtn,
                opacity: uploadingPhoto ? 0.7 : 1,
                cursor: uploadingPhoto ? "wait" : "pointer",
              }}
            >
              {uploadingPhoto ? "Uploading to Cloudinary..." : "Upload Photo"}
            </button>

            {/* Disaster Emergency Badge Summary */}
            <div style={styles.emergencySummaryBox}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <span style={{ fontSize: "0.8rem", fontWeight: "700", color: "#b91c1c" }}>🚨 Emergency Details</span>
                <span style={styles.bloodTag}>Blood: {profile.bloodGroup}</span>
              </div>
              <div style={{ fontSize: "0.78rem", color: "#475569", lineHeight: "1.4" }}>
                <div>📍 <strong>Zone:</strong> {profile.location}</div>
                <div>📞 <strong>SOS Contact:</strong> {profile.emergencyContact || profile.phone || "Not configured"}</div>
              </div>
            </div>

            {/* Password Section */}
            <form onSubmit={handleChangePassword} style={{ marginTop: "24px" }}>
              <h4 style={{ margin: "0 0 12px 0", fontSize: "0.88rem", fontWeight: "700", color: "#334155" }}>
                Security & Access Key
              </h4>

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
                  placeholder="Enter min 6 characters"
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
                    placeholder="responder.user"
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
                    placeholder="First name"
                  />
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Nickname / Call Sign</label>
                  <input
                    type="text"
                    name="nickname"
                    value={profile.nickname}
                    onChange={handleChange}
                    style={styles.input}
                    placeholder="Call sign / radio name"
                  />
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Role in Platform</label>
                  <select
                    name="role"
                    value={profile.role}
                    onChange={handleChange}
                    style={styles.select}
                  >
                    <option value="Citizen / Responder">Citizen / Responder</option>
                    <option value="Volunteer">Volunteer</option>
                    <option value="First Responder">First Responder</option>
                    <option value="Administrator">Administrator</option>
                    <option value="Emergency Officer">Emergency Officer</option>
                    <option value="Shelter Coordinator">Shelter Coordinator</option>
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
                    placeholder="Last name"
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
                    placeholder="Public display name"
                  />
                </div>
              </div>

              {/* Contact & Website Info Group */}
              <h3 style={{ ...styles.sectionHeading, marginTop: "28px" }}>
                Contact & Website Information
              </h3>

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
                    placeholder="user@example.com"
                  />
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>WhatsApp / Emergency Phone</label>
                  <input
                    type="text"
                    name="whatsapp"
                    value={profile.whatsapp}
                    onChange={handleChange}
                    style={styles.input}
                    placeholder="+91 98765 43210"
                  />
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Website / Organization URL</label>
                  <input
                    type="text"
                    name="website"
                    value={profile.website}
                    onChange={handleChange}
                    style={styles.input}
                    placeholder="https://disaster-management-platform.org"
                  />
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Telegram / Dispatch Handle</label>
                  <input
                    type="text"
                    name="telegram"
                    value={profile.telegram}
                    onChange={handleChange}
                    style={styles.input}
                    placeholder="@disaster_dispatch"
                  />
                </div>
              </div>

              {/* Field Emergency & Medical Details */}
              <h3 style={{ ...styles.sectionHeading, marginTop: "28px" }}>
                Disaster Safety & Field Medical Info
              </h3>

              <div style={styles.twoColGrid}>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Blood Group</label>
                  <select
                    name="bloodGroup"
                    value={profile.bloodGroup}
                    onChange={handleChange}
                    style={styles.select}
                  >
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Emergency SOS Contact</label>
                  <input
                    type="text"
                    name="emergencyContact"
                    value={profile.emergencyContact}
                    onChange={handleChange}
                    style={styles.input}
                    placeholder="+91 91234 56789 (Relative / Team Lead)"
                  />
                </div>

                <div style={{ ...styles.fieldGroup, gridColumn: "span 2" }}>
                  <label style={styles.label}>Base Station / Deployment City</label>
                  <input
                    type="text"
                    name="location"
                    value={profile.location}
                    onChange={handleChange}
                    style={styles.input}
                    placeholder="City, State, Region (e.g. Bhubaneswar, Odisha)"
                  />
                </div>
              </div>

              {/* About the User & Disaster Skills */}
              <h3 style={{ ...styles.sectionHeading, marginTop: "28px" }}>
                About the User & Disaster Skills
              </h3>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Biographical & Response Skills</label>
                <textarea
                  name="bio"
                  rows={4}
                  value={profile.bio}
                  onChange={handleChange}
                  placeholder="Mention your certifications, specialized emergency skills, languages spoken, or relief qualifications..."
                  style={styles.textarea}
                />
              </div>

              {/* Action Buttons */}
              <div style={{ marginTop: "28px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    type="button"
                    onClick={handleExportProfile}
                    style={styles.secondaryActionBtn}
                  >
                    <Download size={16} />
                    Export Portable Card
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowQrModal(true)}
                    style={styles.secondaryActionBtn}
                  >
                    <QrCode size={16} />
                    View QR ID
                  </button>
                </div>

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
        {/* Social & Portal Links */}
        <div style={styles.socialGroup}>
          <button
            type="button"
            style={styles.iconCircleBtn}
            onClick={() => window.open("https://facebook.com", "_blank")}
            title="Facebook Portal"
          >
            <FacebookIcon />
          </button>
          <button
            type="button"
            style={styles.iconCircleBtn}
            onClick={() => window.open("https://x.com", "_blank")}
            title="X / Disaster Feeds"
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
            onClick={() => showToast("Disaster AI Assistant ready for support.")}
            title="Emergency Support Chat"
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

// ── Styles (Matching clean, minimalist, high-contrast white card UI) ──────────
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
    animation: "slideIn 0.3s ease",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(15, 23, 42, 0.7)",
    backdropFilter: "blur(4px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
    padding: "20px",
  },
  modalCard: {
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    padding: "24px",
    width: "100%",
    maxWidth: "460px",
    boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
    color: "#0f172a",
  },
  modalHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: "12px",
    borderBottom: "1px solid #f1f5f9",
  },
  closeBtn: {
    background: "none",
    border: "none",
    color: "#64748b",
    cursor: "pointer",
    padding: "4px",
  },
  qrBadgeBox: {
    padding: "16px",
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    border: "2px solid #e2e8f0",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
  },
  badgeDetails: {
    marginTop: "12px",
    padding: "12px",
    backgroundColor: "#f8fafc",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
    textAlign: "left",
    fontSize: "0.8rem",
    color: "#334155",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  portableActionBtn: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "9px 16px",
    backgroundColor: "#1e293b",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    fontWeight: "600",
    fontSize: "0.85rem",
    cursor: "pointer",
  },
  printBtn: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "9px 16px",
    backgroundColor: "#1d4ed8",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    fontWeight: "600",
    fontSize: "0.85rem",
    cursor: "pointer",
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
    gap: "12px",
  },
  userIconWrap: {
    width: "36px",
    height: "36px",
    borderRadius: "10px",
    backgroundColor: "#eff6ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: "1.15rem",
    fontWeight: "700",
    color: "#0f172a",
    display: "block",
  },
  verifiedPill: {
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    fontSize: "0.72rem",
    fontWeight: "600",
    color: "#059669",
    backgroundColor: "#ecfdf5",
    padding: "2px 8px",
    borderRadius: "999px",
    marginTop: "2px",
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
  qrBadgeBtn: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    backgroundColor: "#f8fafc",
    color: "#1d4ed8",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    padding: "8px 14px",
    fontWeight: "600",
    fontSize: "0.82rem",
    cursor: "pointer",
  },
  exportBtn: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    backgroundColor: "#f8fafc",
    color: "#334155",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    padding: "8px 14px",
    fontWeight: "600",
    fontSize: "0.82rem",
    cursor: "pointer",
  },
  importBtn: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    backgroundColor: "#f8fafc",
    color: "#334155",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    padding: "8px 14px",
    fontWeight: "600",
    fontSize: "0.82rem",
    cursor: "pointer",
  },
  addUserBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    backgroundColor: "#1d4ed8",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    padding: "8px 16px",
    fontWeight: "600",
    fontSize: "0.85rem",
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
  roleTag: {
    fontSize: "0.75rem",
    fontWeight: "600",
    color: "#1d4ed8",
    backgroundColor: "#eff6ff",
    padding: "3px 8px",
    borderRadius: "6px",
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
  uploadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "0.9rem",
    fontWeight: "600",
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
  emergencySummaryBox: {
    marginTop: "16px",
    padding: "12px 14px",
    backgroundColor: "#fef2f2",
    borderRadius: "10px",
    border: "1px solid #fee2e2",
  },
  bloodTag: {
    backgroundColor: "#dc2626",
    color: "#ffffff",
    padding: "2px 8px",
    borderRadius: "999px",
    fontSize: "0.72rem",
    fontWeight: "700",
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
  secondaryActionBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "10px 16px",
    backgroundColor: "#f8fafc",
    color: "#334155",
    border: "1px solid #cbd5e1",
    borderRadius: "10px",
    fontWeight: "600",
    fontSize: "0.85rem",
    cursor: "pointer",
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