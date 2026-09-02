import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
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

export async function logoutUser() {
    await signOut(auth);
}

export async function resetPassword(email) {
    await sendPasswordResetEmail(auth, email);
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