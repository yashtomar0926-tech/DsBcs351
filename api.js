// Base URL of the Flask backend. Change this if your backend runs elsewhere.
const API_BASE_URL = "http://127.0.0.1:5000/api";

/**
 * Wrapper around fetch() that always sends the session cookie
 * and parses JSON responses.
 */
async function apiRequest(endpoint, method = "GET", body = null) {
    const options = {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include", // send/receive the Flask session cookie
    };
    if (body) {
        options.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    let data = {};
    try {
        data = await response.json();
    } catch (e) {
        data = {};
    }

    if (!response.ok) {
        throw new Error(data.error || "Something went wrong. Please try again.");
    }
    return data;
}

/** Redirect to login page if the user is not authenticated. Call this on protected pages. */
async function requireAuth() {
    try {
        const data = await apiRequest("/check-auth");
        if (!data.authenticated) {
            window.location.href = "index.html";
        } else {
            const el = document.getElementById("welcome-user");
            if (el) el.textContent = `Hi, ${data.username}`;
        }
    } catch (e) {
        window.location.href = "index.html";
    }
}

function showAlert(elementId, message, type = "error") {
    const el = document.getElementById(elementId);
    if (!el) return;
    el.textContent = message;
    el.className = `alert show alert-${type}`;
}

async function logout() {
    try {
        await apiRequest("/logout", "POST");
    } catch (e) {
        // ignore errors, redirect regardless
    }
    window.location.href = "index.html";
}
