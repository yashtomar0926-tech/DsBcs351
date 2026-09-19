document.getElementById("login-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;

    try {
        await apiRequest("/login", "POST", { username, password });
        window.location.href = "dashboard.html";
    } catch (err) {
        showAlert("alert-box", err.message);
    }
});

// If already logged in, skip straight to the dashboard.
(async () => {
    try {
        const data = await apiRequest("/check-auth");
        if (data.authenticated) {
            window.location.href = "dashboard.html";
        }
    } catch (e) {
        // not logged in, stay on login page
    }
})();
