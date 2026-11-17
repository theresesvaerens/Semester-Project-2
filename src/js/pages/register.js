
const API_BASE_URL = "https://v2.api.noroff.dev";

// Find the registration form
const registerForm = document.querySelector("#registerForm");

// Find the message element
const registerMessage = document.querySelector("#registerMessage");

// Listen for form submission
registerForm.addEventListener("submit", async (event) => {
  // Prevent the page from reloading
  event.preventDefault();

  // Get values from the form
  const name = document.querySelector("#name").value.trim();
  const email = document.querySelector("#email").value.trim();
  const password = document.querySelector("#password").value;
  const confirmPassword = document.querySelector("#confirmPassword").value;

  // Check that passwords match
  if (password !== confirmPassword) {
    registerMessage.textContent = "Passwords do not match.";
    registerMessage.className = "text-danger mb-3";
    return;
  }

  // Prepare the data for the API
  const userData = {
    name,
    email,
    password
  };

  try {
    // Send registration request
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(userData)
    });

    const result = await response.json();

    // Check if the request was successful
    if (!response.ok) {
      throw new Error(
        result.errors?.[0]?.message || "Something went wrong."
      );
    }

    // Show success message
    registerMessage.textContent =
      "Your account has been created! You can now log in.";

    registerMessage.className = "text-success mb-3";

    // Reset the form
    registerForm.reset();

  } catch (error) {
    // Show error message
    registerMessage.textContent = error.message;
    registerMessage.className = "text-danger mb-3";
  }
});
