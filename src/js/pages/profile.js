import {
    getProfile,
    updateProfile,
    getProfileListings,
    getProfileBids
} from "../API/profiles.js";

import { getUser } from "../Utils/storage.js";
import { logoutUser } from "../API/Auth.js";

// HTML elements
const loadingMessage = document.querySelector("#loadingMessage");
const profileError = document.querySelector("#profileError");
const profileContent = document.querySelector("#profileContent");

const profileForm = document.querySelector("#profileForm");
const profileFormError = document.querySelector("#profileFormError");
const profileFormSuccess = document.querySelector("#profileFormSuccess");
const saveProfileButton = document.querySelector("#saveProfileButton");

const logoutButton = document.querySelector("#logoutButton");

const user = getUser();

let currentProfile = null;

// Check login status
if (!user?.accessToken || !user?.name) {
    window.location.href = "/pages/login.html";
}

// Format credits
function formatCredits(amount) {
    return Number(amount || 0).toLocaleString("en-US");
}

// Display profile information
function displayProfile(profile) {
    currentProfile = profile;

    document.querySelector("#profileName").textContent =
        profile.name || user.name;

    document.querySelector("#profileEmail").textContent =
        profile.email || user.email || "";

    document.querySelector("#profileBio").textContent =
        profile.bio || "No bio added yet.";

    document.querySelector("#profileCredits").textContent =
        formatCredits(profile.credits);

    document.querySelector("#navCredits").textContent =
        `Credits: ${formatCredits(profile.credits)}`;

    const avatar = document.querySelector("#profileAvatar");
    const banner = document.querySelector("#profileBanner");

    avatar.src = profile.avatar?.url ||
        "https://placehold.co/120x120?text=M";

    avatar.onerror = () => {
        avatar.src = "https://placehold.co/120x120?text=M";
    };

    banner.src = profile.banner?.url ||
        "https://placehold.co/1200x300?text=MODO";

    banner.onerror = () => {
        banner.src = "https://placehold.co/1200x300?text=MODO";
    };

    // Fill in edit form
    document.querySelector("#profileBioInput").value =
        profile.bio || "";

    document.querySelector("#avatarInput").value =
        profile.avatar?.url || "";

    document.querySelector("#bannerInput").value =
        profile.banner?.url || "";
}

// Create a listing card
function createListingCard(listing) {
    const column = document.createElement("div");
    column.className = "col-md-6 col-lg-4";

    const card = document.createElement("div");
    card.className = "card h-100 border-0 shadow-sm";

    const image = document.createElement("img");
    image.className = "card-img-top";
    image.style.height = "200px";
    image.style.objectFit = "cover";
    image.src = listing.media?.[0]?.url ||
        "https://placehold.co/600x400?text=MODO";
    image.alt = listing.media?.[0]?.alt || listing.title || "Listing";

    image.onerror = () => {
        image.src = "https://placehold.co/600x400?text=MODO";
    };

    const body = document.createElement("div");
    body.className = "card-body";

    const title = document.createElement("h3");
    title.className = "h5 fw-bold";
    title.textContent = listing.title || "Untitled listing";

    const description = document.createElement("p");
    description.className = "text-muted";
    description.textContent =
        listing.description || "No description available.";

    const link = document.createElement("a");
    link.className = "btn btn-dark btn-sm";
    link.href = `/pages/listing.html?id=${encodeURIComponent(listing.id)}`;
    link.textContent = "View listing";

    body.append(title, description, link);
    card.append(image, body);
    column.append(card);

    return column;
}

// Display user's own listings
function displayMyListings(listings) {
    const container = document.querySelector("#myListings");
    container.replaceChildren();

    if (!listings || listings.length === 0) {
        container.textContent = "You haven't created any listings yet.";
        return;
    }

    listings.forEach(listing => {
        container.append(createListingCard(listing));
    });
}

// Display listings the user has bid on
function displayMyBids(bids) {
    const container = document.querySelector("#myBids");
    container.replaceChildren();

    if (!bids || bids.length === 0) {
        container.textContent = "You haven't placed any bids yet.";
        return;
    }

    bids.forEach(bid => {
        // The API returns the related listing when _listings=true.
        const listing = bid.listing || bid;

        if (!listing.id || !listing.title) {
            return;
        }

        const card = createListingCard(listing);
        container.append(card);
    });

    if (!container.children.length) {
        container.textContent = "No listings could be displayed.";
    }
}

// Load all profile information
async function loadProfile() {
    try {
        const [profile, listings, bids] = await Promise.all([
            getProfile(user.name),
            getProfileListings(user.name),
            getProfileBids(user.name)
        ]);

        displayProfile(profile);
        displayMyListings(listings);
        displayMyBids(bids);

        profileContent.classList.remove("d-none");

    } catch (error) {
        profileError.textContent =
            "Could not load your profile: " + error.message;

        profileError.classList.remove("d-none");

        console.error("Error loading profile:", error);

    } finally {
        loadingMessage.classList.add("d-none");
    }
}

// Save profile changes
profileForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    profileFormError.classList.add("d-none");
    profileFormSuccess.classList.add("d-none");

    const bio = document.querySelector("#profileBioInput").value.trim();
    const avatarUrl = document.querySelector("#avatarInput").value.trim();
    const bannerUrl = document.querySelector("#bannerInput").value.trim();

    if (bio.length >= 160) {
        profileFormError.textContent =
            "Your bio must be shorter than 160 characters.";

        profileFormError.classList.remove("d-none");
        return;
    }

    const profileData = {
        bio,
        avatar: avatarUrl
            ? { url: avatarUrl, alt: `${user.name}'s avatar` }
            : null,
        banner: bannerUrl
            ? { url: bannerUrl, alt: `${user.name}'s banner` }
            : null
    };

    saveProfileButton.disabled = true;
    saveProfileButton.textContent = "Saving...";

    try {
        const updatedProfile = await updateProfile(
            user.name,
            profileData
        );

        displayProfile(updatedProfile);

        profileFormSuccess.textContent =
            "Your profile has been updated successfully.";

        profileFormSuccess.classList.remove("d-none");

    } catch (error) {
        profileFormError.textContent =
            "Could not update profile: " + error.message;

        profileFormError.classList.remove("d-none");

        console.error("Error updating profile:", error);

    } finally {
        saveProfileButton.disabled = false;
        saveProfileButton.textContent = "Save changes";
    }
});

// Log out
logoutButton.addEventListener("click", () => {
    logoutUser();
    window.location.href = "/pages/login.html";
});

// Load profile when page opens
if (user?.accessToken && user?.name) {
    loadProfile();
}