import { renderHeader } from "../components/header.js";

import {
    getProfile,
    updateProfile,
    getProfileListings,
    getProfileBids
} from "../api/profiles.js";

import { getUser } from "../utils/storage.js";

// Render the shared MODO header
renderHeader();

// HTML elements
const loadingMessage = document.querySelector("#loadingMessage");
const profileError = document.querySelector("#profileError");
const profileContent = document.querySelector("#profileContent");

const profileForm = document.querySelector("#profileForm");
const profileFormError = document.querySelector("#profileFormError");
const profileFormSuccess = document.querySelector("#profileFormSuccess");
const saveProfileButton = document.querySelector("#saveProfileButton");

// Edit profile elements
const editProfileButton = document.querySelector("#editProfileButton");
const editProfileContainer = document.querySelector("#editProfileContainer");
const cancelEditButton = document.querySelector("#cancelEditButton");

// Show success message after creating, editing or deleting a listing
const successMessage = sessionStorage.getItem("modoMessage");

if (successMessage) {
    const messageContainer = document.createElement("div");

    messageContainer.className = "alert alert-success mb-4";
    messageContainer.textContent = successMessage;

    document.querySelector("main").prepend(messageContainer);

    sessionStorage.removeItem("modoMessage");
}

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

// Open edit profile form
editProfileButton.addEventListener("click", () => {
    editProfileContainer.classList.remove("d-none");
    editProfileButton.classList.add("d-none");

    profileFormError.classList.add("d-none");
    profileFormSuccess.classList.add("d-none");
});

// Close edit profile form
cancelEditButton.addEventListener("click", () => {
    editProfileContainer.classList.add("d-none");
    editProfileButton.classList.remove("d-none");

    profileFormError.classList.add("d-none");
    profileFormSuccess.classList.add("d-none");

    // Reset fields to the currently saved profile information
    if (currentProfile) {
        displayProfile(currentProfile);
    }
});

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

    // Update credits in the shared header
    const navCredits = document.querySelector("#creditsBalance");

    if (navCredits) {
        navCredits.textContent =
            `Credits: ${formatCredits(profile.credits)}`;
    }

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
function createListingCard(listing, isOwnListing = false) {
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
    link.href =
        `/pages/listing.html?id=${encodeURIComponent(listing.id)}`;
    link.textContent = "View listing";

    body.append(title, description, link);

    // Edit button only for own listings
    if (isOwnListing) {
        const editLink = document.createElement("a");
        editLink.className = "btn btn-outline-dark btn-sm ms-2";
        editLink.href =
            `/pages/listing-edit.html?id=${encodeURIComponent(listing.id)}`;
        editLink.textContent = "Edit";

        body.append(editLink);
    }

    card.append(image, body);
    column.append(card);

    return column;
}

// Display user's own listings
function displayMyListings(listings) {
    const container = document.querySelector("#myListings");
    container.replaceChildren();

    // Create listing button
    const createColumn = document.createElement("div");
    createColumn.className = "col-12 mb-3";

    const createButton = document.createElement("a");
    createButton.href = "/pages/listing-create.html";
    createButton.className = "btn btn-dark";
    createButton.textContent = "+ Create listing";

    createColumn.append(createButton);
    container.append(createColumn);

    if (!listings || listings.length === 0) {
        const emptyMessage = document.createElement("p");
        emptyMessage.className = "text-muted";
        emptyMessage.textContent =
            "You haven't created any listings yet.";

        container.append(emptyMessage);
        return;
    }

    listings.forEach(listing => {
        container.append(
            createListingCard(listing, true)
        );
    });
}

// Display listings the user has bid on
function displayMyBids(bids) {
    const container = document.querySelector("#myBids");
    container.replaceChildren();

    if (!bids || bids.length === 0) {
        container.textContent =
            "You haven't placed any bids yet.";
        return;
    }

    bids.forEach(bid => {
        const listing = bid.listing || bid;

        if (!listing.id || !listing.title) {
            return;
        }

        const card = createListingCard(listing);
        container.append(card);
    });

    if (!container.children.length) {
        container.textContent =
            "No listings could be displayed.";
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

        // Close edit form after successful save
        editProfileContainer.classList.add("d-none");
        editProfileButton.classList.remove("d-none");

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

// Load profile when page opens
if (user?.accessToken && user?.name) {
    loadProfile();
}