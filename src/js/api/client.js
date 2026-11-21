import { getUser } from "../Utils/storage.js";

const API_BASE = "https://v2.api.noroff.dev";

// Get API key from the .env file
const API_KEY = import.meta.env?.VITE_API_KEY;

/**
 * Send requests to the Noroff API.
 * Automatically adds API key and access token.
 */
export async function apiRequest(endpoint, options = {}) {
    const user = getUser();

    // Check that API key exists
    if (!API_KEY) {
        throw new Error(
            "API key is missing. Check your .env file and restart Vite."
        );
    }

    // Set request headers
    const headers = {
        "Content-Type": "application/json",
        "X-Noroff-API-Key": API_KEY.trim(),
        ...options.headers
    };

    // Add access token if user is logged in
    if (user?.accessToken) {
        headers.Authorization = `Bearer ${user.accessToken}`;
    }

    // Send request
    const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers
    });

    // Read response as text first
    const responseText = await response.text();

    // Convert JSON response when content exists
    let result = {};

    if (responseText) {
        try {
            result = JSON.parse(responseText);
        } catch {
            throw new Error("The API returned an invalid response.");
        }
    }

    // Handle API errors
    if (!response.ok) {
        const errorMessage =
            result.errors?.[0]?.message || "API request failed.";

        throw new Error(errorMessage);
    }

    // Return data if available
    return result.data;
}