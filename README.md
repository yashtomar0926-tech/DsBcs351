[README.md](https://github.com/user-attachments/files/32413618/README.md)
# Student Management System

A mini project with a Python Flask + MySQL backend and a plain HTML/CSS/JS frontend.
Includes admin login/registration (session-based auth) and full CRUD for student records.

## Project Structure

```
student_management_system/
├── backend/
│   ├── app.py            # Flask app & all API routes
│   ├── models.py         # SQLAlchemy models (User, Student)
│   ├── config.py         # DB & secret key configuration
│   ├── schema.sql        # Optional manual SQL schema
│   └── requirements.txt  # Python dependencies
└── frontend/
    ├── index.html         # Login page
    ├── register.html      # Registration page
    ├── dashboard.html     # Student list + search
    ├── add_student.html   # Add student form
    ├── edit_student.html  # Edit student form
    ├── css/style.css
    └── js/
        ├── api.js          # Shared fetch() wrapper
        ├── login.js
        ├── register.js
        ├── dashboard.js
        └── student_form.js
```

## 1. Backend Setup

### a) Install MySQL and create the database
Make sure MySQL Server is installed and running, then either:
- Let the app create tables automatically (recommended) — just create the empty database:
  ```sql
  CREATE DATABASE student_management_system;
  ```
- OR run the full `backend/schema.sql` script manually.

### b) Configure DB credentials
Open `backend/config.py` and update:
```python
MYSQL_USER = "root"
MYSQL_PASSWORD = "your_mysql_password"
MYSQL_HOST = "localhost"
MYSQL_DB = "student_management_system"
```
(Alternatively, set them as environment variables: `MYSQL_USER`, `MYSQL_PASSWORD`, etc.)

### c) Install Python dependencies
```bash
cd backend
python -m venv venv
venv\Scripts\activate       # Windows
source venv/bin/activate    # macOS/Linux

pip install -r requirements.txt
```

### d) Run the backend
```bash
python app.py
```
The API will start at **http://127.0.0.1:5000**. Tables are created automatically on first run.

## 2. Frontend Setup

The frontend is plain HTML/CSS/JS — no build step needed. Just open the files in a browser,
or (recommended, to avoid CORS/file:// issues) serve them with a simple local server:

```bash
cd frontend
python -m http.server 5500
```
Then visit **http://127.0.0.1:5500** in your browser.

> If your backend runs on a different host/port, update `API_BASE_URL` at the top of
> `frontend/js/api.js`.

## 3. Using the App

1. Open the frontend → you'll land on the **Login** page.
2. Click **Register** to create your first admin account.
3. Log in → you'll be redirected to the **Dashboard**.
4. Use **+ Add Student** to create records, **Edit/Delete** to manage them, and the
   search box to filter by name, roll number, email, or course.
5. **Logout** clears your session and returns you to the login page.

## API Endpoints Summary

| Method | Endpoint                 | Description                  | Auth required |
|--------|---------------------------|-------------------------------|----------------|
| POST   | /api/register             | Create admin account          | No             |
| POST   | /api/login                 | Log in                        | No             |
| POST   | /api/logout                | Log out                       | Yes            |
| GET    | /api/check-auth            | Check session status          | No             |
| GET    | /api/students               | List / search students       | Yes            |
| GET    | /api/students/<id>          | Get one student               | Yes            |
| POST   | /api/students               | Create a student              | Yes            |
| PUT    | /api/students/<id>           | Update a student              | Yes            |
| DELETE | /api/students/<id>           | Delete a student              | Yes            |

## Notes for your submission / viva
- Passwords are hashed using Werkzeug's `generate_password_hash` (never stored in plain text).
- Auth uses Flask's server-side **session** (cookie-based), checked via a `login_required` decorator on protected routes.
- SQLAlchemy ORM is used instead of raw SQL to prevent SQL injection.
- CORS is enabled with `supports_credentials=True` so the separately-served frontend can send the session cookie.
