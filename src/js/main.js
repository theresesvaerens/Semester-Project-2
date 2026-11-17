import { getListings } from "./API/listings.js";

const listingsContainer = document.querySelector("#listingsContainer");
const loadingMessage = document.querySelector("#loadingMessage");
const errorMessage = document.querySelector("#errorMessage");
const emptyMessage = document.querySelector("#emptyMessage");

async function displayListings() {
    try {
        const listings = await getListings();

        loadingMessage.classList.add("d-none");

        if (!listings || listings.length === 0) {
            emptyMessage.classList.remove("d-none");
            return;
        }

        listingsContainer.innerHTML = listings.map(listing => `
            <div class="col-12 col-md-6 col-lg-4">
                <div class="card h-100">
                    <img
                        src="${listing.media?.[0]?.url || "https://placehold.co/600x400?text=MODO"}"
                        class="card-img-top"
                        alt="${listing.title}"
                    >

                    <div class="card-body">
                        <h5 class="card-title">${listing.title}</h5>

                        <p class="card-text">
                            ${listing.description || "No description available."}
                        </p>

                        <p class="fw-bold mb-0">
                            ${listing._count?.bids ?? 0} bids
                        </p>
                    </div>
                </div>
            </div>
        `).join("");

    } catch (error) {
        loadingMessage.classList.add("d-none");
        errorMessage.textContent = "Something went wrong while loading listings.";
        errorMessage.classList.remove("d-none");

        console.error(error);
    }
}

displayListings();