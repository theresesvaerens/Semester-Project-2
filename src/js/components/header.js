import { getUser, removeUser } from "../Utils/storage.js";

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
                    <a class="nav-action active" href="/index.html">
                        Explore
                    </a>

                    ${
                        isLoggedIn
                            ? `
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
}