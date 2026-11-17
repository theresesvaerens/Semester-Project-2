
const API_BASE_URL = "https://v2.api.noroff.dev";

// Find the login form
const loginForm = document.querySelector("#loginForm");

// Find the message element
const loginMessage = document.querySelector("#loginMessage");

// Listen for form submission
loginForm.addEventListener("submit", async (event) => {
  // Prevent the page from reloading
  event.preventDefault();

  // Get values from the form
  const email = document.querySelector("#email").value.trim();
  const password = document.querySelector("#password").value;

  // Prepare the login data
  const userData = {
    email,
    password
  };

  try {
    // Send login request to Noroff API
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
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
        result.errors?.[0]?.message || "Invalid email or password."
      );
    }

    // Get user data from the response
    const user = result.data;

    // Make sure we received an access token
    if (!user.accessToken) {
      throw new Error("No access token received.");
    }

    // Store the access token
    localStorage.setItem("accessToken", user.accessToken);

    // Store basic user information
    localStorage.setItem("user", JSON.stringify({
      name: user.name,
      email: user.email
    }));

    // Show success message
    loginMessage.textContent = "You are now logged in!";
    loginMessage.className = "text-success mb-3";

  } catch (error) {
    // Show error message
    loginMessage.textContent = error.message;
    loginMessage.className = "text-danger mb-3";
  }
});
