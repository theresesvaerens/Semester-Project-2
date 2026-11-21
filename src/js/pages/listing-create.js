import { createListing } from "../API/listings.js";

// Find the form and feedback elements
const createListingForm = document.querySelector("#createListingForm");
const formError = document.querySelector("#formError");
const formSuccess = document.querySelector("#formSuccess");

// Listen for form submission
createListingForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    // Hide previous messages
    formError.classList.add("d-none");
    formSuccess.classList.add("d-none");

    // Get values from the form
    const title = document.querySelector("#listingTitle").value.trim();
    const description = document.querySelector("#listingDescription").value.trim();
    const deadline = document.querySelector("#listingDeadline").value;
    const imageUrl = document.querySelector("#listingImage").value.trim();
    const tagsInput = document.querySelector("#listingTags").value;

    // Convert tags into an array
    const tags = tagsInput
        .split(",")
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

    // Prepare listing data
    const listingData = {
        title,
        description,
        endsAt: new Date(deadline).toISOString(),
        tags,
        media: imageUrl
            ? [{ url: imageUrl, alt: title }]
            : []
    };

    try {
        // Send listing to the API
        await createListing(listingData);

        formSuccess.textContent = "Your listing has been created!";
        formSuccess.classList.remove("d-none");

        createListingForm.reset();

    } catch (error) {
        formError.textContent = error.message;
        formError.classList.remove("d-none");

        console.error("Error creating listing:", error);
    }
});