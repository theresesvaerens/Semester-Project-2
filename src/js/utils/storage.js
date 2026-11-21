const STORAGE_KEY = "modo_user";

/**
 * Save the logged-in user's information.
 */
export function saveUser(user) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

/**
 * Get the logged-in user's information.
 */
export function getUser() {
    const user = localStorage.getItem(STORAGE_KEY);

    return user ? JSON.parse(user) : null;
}

/**
 * Remove the logged-in user's information.
 */
export function removeUser() {
    localStorage.removeItem(STORAGE_KEY);
}