import { getListings } from "./API/listings.js";
import { createListingCard } from "./components/listingCard.js";

const listingsContainer = document.querySelector("#listingsContainer");
const loadingMessage = document.querySelector("#loadingMessage");
const errorMessage = document.querySelector("#errorMessage");
const emptyMessage = document.querySelector("#emptyMessage");
const searchInput = document.querySelector("#searchInput");
const categoryFilter = document.querySelector("#categoryFilter");

let allListings = [];

// Display listings
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

// Add available tags to the category dropdown
function populateCategories() {
    const categories = [
        ...new Set(
            allListings.flatMap(listing => listing.tags || [])
        )
    ];

    categories.sort();

    categories.forEach(category => {
        const option = document.createElement("option");
        option.value = category;
        option.textContent = category;

        categoryFilter.appendChild(option);
    });
}

// Search and filter listings
function filterListings() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    const selectedCategory = categoryFilter.value;

    const filteredListings = allListings.filter(listing => {
        const title = listing.title?.toLowerCase() || "";
        const description = listing.description?.toLowerCase() || "";

        const matchesSearch =
            title.includes(searchTerm) ||
            description.includes(searchTerm);

        const matchesCategory =
            !selectedCategory ||
            (listing.tags || []).includes(selectedCategory);

        return matchesSearch && matchesCategory;
    });

    displayListings(filteredListings);
}

// Fetch listings
async function loadListings() {
    try {
        allListings = await getListings() || [];

        loadingMessage.classList.add("d-none");

        populateCategories();
        displayListings(allListings);

    } catch (error) {
        loadingMessage.classList.add("d-none");
        errorMessage.textContent =
            "Something went wrong while loading listings.";
        errorMessage.classList.remove("d-none");

        console.error("Error loading listings:", error);
    }
}

// Listen for user input
searchInput.addEventListener("input", filterListings);
categoryFilter.addEventListener("change", filterListings);

// Start page
loadListings();