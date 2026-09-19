let allStudents = [];

function renderStudents(students) {
    const tbody = document.getElementById("student-table-body");
    const emptyState = document.getElementById("empty-state");
    tbody.innerHTML = "";

    if (students.length === 0) {
        emptyState.style.display = "block";
        return;
    }
    emptyState.style.display = "none";

    students.forEach((s) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${escapeHtml(s.roll_no)}</td>
            <td>${escapeHtml(s.name)}</td>
            <td>${escapeHtml(s.email)}</td>
            <td>${escapeHtml(s.phone || "-")}</td>
            <td>${escapeHtml(s.course || "-")}</td>
            <td>${s.year || "-"}</td>
            <td class="actions">
                <a href="edit_student.html?id=${s.id}" class="btn-edit">Edit</a>
                <button class="btn-delete" data-id="${s.id}">Delete</button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    document.querySelectorAll(".btn-delete").forEach((btn) => {
        btn.addEventListener("click", () => deleteStudent(btn.dataset.id));
    });
}

function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
}

async function loadStudents() {
    try {
        const data = await apiRequest("/students");
        allStudents = data.students;
        renderStudents(allStudents);
    } catch (err) {
        showAlert("alert-box", err.message);
    }
}

async function deleteStudent(id) {
    if (!confirm("Are you sure you want to delete this student?")) return;
    try {
        await apiRequest(`/students/${id}`, "DELETE");
        loadStudents();
    } catch (err) {
        showAlert("alert-box", err.message);
    }
}

document.getElementById("search-input").addEventListener("input", (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = allStudents.filter((s) =>
        [s.name, s.roll_no, s.email, s.course].some((field) =>
            (field || "").toLowerCase().includes(term)
        )
    );
    renderStudents(filtered);
});

requireAuth();
loadStudents();
