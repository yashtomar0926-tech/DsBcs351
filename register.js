document.getElementById("register-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    try {
        await apiRequest("/register", "POST", { username, email, password });
        window.location.href = "index.html";
    } catch (err) {
        showAlert("alert-box", err.message);
    }
});
