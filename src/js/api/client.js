import { getUser } from "../Utils/storage.js";

const API_BASE = "https://v2.api.noroff.dev";

// Get the API key from the project environment.
const API_KEY = import.meta.env.VITE_API_KEY;

/**
 * Send a request to the Noroff API.
 */
export async function apiRequest(endpoint, options = {}) {
    const user = getUser();

    const headers = {
        "Content-Type": "application/json",
        "X-Noroff-API-Key": API_KEY,
        ...options.headers
    };

    // Add the access token when a user is logged in.
    if (user?.accessToken) {
        headers.Authorization = `Bearer ${user.accessToken}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(
            result.errors?.[0]?.message || "API request failed."
        );
    }

    return result.data;
}