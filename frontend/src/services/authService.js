import { saveOfflineSession, clearOfflineSession } from "../utils/offlineStorage";

const AUTH_EVENT = "auth-change";

export const getCurrentUser = () => {
  try {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      return JSON.parse(userStr);
    }
    const profileStr = localStorage.getItem("user_profile_data_v2");
    if (profileStr) {
      const prof = JSON.parse(profileStr);
      return {
        uid: prof.username || "local-user",
        name: prof.displayName || `${prof.firstName || ""} ${prof.lastName || ""}`.trim(),
        email: prof.email,
        role: prof.role || "user",
        photoUrl: prof.photoUrl,
      };
    }
  } catch (err) {
    console.warn("[Auth] Error getting current user:", err);
  }
  return null;
};

export const isUserLoggedIn = () => {
  try {
    const isExplicit = localStorage.getItem("isUserLoggedIn") === "true";
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    return Boolean(isExplicit || (token && user));
  } catch {
    return false;
  }
};

export const loginSession = async (userData, token) => {
  try {
    const effectiveToken = token || `token-${Date.now()}`;
    const effectiveUser = {
      uid: userData.uid || userData.id || `user-${Date.now()}`,
      name: userData.name || userData.displayName || (userData.email ? userData.email.split("@")[0] : "Responder"),
      email: userData.email,
      role: userData.role || "user",
      photoUrl: userData.photoUrl || userData.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(userData.name || userData.email || "User")}`,
      profileImage: userData.photoUrl || userData.profileImage,
    };

    localStorage.setItem("token", effectiveToken);
    localStorage.setItem("user", JSON.stringify(effectiveUser));
    localStorage.setItem("isUserLoggedIn", "true");
    if (effectiveUser.role === "admin") {
      localStorage.setItem("isAdminLoggedIn", "true");
    }

    await saveOfflineSession(effectiveUser);

    window.dispatchEvent(new CustomEvent(AUTH_EVENT, { detail: { loggedIn: true, user: effectiveUser } }));
    return effectiveUser;
  } catch (err) {
    console.error("[Auth] Login error:", err);
    throw err;
  }
};

export const logoutSession = async () => {
  try {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("isUserLoggedIn");
    localStorage.removeItem("isAdminLoggedIn");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userEmail");

    await clearOfflineSession();

    window.dispatchEvent(new CustomEvent(AUTH_EVENT, { detail: { loggedIn: false, user: null } }));
  } catch (err) {
    console.error("[Auth] Logout error:", err);
  }
};

export const subscribeToAuthChange = (callback) => {
  const handler = (e) => {
    callback(e.detail || { loggedIn: isUserLoggedIn(), user: getCurrentUser() });
  };
  window.addEventListener(AUTH_EVENT, handler);
  window.addEventListener("storage", handler);

  return () => {
    window.removeEventListener(AUTH_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
};
