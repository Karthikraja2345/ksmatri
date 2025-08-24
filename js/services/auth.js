// js/services/auth.js

import { apiPost } from './api.js';

/**
 * Handles the complete user registration process.
 * 1. Creates the user in Firebase Auth.
 * 2. If successful, sends token and profile data to our backend.
 */
export const handleRegistration = async (formData) => {
    const { email, password, confirmPassword, ...profileData } = formData;

    if (password !== confirmPassword) {
        throw new Error("Passwords do not match.");
    }

    try {
        // Step 1: Create user in Firebase Authentication
        const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
        console.log("Step 1: Firebase user created successfully.");

        // Step 2: Call our backend to create the user profile in MongoDB
        // The apiPost function will automatically handle getting the token.
        const backendResponse = await apiPost('/auth/register', profileData);
        console.log("Step 2: Backend profile created successfully.", backendResponse);
        
        return { success: true, user: userCredential.user };

    } catch (error) {
        // This will catch errors from both Firebase and our backend
        console.error("Registration failed:", error);
        throw error; // Let the UI handler catch this to display the message
    }
};

/**
 * Handles user login with Firebase.
 */
export const handleLogin = async (email, password) => {
    try {
        await firebase.auth().signInWithEmailAndPassword(email, password);
        return { success: true };
    } catch (error) {
        console.error("Login failed:", error);
        throw error;
    }
};

/**
 * Handles user logout with Firebase.
 */
export const handleLogout = async () => {
    try {
        await firebase.auth().signOut();
    } catch (error) {
        console.error("Logout failed:", error);
        throw error;
    }
};