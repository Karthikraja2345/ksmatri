// js/services/api.js

import { API_BASE_URL } from '../config.js';

// Helper to get the auth token for any request
async function getAuthHeaders() {
    const user = firebase.auth().currentUser;
    if (!user) {
        throw new Error("User not authenticated.");
    }
    const idToken = await user.getIdToken();
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`
    };
}

// --- NEW FUNCTION ---
export const apiGet = async (endpoint) => {
    try {
        const headers = await getAuthHeaders();
        const response = await fetch(`${API_BASE_URL}/api${endpoint}`, {
            method: 'GET',
            headers
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'API GET request failed.');
        }
        return response.json();
    } catch (error) {
        console.error(`API Error on GET ${endpoint}:`, error);
        throw error;
    }
};

// ... (keep the existing apiPost function, but we can refactor it slightly)

export const apiPost = async (endpoint, body) => {
    try {
        const headers = await getAuthHeaders();
        const response = await fetch(`${API_BASE_URL}/api${endpoint}`, {
            method: 'POST',
            headers,
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'API POST request failed');
        }

        return response.json();

    } catch (error) {
        console.error(`API Error on POST ${endpoint}:`, error);
        throw error;
    }
};

// --- CORRECTED FUNCTION for updates ---
export const apiPut = async (endpoint, body) => {
    try {
        const headers = await getAuthHeaders();

        // THE FIX IS HERE: Ensure the URL is constructed correctly
        // without any extra characters.
        const response = await fetch(`${API_BASE_URL}/api${endpoint}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            // response.statusText will contain "Not Found" for a 404
            const errorData = await response.json();
            // We use the server's specific message if available, otherwise a generic one
            throw new Error(errorData.message || response.statusText);
        }

        return response.json();

    } catch (error) {
        console.error(`API Error on PUT ${endpoint}:`, error);
        throw error;
    }
};