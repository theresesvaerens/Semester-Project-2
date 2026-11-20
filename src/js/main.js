import { getListings } from "./API/listings.js";
import { createListingCard } from "./components/listingCard.js";

// Find elements in index.html
const listingsContainer = document.querySelector("#listingsContainer");
const loadingMessage = document.querySelector("#loadingMessage");
const errorMessage = document.querySelector("#errorMessage");
const emptyMessage = document.querySelector("#emptyMessage");
const searchInput = document.querySelector("#searchInput");

// Store all listings from the API
let allListings = [];

// Display listings on the page
function displayListings(listings) {
    listingsContainer.innerHTML = "";

    if (!listings || listings.length === 0) {
        emptyMessage.classList.remove("d-none");
        return;
    }

    emptyMessage.classList.add("d-none");

    listings.forEach(listing => {
        const listingCard = createListingCard(listing);
        listingsContainer.appendChild(listingCard);
    });
}

// Search listings
function searchListings() {
    const searchTerm = searchInput.value.toLowerCase().trim();

    const filteredListings = allListings.filter(listing => {
        const title = listing.title?.toLowerCase() || "";
        const description = listing.description?.toLowerCase() || "";

        return title.includes(searchTerm) ||
               description.includes(searchTerm);
    });

    displayListings(filteredListings);
}

// Fetch listings from the API
async function loadListings() {
    try {
        const listings = await getListings();

        allListings = listings || [];

        loadingMessage.classList.add("d-none");

        displayListings(allListings);

    } catch (error) {
        loadingMessage.classList.add("d-none");

        errorMessage.textContent =
            "Something went wrong while loading listings.";

        errorMessage.classList.remove("d-none");

        console.error("Error loading listings:", error);
    }
}

// Listen for typing in the search field
searchInput.addEventListener("input", searchListings);

// Start the page
loadListings();