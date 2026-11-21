import { saveUser, removeUser } from "../utils/storage.js";

const API_BASE = "https://v2.api.noroff.dev";

/**
 * Register a new MODO user.
 */
export async function registerUser(userData) {
    const email = userData.email.trim().toLowerCase();

    if (!email.endsWith("@stud.noroff.no")) {
        throw new Error("You must use a Noroff student email.");
    }

    if (userData.password.length < 8) {
        throw new Error("Password must be at least 8 characters.");
    }

    const response = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            ...userData,
            email
        })
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(
            result.errors?.[0]?.message || "Could not register user."
        );
    }

    return result.data;
}

/**
 * Log in an existing MODO user.
 */
export async function loginUser(email, password) {
    const response = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            email: email.trim().toLowerCase(),
            password
        })
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(
            result.errors?.[0]?.message || "Could not log in."
        );
    }

    // Save the logged-in user's information.
    saveUser(result.data);

    return result.data;
}

/**
 * Log out the current user.
 */
export function logoutUser() {
    removeUser();
}