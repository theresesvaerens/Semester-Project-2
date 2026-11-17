
const API_BASE_URL = "https://v2.api.noroff.dev";

// Find HTML elements
const listingsContainer = document.querySelector("#listingsContainer");
const loadingMessage = document.querySelector("#loadingMessage");
const errorMessage = document.querySelector("#errorMessage");
const emptyMessage = document.querySelector("#emptyMessage");
const searchInput = document.querySelector("#searchInput");

// Store all listings from the API
let allListings = [];

// Fetch listings from Noroff API
async function fetchListings() {
  try {
    const response = await fetch(
      `${API_BASE_URL}/auction/listings?_active=true`
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.errors?.[0]?.message || "Could not load listings."
      );
    }

    allListings = result.data;

    displayListings(allListings);

  } catch (error) {
    errorMessage.textContent = error.message;

  } finally {
    loadingMessage.classList.add("d-none");
  }
}

// Display listings on the page
function displayListings(listings) {
  // Clear previous listings
  listingsContainer.replaceChildren();

  // Show empty message if there are no listings
  if (listings.length === 0) {
    emptyMessage.classList.remove("d-none");
    return;
  }

  emptyMessage.classList.add("d-none");

  // Create a card for each listing
  listings.forEach((listing) => {
    const column = document.createElement("div");
    column.classList.add("col");

    const card = document.createElement("div");
    card.classList.add("card", "h-100");

    // Listing image
    const image = document.createElement("img");
    image.classList.add("card-img-top");
    image.style.height = "220px";
    image.style.objectFit = "cover";

    const firstImage = listing.media?.[0];

    if (firstImage?.url) {
      image.src = firstImage.url;
      image.alt = firstImage.alt || listing.title;
    } else {
      image.src = "https://placehold.co/600x400?text=MODO";
      image.alt = "No image available";
    }

    // Card body
    const cardBody = document.createElement("div");
    cardBody.classList.add("card-body", "d-flex", "flex-column");

    // Listing title
    const title = document.createElement("h2");
    title.classList.add("card-title", "h5");
    title.textContent = listing.title;

    // Listing description
    const description = document.createElement("p");
    description.classList.add("card-text", "text-muted");
    description.textContent =
      listing.description || "No description available.";

    // Listing tags
    const tagsContainer = document.createElement("div");
    tagsContainer.classList.add("mb-3");

    listing.tags?.forEach((tag) => {
      const tagElement = document.createElement("span");
      tagElement.classList.add(
        "badge",
        "text-bg-light",
        "me-1"
      );
      tagElement.textContent = tag;
      tagsContainer.append(tagElement);
    });

    // Number of bids
    const bids = document.createElement("p");
    bids.classList.add("small", "text-muted", "mb-2");

    const bidCount = listing._count?.bids ?? 0;
    bids.textContent = `${bidCount} bids`;

    // Auction end date
    const endDate = document.createElement("p");
    endDate.classList.add("small", "text-muted", "mt-auto");

    const formattedDate = new Date(listing.endsAt).toLocaleDateString(
      "en-GB",
      {
        day: "numeric",
        month: "short",
        year: "numeric"
      }
    );

    endDate.textContent = `Ends: ${formattedDate}`;

    // Add elements to card
    cardBody.append(
      title,
      description,
      tagsContainer,
      bids,
      endDate
    );

    card.append(image, cardBody);
    column.append(card);
    listingsContainer.append(column);
  });
}

// Search listings
searchInput.addEventListener("input", () => {
  const searchTerm = searchInput.value.toLowerCase().trim();

  const filteredListings = allListings.filter((listing) => {
    const title = listing.title.toLowerCase();
    const description = (listing.description || "").toLowerCase();

    return (
      title.includes(searchTerm) ||
      description.includes(searchTerm)
    );
  });

  displayListings(filteredListings);
});

// Load listings when the page opens
fetchListings();
