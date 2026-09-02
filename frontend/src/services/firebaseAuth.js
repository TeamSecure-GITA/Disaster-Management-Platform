import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    signOut,
    onAuthStateChanged,
    sendPasswordResetEmail,
    updateProfile
} from "firebase/auth";

import { auth } from "../firebase";

export async function registerUser(
    email,
    password,
    displayName = ""
) {
    const result = await createUserWithEmailAndPassword(
        auth,
        email,
        password
    );

    if (displayName) {
        await updateProfile(result.user, {
            displayName
        });
    }

    return result.user;
}

export async function loginUser(email, password) {
    const result = await signInWithEmailAndPassword(
        auth,
        email,
        password
    );

    return result.user;
}

/**
 * Sign in with Google OAuth popup.
 * Returns the Firebase user object on success.
 */
export async function loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    provider.addScope("profile");
    provider.addScope("email");
    // Force account picker even if the user is already signed in
    provider.setCustomParameters({ prompt: "select_account" });

    const result = await signInWithPopup(auth, provider);
    return result.user;
}

export async function logoutUser() {
    await signOut(auth);
}

export async function resetPassword(email) {
    await sendPasswordResetEmail(auth, email);
}

export async function updateUserPassword(newPassword) {
    const user = auth.currentUser;
    if (!user) {
        throw new Error("No authenticated user found. Please sign in again.");
    }
    const { updatePassword } = await import("firebase/auth");
    await updatePassword(user, newPassword);
}

export async function updateUserProfilePhoto(photoURL, displayName) {
    const user = auth.currentUser;
    if (!user) return null;
    const updates = {};
    if (photoURL) updates.photoURL = photoURL;
    if (displayName) updates.displayName = displayName;
    await updateProfile(user, updates);
    return user;
}

export function listenToAuth(callback) {
    return onAuthStateChanged(auth, callback);
}

export function getCurrentUser() {
    return auth.currentUser;
}

export async function getAuthToken() {
    const user = auth.currentUser;

    if (!user) {
        return null;
    }

    return await user.getIdToken();
}