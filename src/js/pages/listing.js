import {
    getListingById,
    deleteListing,
    placeBid
} from "../API/listings.js";

import { getUser } from "../Utils/storage.js";

// Find HTML elements
const loadingMessage = document.querySelector("#loadingMessage");
const errorMessage = document.querySelector("#errorMessage");
const deleteErrorMessage = document.querySelector("#deleteErrorMessage");
const listingDetails = document.querySelector("#listingDetails");

const deleteListingButton = document.querySelector("#deleteListingButton");

const bidForm = document.querySelector("#bidForm");
const bidAmount = document.querySelector("#bidAmount");
const bidError = document.querySelector("#bidError");
const bidSuccess = document.querySelector("#bidSuccess");
const loginToBidMessage = document.querySelector("#loginToBidMessage");

const listingImage = document.querySelector("#listingImage");
const listingTitle = document.querySelector("#listingTitle");
const listingDescription = document.querySelector("#listingDescription");
const listingDeadline = document.querySelector("#listingDeadline");
const listingSeller = document.querySelector("#listingSeller");
const bidHistory = document.querySelector("#bidHistory");

// Get listing ID from URL
const params = new URLSearchParams(window.location.search);
const listingId = params.get("id");

// Get logged-in user
const user = getUser();

// Keep track of the current listing
let currentListing = null;

// Format dates
function formatDate(date) {
    if (!date) return "Not available";

    const formattedDate = new Date(date);

    if (Number.isNaN(formattedDate.getTime())) {
        return "Not available";
    }

    return formattedDate.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric"
    });
}

// Display bid history
function displayBidHistory(bids) {
    bidHistory.replaceChildren();

    if (!bids || bids.length === 0) {
        const message = document.createElement("p");
        message.classList.add("text-muted");
        message.textContent = "No bids have been placed yet.";

        bidHistory.append(message);
        return;
    }

    // Sort bids by date, newest first
    const sortedBids = [...bids].sort((a, b) => {
        return new Date(b.created).getTime() -
            new Date(a.created).getTime();
    });

    const latestBid = sortedBids[0];
    const previousBids = sortedBids.slice(1);

    // Latest bid section
    const latestSection = document.createElement("div");
    latestSection.classList.add(
        "p-3",
        "mb-4",
        "rounded",
        "border",
        "bg-light"
    );

    const latestHeading = document.createElement("h3");
    latestHeading.classList.add("h5", "fw-bold");
    latestHeading.textContent = "Latest bid";

    const latestAmount = document.createElement("p");
    latestAmount.classList.add("fs-3", "fw-bold", "mb-1");
    latestAmount.textContent = `${latestBid.amount} credits`;

    const latestBidder = document.createElement("p");
    latestBidder.classList.add("mb-1");
    latestBidder.textContent =
        `Bidder: ${latestBid.bidder?.name || "Unknown bidder"}`;

    const latestDate = document.createElement("small");
    latestDate.classList.add("text-muted");
    latestDate.textContent = formatDate(latestBid.created);

    latestSection.append(
        latestHeading,
        latestAmount,
        latestBidder,
        latestDate
    );

    bidHistory.append(latestSection);

    // Previous bids heading
    const historyHeading = document.createElement("h3");
    historyHeading.classList.add("h5", "fw-bold");
    historyHeading.textContent = "Previous bids";

    bidHistory.append(historyHeading);

    if (previousBids.length === 0) {
        const message = document.createElement("p");
        message.classList.add("text-muted");
        message.textContent = "This is the first bid.";

        bidHistory.append(message);
        return;
    }

    // Display previous bids
    previousBids.forEach(bid => {
        const bidItem = document.createElement("div");
        bidItem.classList.add("border-bottom", "py-3");

        const bidder = document.createElement("strong");
        bidder.textContent =
            bid.bidder?.name || "Unknown bidder";

        const amount = document.createElement("p");
        amount.classList.add("mb-1");
        amount.textContent = `${bid.amount} credits`;

        const date = document.createElement("small");
        date.classList.add("text-muted");
        date.textContent = formatDate(bid.created);

        bidItem.append(bidder, amount, date);
        bidHistory.append(bidItem);
    });
}

// Get the highest current bid
function getHighestBid(bids) {
    if (!bids || bids.length === 0) {
        return 0;
    }

    return Math.max(...bids.map(bid => Number(bid.amount) || 0));
}

// Check whether the logged-in user owns the listing
function isListingOwner(listing) {
    return Boolean(
        user?.accessToken &&
        listing.seller?.name === user.name
    );
}

