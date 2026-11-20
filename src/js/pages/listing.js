import { getListingById } from "../API/listings.js";

// Find HTML elements
const loadingMessage = document.querySelector("#loadingMessage");
const errorMessage = document.querySelector("#errorMessage");
const listingDetails = document.querySelector("#listingDetails");

const listingImage = document.querySelector("#listingImage");
const listingTitle = document.querySelector("#listingTitle");
const listingDescription = document.querySelector("#listingDescription");
const listingDeadline = document.querySelector("#listingDeadline");
const listingSeller = document.querySelector("#listingSeller");
const bidHistory = document.querySelector("#bidHistory");

// Get listing ID from URL
const params = new URLSearchParams(window.location.search);
const listingId = params.get("id");

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

    // Check if there are any bids
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

    // Separate latest bid from previous bids
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

    // Check if there are previous bids
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

// Display listing information
function displayListing(listing) {
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

    // Display bids
    displayBidHistory(listing.bids);

    // Show listing details
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

// Start loading the listing
loadListing();