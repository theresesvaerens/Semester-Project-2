import { getListings } from "./API/listings.js";
import { createListingCard } from "./components/listingCard.js";

// Find elements in index.html
const listingsContainer = document.querySelector("#listingsContainer");
const loadingMessage = document.querySelector("#loadingMessage");
const errorMessage = document.querySelector("#errorMessage");
const emptyMessage = document.querySelector("#emptyMessage");

// Fetch and display listings
async function displayListings() {
    try {
        const listings = await getListings();

        loadingMessage.classList.add("d-none");

        if (!listings || listings.length === 0) {
            emptyMessage.classList.remove("d-none");
            return;
        }

        listingsContainer.innerHTML = "";

        listings.forEach(listing => {
            const listingCard = createListingCard(listing);
            listingsContainer.appendChild(listingCard);
        });

    } catch (error) {
        loadingMessage.classList.add("d-none");

        errorMessage.textContent =
            "Something went wrong while loading listings.";

        errorMessage.classList.remove("d-none");

        console.error("Error loading listings:", error);
    }
}

// Start the page
displayListings();