// Show the correct actions for the current user
function displayUserActions(listing) {
    if (!user?.accessToken) {
        loginToBidMessage.classList.remove("d-none");
        return;
    }

    if (isListingOwner(listing)) {
        deleteListingButton.classList.remove("d-none");

        loginToBidMessage.textContent =
            "You cannot place a bid on your own listing.";

        loginToBidMessage.classList.remove("d-none");
        return;
    }

    bidForm.classList.remove("d-none");

    // Set the minimum bid to one credit above the highest bid
    bidAmount.min = getHighestBid(listing.bids) + 1;
}

// Delete listing
async function handleDeleteListing() {
    const confirmed = window.confirm(
        "Are you sure you want to delete this listing? This action cannot be undone."
    );

    if (!confirmed) return;

    deleteListingButton.disabled = true;
    deleteListingButton.textContent = "Deleting...";
    deleteErrorMessage.classList.add("d-none");

    try {
        await deleteListing(listingId);

        // Save success message before redirecting
        sessionStorage.setItem(
            "modoMessage",
            "Listing successfully deleted!"
        );

        // Return to homepage
       window.location.href = "/pages/profile.html";

    } catch (error) {
        deleteErrorMessage.textContent =
            "Could not delete listing: " + error.message;

        deleteErrorMessage.classList.remove("d-none");

        deleteListingButton.disabled = false;
        deleteListingButton.textContent = "Delete listing";

        console.error("Error deleting listing:", error);
    }
}

// Place a bid
async function handlePlaceBid(event) {
    event.preventDefault();

    bidError.classList.add("d-none");
    bidSuccess.classList.add("d-none");

    const amount = Number(bidAmount.value);
    const highestBid = getHighestBid(currentListing.bids);

    if (!Number.isInteger(amount) || amount < 1) {
        bidError.textContent = "Please enter a valid whole number.";
        bidError.classList.remove("d-none");
        return;
    }

    if (amount <= highestBid) {
        bidError.textContent =
            `Your bid must be higher than ${highestBid} credits.`;

        bidError.classList.remove("d-none");
        return;
    }

    const submitButton = bidForm.querySelector(
        'button[type="submit"]'
    );

    submitButton.disabled = true;
    submitButton.textContent = "Placing bid...";

    try {
        await placeBid(listingId, amount);

        bidSuccess.textContent =
            "Your bid has been placed successfully!";

        bidSuccess.classList.remove("d-none");

        bidForm.reset();

        // Fetch the listing again to show the updated bid history
        currentListing = await getListingById(listingId);

        displayBidHistory(currentListing.bids);

        bidAmount.min = getHighestBid(currentListing.bids) + 1;

    } catch (error) {
        bidError.textContent =
            "Could not place bid: " + error.message;

        bidError.classList.remove("d-none");

        console.error("Error placing bid:", error);

    } finally {
        submitButton.disabled = false;
        submitButton.textContent = "Place bid";
    }
}

// Display listing information
function displayListing(listing) {
    currentListing = listing;

    listingTitle.textContent =
        listing.title || "Untitled listing";

    listingDescription.textContent =
        listing.description || "No description available.";

    listingDeadline.textContent =
        formatDate(listing.endsAt);

    listingSeller.textContent =
        listing.seller?.name || "Unknown seller";

    // Display listing image
    const firstImage = listing.media?.[0];

    if (firstImage?.url) {
        listingImage.src = firstImage.url;
        listingImage.alt = firstImage.alt || listing.title;
    } else {
        listingImage.src =
            "https://placehold.co/600x400?text=MODO";

        listingImage.alt = "No image available";
    }

    // Display bids and user actions
    displayBidHistory(listing.bids);
    displayUserActions(listing);

    listingDetails.classList.remove("d-none");
}

// Load listing from API
async function loadListing() {
    try {
        if (!listingId) {
            throw new Error("No listing ID found in the URL.");
        }

        const listing = await getListingById(listingId);

        displayListing(listing);

    } catch (error) {
        errorMessage.textContent =
            "Could not load listing: " + error.message;

        errorMessage.classList.remove("d-none");

        console.error("Error loading listing:", error);

    } finally {
        loadingMessage.classList.add("d-none");
    }
}

// Listen for button clicks and form submission
deleteListingButton.addEventListener("click", handleDeleteListing);
bidForm.addEventListener("submit", handlePlaceBid);

// Start loading the listing
loadListing();