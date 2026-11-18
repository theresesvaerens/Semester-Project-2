export function createListingCard(listing) {
    const imageUrl = listing.media?.[0]?.url;

    const image = imageUrl || "https://placehold.co/600x400?text=MODO";

    const card = document.createElement("div");
    card.className = "col-12 col-md-6 col-lg-4";

    card.innerHTML = `
        <article class="card listing-card h-100">

            <img
                src="${image}"
                class="card-img-top"
                alt="${listing.title || "Listing image"}"
                loading="lazy"
            >

            <div class="card-body">

                <h3 class="card-title">
                    ${listing.title || "Untitled listing"}
                </h3>

                <p class="card-text">
                    ${listing.description || "No description available."}
                </p>

                <div class="mt-auto">
                    <p class="small text-muted mb-2">
                        ${listing._count?.bids ?? 0} bids
                    </p>

                    <a
                        href="/pages/listing.html?id=${encodeURIComponent(listing.id)}"
                        class="btn modo-button w-100"
                    >
                        View listing
                    </a>
                </div>

            </div>
        </article>
    `;

    return card;
}