import { loginUser } from "../API/Auth.js";

// Find HTML elements
const loginForm = document.querySelector("#loginForm");
const loginMessage = document.querySelector("#loginMessage");
const loginButton = loginForm.querySelector('button[type="submit"]');

// Handle login form submission
loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    // Clear previous messages
    loginMessage.textContent = "";
    loginMessage.className = "mb-3";

    // Get form values
    const email = document.querySelector("#email").value.trim();
    const password = document.querySelector("#password").value;

    // Basic validation
    if (!email || !password) {
        loginMessage.textContent =
            "Please enter your email and password.";

        loginMessage.className = "text-danger mb-3";
        return;
    }

    // Disable button while logging in
    loginButton.disabled = true;
    loginButton.textContent = "Logging in...";

    try {
        // Log in and save user information
        await loginUser(email, password);

        // Show success message
        loginMessage.textContent = "Login successful!";
        loginMessage.className = "text-success mb-3";

        // Redirect to profile page
        window.location.href = "/pages/profile.html";

    } catch (error) {
        // Show error message
        loginMessage.textContent =
            error.message || "Could not log in. Please try again.";

        loginMessage.className = "text-danger mb-3";

        console.error("Login error:", error);

    } finally {
        // Enable button again
        loginButton.disabled = false;
        loginButton.textContent = "Log in";
    }
});