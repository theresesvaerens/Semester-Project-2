import { getUser, removeUser } from "../utils/storage.js";
import { getProfile } from "../API/profiles.js";

export function renderHeader() {
    const header = document.querySelector("#siteHeader");

    if (!header) return;

    const user = getUser();
    const isLoggedIn = Boolean(user?.accessToken);

    header.innerHTML = `
        <nav class="navbar navbar-expand-lg modo-navbar">
            <div class="container">
                <a class="navbar-brand modo-logo" href="/index.html">
                    MODO<span>.</span>
                </a>

                <div class="nav-actions">
                    <a class="nav-action" href="/index.html">
                        Explore
                    </a>

                    ${
                        isLoggedIn
                            ? `
                                <span id="creditsBalance" class="credits-balance">
                                    Credits: ...
                                </span>

                                <a href="/pages/profile.html" class="login-link">
                                    My profile
                                </a>

                                <button id="logoutButton" class="btn modo-button">
                                    Log out
                                </button>
                            `
                            : `
                                <a href="/pages/login.html" class="login-link">
                                    Log in
                                </a>

                                <a href="/pages/register.html" class="btn modo-button">
                                    Get started
                                </a>
                            `
                    }
                </div>
            </div>
        </nav>
    `;

    const logoutButton = document.querySelector("#logoutButton");

    if (logoutButton) {
        logoutButton.addEventListener("click", () => {
            removeUser();
            window.location.href = "/index.html";
        });
    }

    // Fetch the logged-in user's credits
    if (isLoggedIn && user.name) {
        getProfile(user.name)
            .then((profile) => {
                const creditsElement = document.querySelector("#creditsBalance");

                if (creditsElement) {
                    creditsElement.textContent = `Credits: ${profile.credits}`;
                }
            })
            .catch((error) => {
                console.error("Could not load credits:", error);

                const creditsElement = document.querySelector("#creditsBalance");

                if (creditsElement) {
                    creditsElement.textContent = "Credits: —";
                }
            });
    }
}