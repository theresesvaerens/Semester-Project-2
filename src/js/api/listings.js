const API_BASE = "https://v2.api.noroff.dev";

/**
 * Fetch all active listings from the Noroff API.
 */
export async function getListings() {
    const response = await fetch(
        `${API_BASE}/auction/listings?_active=true`
    );

    if (!response.ok) {
        throw new Error("Could not fetch listings.");
    }

    const result = await response.json();

    return result.data;
}