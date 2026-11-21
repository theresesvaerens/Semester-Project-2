import { apiRequest } from "./client.js";

/**
 * Fetch all active listings from the Noroff API.
 */
export async function getListings() {
    return await apiRequest("/auction/listings?_active=true");
}

/**
 * Fetch one listing by its ID.
 */
export async function getListingById(id) {
    return await apiRequest(
        `/auction/listings/${encodeURIComponent(id)}?_seller=true&_bids=true`
    );
}

/**
 * Create a new listing.
 */
export async function createListing(listingData) {
    return await apiRequest("/auction/listings", {
        method: "POST",
        body: JSON.stringify(listingData)
    });
}

/**
 * Update an existing listing.
 */
export async function updateListing(id, listingData) {
    return await apiRequest(
        `/auction/listings/${encodeURIComponent(id)}`,
        {
            method: "PUT",
            body: JSON.stringify(listingData)
        }
    );
}

/**
 * Delete an existing listing.
 */
export async function deleteListing(id) {
    return await apiRequest(
        `/auction/listings/${encodeURIComponent(id)}`,
        {
            method: "DELETE"
        }
    );
}