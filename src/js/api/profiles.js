import { apiRequest } from "./client.js";

/**
 * Get a user's profile and credits.
 */
export async function getProfile(name) {
    return await apiRequest(
        `/auction/profiles/${encodeURIComponent(name)}`
    );
}

/**
 * Update a user's bio, avatar and banner.
 */
export async function updateProfile(name, profileData) {
    return await apiRequest(
        `/auction/profiles/${encodeURIComponent(name)}`,
        {
            method: "PUT",
            body: JSON.stringify(profileData)
        }
    );
}

/**
 * Get all listings created by a user.
 */
export async function getProfileListings(name) {
    return await apiRequest(
        `/auction/profiles/${encodeURIComponent(name)}/listings`
    );
}

/**
 * Get all bids made by a user, including the related listings.
 */
export async function getProfileBids(name) {
    return await apiRequest(
        `/auction/profiles/${encodeURIComponent(name)}/bids?_listings=true`
    );
}