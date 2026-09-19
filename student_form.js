requireAuth();

const params = new URLSearchParams(window.location.search);
const studentId = params.get("id");
const isEditMode = window.location.pathname.includes("edit_student.html");

// If we're on the edit page, load the existing student's data into the form.
if (isEditMode && studentId) {
    (async () => {
        try {
            const data = await apiRequest(`/students/${studentId}`);
            const s = data.student;
            document.getElementById("student-id").value = s.id;
            document.getElementById("roll_no").value = s.roll_no;
            document.getElementById("name").value = s.name;
            document.getElementById("email").value = s.email;
            document.getElementById("phone").value = s.phone || "";
            document.getElementById("course").value = s.course || "";
            document.getElementById("year").value = s.year || "";
            document.getElementById("address").value = s.address || "";
        } catch (err) {
            showAlert("alert-box", err.message);
        }
    })();
}

document.getElementById("student-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const payload = {
        roll_no: document.getElementById("roll_no").value.trim(),
        name: document.getElementById("name").value.trim(),
        email: document.getElementById("email").value.trim(),
        phone: document.getElementById("phone").value.trim(),
        course: document.getElementById("course").value.trim(),
        year: document.getElementById("year").value,
        address: document.getElementById("address").value.trim(),
    };

    try {
        if (isEditMode) {
            await apiRequest(`/students/${studentId}`, "PUT", payload);
        } else {
            await apiRequest("/students", "POST", payload);
        }
        window.location.href = "dashboard.html";
    } catch (err) {
        showAlert("alert-box", err.message);
    }
});
