import { renderHeader } from "../components/header.js";

import {
    getListingById,
    updateListing
} from "../api/listings.js";

import { getUser } from "../utils/storage.js";

// Render the shared header
renderHeader();

// Find the elements we need from the HTML.
const editListingForm = document.querySelector("#editListingForm");
const loadingMessage = document.querySelector("#loadingMessage");
const formError = document.querySelector("#formError");

// Get the listing ID from the URL.
const params = new URLSearchParams(window.location.search);
const listingId = params.get("id");

// Get the logged-in user.
const user = getUser();

// Show an error message.
function showError(message) {
    formError.textContent = message;
    formError.classList.remove("d-none");
}

// Hide previous messages.
function hideMessages() {
    formError.classList.add("d-none");
}

// Load the listing and fill in the form.
async function loadListing() {
    try {
        if (!user?.accessToken) {
            throw new Error("You must be logged in to edit a listing.");
        }

        if (!listingId) {
            throw new Error("No listing ID was found.");
        }

        const listing = await getListingById(listingId);

        // Check that the logged-in user owns this listing.
        if (listing.seller?.name !== user.name) {
            throw new Error("You can only edit your own listings.");
        }

        document.querySelector("#listingTitle").value =
            listing.title || "";

        document.querySelector("#listingDescription").value =
            listing.description || "";

        // Convert the date to the format required by datetime-local.
        if (listing.endsAt) {
            const date = new Date(listing.endsAt);

            const localDate = new Date(
                date.getTime() - date.getTimezoneOffset() * 60000
            );

            document.querySelector("#listingDeadline").value =
                localDate.toISOString().slice(0, 16);
        }

        document.querySelector("#listingImage").value =
            listing.media?.[0]?.url || "";

        document.querySelector("#listingTags").value =
            listing.tags?.join(", ") || "";

        loadingMessage.classList.add("d-none");
        editListingForm.classList.remove("d-none");

    } catch (error) {
        loadingMessage.classList.add("d-none");
        showError(error.message);

        console.error("Error loading listing:", error);
    }
}

// Save the updated listing.
editListingForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    hideMessages();

    const title = document.querySelector("#listingTitle").value.trim();

    const description =
        document.querySelector("#listingDescription").value.trim();

    const deadline = document.querySelector("#listingDeadline").value;

    const imageUrl = document.querySelector("#listingImage").value.trim();

    const tagsInput = document.querySelector("#listingTags").value;

    const tags = tagsInput
        .split(",")
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

    try {
        if (!deadline || new Date(deadline) <= new Date()) {
            throw new Error("Please choose a future auction end date.");
        }

        const listingData = {
            title,
            description,
            endsAt: new Date(deadline).toISOString(),
            tags,
            media: imageUrl
                ? [{ url: imageUrl, alt: title }]
                : []
        };

        // Update the listing.
        await updateListing(listingId, listingData);

        // Save success message before redirecting.
        sessionStorage.setItem(
            "modoMessage",
            "Listing successfully updated!"
        );

        // Redirect to profile page.
        window.location.href = "/pages/profile.html";

    } catch (error) {
        showError(error.message);

        console.error("Error updating listing:", error);
    }
});

// Load the listing when the page opens.
loadListing();